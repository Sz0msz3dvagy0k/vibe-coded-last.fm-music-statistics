use std::sync::Arc;
use std::time::Duration;

use anyhow::{Context, Result};
use moka::future::Cache;
use reqwest::Client;
use serde_json::Value;
use tracing::debug;

use crate::config::Config;

const LASTFM_BASE_URL: &str = "http://ws.audioscrobbler.com/2.0/";

#[derive(Clone)]
pub struct LastFmService {
    client: Client,
    cache: Cache<String, Value>,
    api_key: String,
    username: String,
}

impl LastFmService {
    pub fn new(config: &Config) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(10))
            .pool_max_idle_per_host(10)
            .build()
            .expect("failed to build HTTP client");

        let cache = Cache::builder()
            .max_capacity(1_000)
            .time_to_live(Duration::from_secs(config.lastfm_cache_ttl_secs))
            .build();

        Self {
            client,
            cache,
            api_key: config.lastfm_api_key.clone(),
            username: config.lastfm_username.clone(),
        }
    }

    async fn request(&self, method: &str, extra: &[(&str, &str)]) -> Result<Value> {
        let mut params: Vec<(&str, &str)> = vec![
            ("method", method),
            ("user", &self.username),
            ("api_key", &self.api_key),
            ("format", "json"),
        ];
        params.extend_from_slice(extra);

        // Build a deterministic cache key
        let mut key_parts: Vec<String> =
            params.iter().map(|(k, v)| format!("{k}={v}")).collect();
        key_parts.sort();
        let cache_key = key_parts.join("&");

        if let Some(cached) = self.cache.get(&cache_key).await {
            debug!("cache hit: {method}");
            return Ok(cached);
        }

        debug!("Last.fm request: {method}");
        let response = self
            .client
            .get(LASTFM_BASE_URL)
            .query(&params)
            .send()
            .await
            .context("Last.fm HTTP request failed")?
            .error_for_status()
            .context("Last.fm returned an error status")?
            .json::<Value>()
            .await
            .context("failed to parse Last.fm JSON")?;

        self.cache.insert(cache_key, response.clone()).await;
        Ok(response)
    }

    pub async fn get_recent_tracks(&self, limit: u32) -> Result<Value> {
        let limit = limit.to_string();
        self.request("user.getrecenttracks", &[("limit", &limit)]).await
    }

    pub async fn get_top_artists(&self, period: &str, limit: u32) -> Result<Value> {
        let limit = limit.to_string();
        self.request("user.gettopartists", &[("period", period), ("limit", &limit)])
            .await
    }

    pub async fn get_top_tracks(&self, period: &str, limit: u32) -> Result<Value> {
        let limit = limit.to_string();
        self.request("user.gettoptracks", &[("period", period), ("limit", &limit)])
            .await
    }

    pub async fn get_top_albums(&self, period: &str, limit: u32) -> Result<Value> {
        let limit = limit.to_string();
        self.request("user.gettopalbums", &[("period", period), ("limit", &limit)])
            .await
    }

    pub async fn get_user_info(&self) -> Result<Value> {
        self.request("user.getinfo", &[]).await
    }

    pub async fn get_weekly_chart_list(&self) -> Result<Value> {
        self.request("user.getweeklychartlist", &[]).await
    }

    pub async fn get_weekly_artist_chart(&self, from: &str, to: &str) -> Result<Value> {
        self.request("user.getweeklyartistchart", &[("from", from), ("to", to)])
            .await
    }
}

// Shared, cheaply-clonable handle
pub type SharedLastFm = Arc<LastFmService>;
