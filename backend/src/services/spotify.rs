use std::sync::Arc;
use std::time::Duration;

use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use moka::future::Cache;
use reqwest::Client;
use serde::Deserialize;
use serde_json::Value;
use tokio::sync::RwLock;
use tracing::debug;

use crate::config::Config;

const SPOTIFY_TOKEN_URL: &str = "https://accounts.spotify.com/api/token";
const SPOTIFY_BASE_URL: &str = "https://api.spotify.com/v1";

#[derive(Deserialize)]
struct TokenResponse {
    access_token: String,
}

#[derive(Clone)]
pub struct SpotifyService {
    client: Client,
    search_cache: Cache<String, Value>,
    /// Cached OAuth token + its expiry instant
    token: Arc<RwLock<Option<(String, std::time::Instant)>>>,
    client_id: String,
    client_secret: String,
    token_ttl: Duration,
}

impl SpotifyService {
    pub fn new(config: &Config) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(10))
            .pool_max_idle_per_host(10)
            .build()
            .expect("failed to build HTTP client");

        let search_cache = Cache::builder()
            .max_capacity(5_000)
            .time_to_live(Duration::from_secs(config.spotify_cache_ttl_secs))
            .build();

        Self {
            client,
            search_cache,
            token: Arc::new(RwLock::new(None)),
            client_id: config.spotify_client_id.clone(),
            client_secret: config.spotify_client_secret.clone(),
            token_ttl: Duration::from_secs(config.spotify_token_ttl_secs),
        }
    }

    /// Returns a valid access token, refreshing when necessary.
    async fn access_token(&self) -> Result<String> {
        // Fast path — read lock only
        {
            let guard = self.token.read().await;
            if let Some((token, expires_at)) = guard.as_ref() {
                if std::time::Instant::now() < *expires_at {
                    return Ok(token.clone());
                }
            }
        }

        // Slow path — acquire write lock and refresh
        let mut guard = self.token.write().await;
        // Double-check after acquiring write lock
        if let Some((token, expires_at)) = guard.as_ref() {
            if std::time::Instant::now() < *expires_at {
                return Ok(token.clone());
            }
        }

        debug!("refreshing Spotify access token");
        let credentials = BASE64.encode(format!("{}:{}", self.client_id, self.client_secret));
        let resp = self
            .client
            .post(SPOTIFY_TOKEN_URL)
            .header("Authorization", format!("Basic {credentials}"))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body("grant_type=client_credentials")
            .send()
            .await
            .context("Spotify token request failed")?
            .error_for_status()
            .context("Spotify token endpoint returned error")?
            .json::<TokenResponse>()
            .await
            .context("failed to parse Spotify token response")?;

        let expires_at = std::time::Instant::now() + self.token_ttl;
        *guard = Some((resp.access_token.clone(), expires_at));
        Ok(resp.access_token)
    }

    async fn search(&self, query: &str, search_type: &str) -> Result<Option<Value>> {
        let cache_key = format!("{search_type}::{query}");
        if let Some(cached) = self.search_cache.get(&cache_key).await {
            debug!("cache hit: {cache_key}");
            return Ok(Some(cached));
        }

        let token = self.access_token().await?;
        let mut resp: Value = self
            .client
            .get(format!("{SPOTIFY_BASE_URL}/search"))
            .bearer_auth(&token)
            .query(&[("q", query), ("type", search_type), ("limit", "1")])
            .send()
            .await
            .context("Spotify search request failed")?
            .error_for_status()
            .context("Spotify search returned error status")?
            .json()
            .await
            .context("failed to parse Spotify search JSON")?;

        // Pull the first item from the appropriate list
        let key = format!("{}s", search_type); // e.g. "artists", "albums", "tracks"
        let item = resp[key]["items"]
            .as_array_mut()
            .and_then(|arr| if arr.is_empty() { None } else { Some(arr.remove(0)) });

        if let Some(ref v) = item {
            self.search_cache.insert(cache_key, v.clone()).await;
        }
        Ok(item)
    }

    pub async fn search_artist(&self, name: &str) -> Result<Option<Value>> {
        self.search(name, "artist").await
    }

    pub async fn search_album(&self, album: &str, artist: &str) -> Result<Option<Value>> {
        let q = format!("album:{album} artist:{artist}");
        self.search(&q, "album").await
    }

    pub async fn search_track(&self, track: &str, artist: &str) -> Result<Option<Value>> {
        let q = format!("track:{track} artist:{artist}");
        self.search(&q, "track").await
    }
}

pub type SharedSpotify = Arc<SpotifyService>;
