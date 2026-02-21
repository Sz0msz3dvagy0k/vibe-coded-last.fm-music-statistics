use anyhow::{Context, Result};

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub lastfm_api_key: String,
    pub lastfm_username: String,
    pub spotify_client_id: String,
    pub spotify_client_secret: String,
    /// Cache TTL for Last.fm responses (seconds)
    pub lastfm_cache_ttl_secs: u64,
    /// Cache TTL for Spotify search results (seconds)
    pub spotify_cache_ttl_secs: u64,
    /// Spotify token cache TTL (seconds) – kept below the 3600 s expiry
    pub spotify_token_ttl_secs: u64,
    /// Maximum allowed request-body size in bytes (default 1 MB)
    pub body_limit_bytes: usize,
    /// Per-request timeout in seconds
    pub request_timeout_secs: u64,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            port: env_var("PORT").unwrap_or_else(|_| "3001".into()).parse::<u16>()
                .context("PORT must be a valid port number")?,
            lastfm_api_key: env_var("LASTFM_API_KEY")
                .context("LASTFM_API_KEY is required")?,
            lastfm_username: env_var("LASTFM_USERNAME")
                .context("LASTFM_USERNAME is required")?,
            spotify_client_id: env_var("SPOTIFY_CLIENT_ID")
                .context("SPOTIFY_CLIENT_ID is required")?,
            spotify_client_secret: env_var("SPOTIFY_CLIENT_SECRET")
                .context("SPOTIFY_CLIENT_SECRET is required")?,
            lastfm_cache_ttl_secs: parse_env("LASTFM_CACHE_TTL_SECS", 300),
            spotify_cache_ttl_secs: parse_env("SPOTIFY_CACHE_TTL_SECS", 3600),
            spotify_token_ttl_secs: parse_env("SPOTIFY_TOKEN_TTL_SECS", 3000),
            body_limit_bytes: parse_env("BODY_LIMIT_BYTES", 1_048_576), // 1 MB
            request_timeout_secs: parse_env("REQUEST_TIMEOUT_SECS", 30),
        })
    }
}

fn env_var(key: &str) -> Result<String> {
    std::env::var(key).with_context(|| format!("{key} not set"))
}

fn parse_env<T: std::str::FromStr + Copy>(key: &str, default: T) -> T {
    std::env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}
