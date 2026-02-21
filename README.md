# Navidrome Dashboard 🎵

A modern music listening activity dashboard using Last.fm and Spotify APIs. Features real-time statistics, colorful visualizations, and a beautiful Navidrome-inspired UI.

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![Rust](https://img.shields.io/badge/rust-1.75%2B-orange)
![React](https://img.shields.io/badge/react-18-blue)

## ✨ Features

- 📊 **Real-time Statistics** - Live Last.fm listening data
- 🎨 **Beautiful UI** - Navidrome-inspired dark theme with gradients
- 📈 **Colorful Charts** - Interactive visualizations with Recharts
- 🖼️ **High-Quality Images** - Artist/album artwork from Spotify
- ⚡ **Smooth Animations** - CSS transitions and fade effects
- 📱 **Responsive Design** - Works on all devices
- 🔄 **Period Filtering** - View stats by day, week, month, or all-time

## 🚀 Quick Start

### Prerequisites
- Rust 1.75 or higher (`rustup install stable`)
- Node.js 18+ and npm (frontend only)

### Installation

1. **Clone the repository**
```bash
cd navidrome-dash
```

2. **Set up Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your API credentials
```

3. **Set up Frontend**
```bash
cd ../frontend
npm install
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
cargo run --release
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

**Open** http://localhost:5173 in your browser 🎉

## 🔨 Building a Production Binary

```bash
cd backend

# Build an optimised, stripped single binary
cargo build --release

# The binary is at:
#   backend/target/release/lastfm-backend
#
# Further size reduction with upx (optional):
#   upx --best target/release/lastfm-backend

# Cross-compile for Linux x86_64 from any host:
rustup target add x86_64-unknown-linux-musl
cargo build --release --target x86_64-unknown-linux-musl
# -> target/x86_64-unknown-linux-musl/release/lastfm-backend  (~5-8 MB stripped)
```

### Example curl

```bash
# Health check
curl -s http://localhost:3001/api/health

# Top artists (last 7 days, top 5)
curl -s "http://localhost:3001/api/lastfm/top-artists?period=7day&limit=5"

# Spotify artist image lookup
curl -s "http://localhost:3001/api/spotify/artist?name=Radiohead"
```

## 📁 Project Structure

```
navidrome-dash/
├── backend/              # Rust/axum API server
│   ├── src/
│   │   ├── main.rs      # Server bootstrap, middleware, graceful shutdown
│   │   ├── config.rs    # Typed config from environment variables
│   │   ├── services/    # Last.fm & Spotify API clients (with caching)
│   │   └── routes/      # REST endpoint handlers
│   ├── nodejs/          # Original Node.js source (reference only)
│   ├── Cargo.toml       # Rust dependencies
│   └── .env.example     # Environment variable template
├── frontend/            # React application
│   ├── src/
│   │   ├── App.jsx      # Main component
│   │   ├── components/  # UI components
│   │   └── services/    # API client
│   └── package.json
└── docs/               # Documentation
```

## 🎨 Screenshots

### Dashboard Features
- **User Statistics** - Total scrobbles, username, member since
- **Recent Tracks** - Last 8 tracks with now-playing indicator
- **Top Artists** - Grid of top artists with Spotify images
- **Top Tracks** - Ranked list of most-played songs
- **Listening Chart** - Colorful bar chart visualization

## 🔧 Tech Stack

### Backend
- **Rust** + **axum** + **tokio** - Async REST API server
- **reqwest** - Async HTTP client for external APIs
- **moka** - High-performance in-memory cache
- **tower-http** - CORS, request logging, timeouts, body-size limits
- **tracing** / **tracing-subscriber** - Structured logging
- **dotenvy** - `.env` file loading
- **serde** / **serde_json** - JSON serialisation

### Frontend  
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Data visualization
- **Axios** - API requests

### APIs
- **Last.fm API** - Listening history and statistics
- **Spotify API** - High-quality artist/album images

## 📊 API Endpoints

### Health
- `GET /api/health` - Service health check

### Last.fm
- `GET /api/lastfm/user-info` - User profile
- `GET /api/lastfm/recent-tracks?limit=10` - Recent plays
- `GET /api/lastfm/top-artists?period=overall&limit=10` - Top artists
- `GET /api/lastfm/top-tracks?period=overall&limit=10` - Top tracks
- `GET /api/lastfm/top-albums?period=overall&limit=10` - Top albums
- `GET /api/lastfm/weekly-charts` - Weekly chart list
- `GET /api/lastfm/weekly-artist-chart?from=UNIX&to=UNIX` - Weekly artist chart

#### Valid `period` values
`overall` | `7day` | `1month` | `3month` | `6month` | `12month`

### Spotify
- `GET /api/spotify/artist?name=ArtistName` - Search artist
- `GET /api/spotify/album?name=Album&artist=Artist` - Search album
- `GET /api/spotify/track?name=Track&artist=Artist` - Search track

## 🎯 Configuration

Copy `backend/.env.example` to `backend/.env` and fill in your credentials:

```env
LASTFM_API_KEY=your_api_key
LASTFM_USERNAME=your_username
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Optional tuning (defaults shown)
PORT=3001
LASTFM_CACHE_TTL_SECS=300
SPOTIFY_CACHE_TTL_SECS=3600
SPOTIFY_TOKEN_TTL_SECS=3000
BODY_LIMIT_BYTES=1048576
REQUEST_TIMEOUT_SECS=30
```

## 🏭 Production Hardening

The Rust backend ships with the following production features out of the box:

| Feature | Implementation |
|---|---|
| Graceful shutdown | `SIGTERM` / `Ctrl-C` drain in-flight requests |
| Request timeout | `tower-http TimeoutLayer` (default 30 s) |
| Body size limit | `tower-http RequestBodyLimitLayer` (default 1 MB) |
| CORS | `tower-http CorsLayer` |
| Structured logging | `tracing` + `tracing-subscriber` (set `RUST_LOG=debug` for verbose) |
| In-memory caching | `moka` with configurable TTL |
| Connection pooling | `reqwest` connection pool (10 idle connections per host) |
| TLS (upstream) | Keep nginx as TLS terminator; the binary talks plain HTTP internally |
| Panic safety | `panic = "abort"` + tokio runtime catches panicking tasks |

### Nginx reverse-proxy snippet

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;

    location /api/ {
        proxy_pass         http://127.0.0.1:3001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_read_timeout 35s;
    }
}
```

### Frontend Base Path

The frontend can be deployed under different base paths (e.g., `/dashboard/`, `/music/`) instead of the root path `/`.

**To configure:**

1. Create a `.env` file in the `frontend/` directory:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Edit the `.env` file and set your desired base path:
   ```env
   VITE_BASE_PATH=/dashboard/
   ```

3. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

The built files in `dist/` will now work when served from `/dashboard/` on your web server.

**Note:** Ensure your web server (nginx, Apache, etc.) is configured to serve the app from the specified path.

## 🔄 Development

```bash
# Run with hot-reload (requires cargo-watch)
cd backend
cargo install cargo-watch
cargo watch -x run

# Frontend dev server
cd frontend
npm run dev
```

Set `RUST_LOG=debug` for verbose request tracing.

## 📝 Documentation

- [GOALS.md](docs/GOALS.md) - Project objectives
- [PRINCIPLES.md](docs/PRINCIPLES.md) - Development guidelines
- [PROGRESS.md](docs/PROGRESS.md) - Development timeline
- [DEVELOPMENT_SUMMARY.md](DEVELOPMENT_SUMMARY.md) - Complete overview

## ✅ Status

**All systems operational!** ✨

- ✅ Rust backend compiles to a single native binary
- ✅ Frontend UI rendering
- ✅ Last.fm integration working
- ✅ Spotify integration working
- ✅ Charts and visualizations active
- ✅ Animations smooth
- ✅ Responsive design tested

## 🎉 Credits

- **Last.fm API** - Music listening data
- **Spotify API** - Artist/album imagery
- **Recharts** - Data visualization library
- **React** - UI framework
- **axum** - Rust web framework

## 📄 License

ISC

---

**Built with ❤️ using React and Rust**
