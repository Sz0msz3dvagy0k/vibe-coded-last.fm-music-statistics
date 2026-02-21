mod config;
mod routes;
mod services;

use std::sync::Arc;
use std::time::Duration;

use axum::{
    extract::Request,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::json;
use tokio::net::TcpListener;
use tokio::signal;
use tower_http::{
    cors::{Any, CorsLayer},
    limit::RequestBodyLimitLayer,
    timeout::TimeoutLayer,
    trace::TraceLayer,
};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

use config::Config;
use services::{lastfm::LastFmService, spotify::SpotifyService};

// ── health endpoint ──────────────────────────────────────────────────────────

async fn health() -> impl IntoResponse {
    Json(json!({
        "status": "ok",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

// ── 404 fallback ─────────────────────────────────────────────────────────────

async fn fallback(req: Request) -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(json!({ "error": format!("route {} {} not found", req.method(), req.uri()) })),
    )
}

// ── app builder ──────────────────────────────────────────────────────────────

fn build_app(config: &Config) -> Router {
    let lastfm = Arc::new(LastFmService::new(config));
    let spotify = Arc::new(SpotifyService::new(config));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let lastfm_router = Router::new()
        .route("/recent-tracks", get(routes::lastfm::recent_tracks))
        .route("/top-artists", get(routes::lastfm::top_artists))
        .route("/top-tracks", get(routes::lastfm::top_tracks))
        .route("/top-albums", get(routes::lastfm::top_albums))
        .route("/user-info", get(routes::lastfm::user_info))
        .route("/weekly-charts", get(routes::lastfm::weekly_charts))
        .route("/weekly-artist-chart", get(routes::lastfm::weekly_artist_chart))
        .with_state(lastfm);

    let spotify_router = Router::new()
        .route("/artist", get(routes::spotify::search_artist))
        .route("/album", get(routes::spotify::search_album))
        .route("/track", get(routes::spotify::search_track))
        .with_state(spotify);

    // Layers are applied inside-out: TraceLayer is innermost (first added),
    // RequestBodyLimitLayer is outermost (last added) so it rejects
    // oversized bodies before any other middleware runs.
    Router::new()
        .route("/api/health", get(health))
        .nest("/api/lastfm", lastfm_router)
        .nest("/api/spotify", spotify_router)
        .fallback(fallback)
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .layer(TimeoutLayer::with_status_code(
            StatusCode::REQUEST_TIMEOUT,
            Duration::from_secs(config.request_timeout_secs),
        ))
        .layer(RequestBodyLimitLayer::new(config.body_limit_bytes))
}

// ── graceful shutdown ─────────────────────────────────────────────────────────

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c().await.expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    info!("shutdown signal received; draining connections…");
}

// ── entry point ───────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load .env (ignore error if file absent — env vars may come from the OS)
    let _ = dotenvy::dotenv();

    // Structured logging — RUST_LOG=info by default
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = Config::from_env()?;

    info!(
        lastfm_user = %config.lastfm_username,
        port = config.port,
        "starting lastfm-backend"
    );

    let app = build_app(&config);
    let addr = format!("0.0.0.0:{}", config.port);
    let listener = TcpListener::bind(&addr).await?;
    info!("listening on {addr}");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}
