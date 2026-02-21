use std::sync::Arc;

use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use reqwest::Client;
use serde::Deserialize;
use serde_json::json;

pub type SharedClient = Arc<Client>;

// ── query param structs ───────────────────────────────────────────────────────

/// Common Subsonic authentication parameters forwarded from the frontend.
/// The frontend pre-computes `t = md5(password + s)` so the raw password is
/// never sent to this proxy.
#[derive(Deserialize)]
pub struct SubsonicCreds {
    /// Base URL of the Subsonic server (e.g. https://your-server)
    pub server: String,
    /// Subsonic username
    pub u: String,
    /// Authentication token: md5(password + s)
    pub t: String,
    /// Random salt used to compute `t`
    pub s: String,
}

#[derive(Deserialize)]
pub struct SearchParams {
    pub server: String,
    pub u: String,
    pub t: String,
    pub s: String,
    pub query: String,
}

#[derive(Deserialize)]
pub struct CoverArtParams {
    pub server: String,
    pub u: String,
    pub t: String,
    pub s: String,
    pub size: Option<u32>,
}

// ── helpers ───────────────────────────────────────────────────────────────────

/// Validate that `server` looks like an http(s) URL and does not target
/// localhost or private/internal IP ranges to mitigate SSRF attacks.
fn validate_server(server: &str) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    let s = server.trim();
    if !s.starts_with("http://") && !s.starts_with("https://") {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "server must be an http or https URL" })),
        ));
    }

    // Extract host (strip scheme and any path/port)
    let host = s
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .split('/')
        .next()
        .unwrap_or("")
        .split(':')
        .next()
        .unwrap_or("")
        .to_lowercase();

    // Block localhost and common private/internal hostnames
    let blocked_hosts = ["localhost", "0.0.0.0", "::1", "[::1]"];
    if blocked_hosts.contains(&host.as_str()) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "server must not target internal addresses" })),
        ));
    }

    // Block private IP ranges (best-effort string check)
    if let Ok(addr) = host.parse::<std::net::IpAddr>() {
        let blocked = match addr {
            std::net::IpAddr::V4(ip) => {
                let o = ip.octets();
                // 127.x.x.x, 10.x.x.x, 192.168.x.x, 169.254.x.x,
                // 172.16-31.x.x, 0.x.x.x
                o[0] == 127
                    || o[0] == 10
                    || (o[0] == 192 && o[1] == 168)
                    || (o[0] == 169 && o[1] == 254)
                    || (o[0] == 172 && (16..=31).contains(&o[1]))
                    || o[0] == 0
            }
            std::net::IpAddr::V6(ip) => {
                ip.is_loopback() || ip.is_unspecified()
                // ULA: fc00::/7 covers fd00::/8
                || (ip.segments()[0] & 0xfe00 == 0xfc00)
            }
        };
        if blocked {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": "server must not target internal addresses" })),
            ));
        }
    }

    Ok(())
}

fn bad_gateway(msg: impl std::fmt::Display) -> Response {
    (
        StatusCode::BAD_GATEWAY,
        Json(json!({ "error": msg.to_string() })),
    )
        .into_response()
}

// ── handlers ─────────────────────────────────────────────────────────────────

/// Proxy: GET /api/subsonic/ping
pub async fn ping(
    State(client): State<SharedClient>,
    Query(creds): Query<SubsonicCreds>,
) -> impl IntoResponse {
    if let Err(e) = validate_server(&creds.server) {
        return e.into_response();
    }
    let base = creds.server.trim_end_matches('/');
    let url = format!("{}/rest/ping.view", base);
    match client
        .get(&url)
        .query(&[
            ("u", creds.u.as_str()),
            ("t", creds.t.as_str()),
            ("s", creds.s.as_str()),
            ("v", "1.16.1"),
            ("c", "lastfm-dashboard"),
            ("f", "json"),
        ])
        .send()
        .await
    {
        Ok(resp) => match resp.json::<serde_json::Value>().await {
            Ok(data) => Json(data).into_response(),
            Err(e) => bad_gateway(e),
        },
        Err(e) => bad_gateway(e),
    }
}

/// Proxy: GET /api/subsonic/search?query=...
/// Calls Subsonic search3.view and returns the raw JSON response.
pub async fn search(
    State(client): State<SharedClient>,
    Query(params): Query<SearchParams>,
) -> impl IntoResponse {
    if let Err(e) = validate_server(&params.server) {
        return e.into_response();
    }
    let base = params.server.trim_end_matches('/');
    let url = format!("{}/rest/search3.view", base);
    match client
        .get(&url)
        .query(&[
            ("u", params.u.as_str()),
            ("t", params.t.as_str()),
            ("s", params.s.as_str()),
            ("v", "1.16.1"),
            ("c", "lastfm-dashboard"),
            ("f", "json"),
            ("query", params.query.as_str()),
            ("artistCount", "1"),
            ("albumCount", "1"),
            ("songCount", "1"),
        ])
        .send()
        .await
    {
        Ok(resp) => match resp.json::<serde_json::Value>().await {
            Ok(data) => Json(data).into_response(),
            Err(e) => bad_gateway(e),
        },
        Err(e) => bad_gateway(e),
    }
}

/// Proxy: GET /api/subsonic/cover-art/:id
/// Streams the cover art image from the Subsonic server.
pub async fn cover_art(
    State(client): State<SharedClient>,
    Path(id): Path<String>,
    Query(params): Query<CoverArtParams>,
) -> impl IntoResponse {
    if let Err(e) = validate_server(&params.server) {
        return e.into_response();
    }
    let base = params.server.trim_end_matches('/');
    let url = format!("{}/rest/getCoverArt.view", base);
    let size = params.size.unwrap_or(300).to_string();
    match client
        .get(&url)
        .query(&[
            ("u", params.u.as_str()),
            ("t", params.t.as_str()),
            ("s", params.s.as_str()),
            ("v", "1.16.1"),
            ("c", "lastfm-dashboard"),
            ("id", id.as_str()),
            ("size", size.as_str()),
        ])
        .send()
        .await
    {
        Ok(resp) => {
            let status = resp.status();
            let content_type = resp
                .headers()
                .get("content-type")
                .and_then(|v| v.to_str().ok())
                .unwrap_or("image/jpeg")
                .to_string();
            match resp.bytes().await {
                Ok(bytes) => Response::builder()
                    .status(status)
                    .header("Content-Type", content_type)
                    .header("Cache-Control", "public, max-age=86400")
                    .body(Body::from(bytes))
                    .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response()),
                Err(e) => bad_gateway(e),
            }
        }
        Err(e) => bad_gateway(e),
    }
}
