use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;

use crate::services::spotify::SharedSpotify;

fn internal_error(e: anyhow::Error) -> (StatusCode, Json<serde_json::Value>) {
    tracing::error!("handler error: {e:#}");
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": e.to_string() })),
    )
}

fn not_found(kind: &str) -> (StatusCode, Json<serde_json::Value>) {
    (
        StatusCode::NOT_FOUND,
        Json(json!({ "error": format!("{kind} not found") })),
    )
}

// ── query param structs ──────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct ArtistQuery {
    pub name: String,
}

#[derive(Deserialize)]
pub struct AlbumQuery {
    pub name: String,
    pub artist: String,
}

#[derive(Deserialize)]
pub struct TrackQuery {
    pub name: String,
    pub artist: String,
}

// ── handlers ─────────────────────────────────────────────────────────────────

pub async fn search_artist(
    State(svc): State<SharedSpotify>,
    Query(q): Query<ArtistQuery>,
) -> impl IntoResponse {
    match svc.search_artist(&q.name).await {
        Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
        Ok(None) => not_found("Artist").into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn search_album(
    State(svc): State<SharedSpotify>,
    Query(q): Query<AlbumQuery>,
) -> impl IntoResponse {
    match svc.search_album(&q.name, &q.artist).await {
        Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
        Ok(None) => not_found("Album").into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn search_track(
    State(svc): State<SharedSpotify>,
    Query(q): Query<TrackQuery>,
) -> impl IntoResponse {
    match svc.search_track(&q.name, &q.artist).await {
        Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
        Ok(None) => not_found("Track").into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}
