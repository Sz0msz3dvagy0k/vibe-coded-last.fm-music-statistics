use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;

use crate::services::lastfm::SharedLastFm;

fn internal_error(e: anyhow::Error) -> (StatusCode, Json<serde_json::Value>) {
    tracing::error!("handler error: {e:#}");
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": e.to_string() })),
    )
}

// ── query param structs ──────────────────────────────────────────────────────

#[derive(Deserialize)]
pub struct PeriodLimit {
    #[serde(default = "default_period")]
    pub period: String,
    #[serde(default = "default_limit")]
    pub limit: u32,
}

#[derive(Deserialize)]
pub struct LimitOnly {
    #[serde(default = "default_limit")]
    pub limit: u32,
}

#[derive(Deserialize)]
pub struct WeeklyChartParams {
    pub from: String,
    pub to: String,
}

fn default_period() -> String {
    "overall".into()
}
fn default_limit() -> u32 {
    10
}

// ── handlers ─────────────────────────────────────────────────────────────────

pub async fn recent_tracks(
    State(svc): State<SharedLastFm>,
    Query(q): Query<LimitOnly>,
) -> impl IntoResponse {
    match svc.get_recent_tracks(q.limit).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn top_artists(
    State(svc): State<SharedLastFm>,
    Query(q): Query<PeriodLimit>,
) -> impl IntoResponse {
    match svc.get_top_artists(&q.period, q.limit).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn top_tracks(
    State(svc): State<SharedLastFm>,
    Query(q): Query<PeriodLimit>,
) -> impl IntoResponse {
    match svc.get_top_tracks(&q.period, q.limit).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn top_albums(
    State(svc): State<SharedLastFm>,
    Query(q): Query<PeriodLimit>,
) -> impl IntoResponse {
    match svc.get_top_albums(&q.period, q.limit).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn user_info(State(svc): State<SharedLastFm>) -> impl IntoResponse {
    match svc.get_user_info().await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn weekly_charts(State(svc): State<SharedLastFm>) -> impl IntoResponse {
    match svc.get_weekly_chart_list().await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}

pub async fn weekly_artist_chart(
    State(svc): State<SharedLastFm>,
    Query(q): Query<WeeklyChartParams>,
) -> impl IntoResponse {
    match svc.get_weekly_artist_chart(&q.from, &q.to).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => internal_error(e).into_response(),
    }
}
