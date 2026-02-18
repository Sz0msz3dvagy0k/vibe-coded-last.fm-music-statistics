# Navidrome Dashboard 🎵

A modern music listening activity dashboard using Last.fm and Spotify APIs. Features real-time statistics, colorful visualizations, and a beautiful Navidrome-inspired UI.

![Status](https://img.shields.io/badge/status-ready-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-green)
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
- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd navidrome-dash
```

2. **Set up Backend**
```bash
cd backend
npm install
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
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

**Open** http://localhost:5173 in your browser 🎉

## 📁 Project Structure

```
navidrome-dash/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── server.js    # Main server
│   │   ├── services/    # API integrations
│   │   └── routes/      # REST endpoints
│   └── .env             # API keys (included)
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
- **Node.js** + **Express** - REST API server
- **Axios** - HTTP client for external APIs
- **node-cache** - Response caching
- **dotenv** - Environment configuration

### Frontend  
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Data visualization
- **Axios** - API requests

### APIs
- **Last.fm API** - Listening history and statistics
- **Spotify API** - High-quality artist/album images

## 📊 API Endpoints

### Last.fm
- `GET /api/lastfm/user-info` - User profile
- `GET /api/lastfm/recent-tracks` - Recent plays
- `GET /api/lastfm/top-artists` - Top artists
- `GET /api/lastfm/top-tracks` - Top tracks
- `GET /api/lastfm/top-albums` - Top albums

### Spotify
- `GET /api/spotify/artist?name=ArtistName` - Search artist
- `GET /api/spotify/album?name=Album&artist=Artist` - Search album
- `GET /api/spotify/track?name=Track&artist=Artist` - Search track

## 🎯 Configuration

API credentials are pre-configured in `backend/.env`:
- **Last.fm Username**: sz0msz3d
- **Last.fm API Key**: Included
- **Spotify Client ID**: Included
- **Spotify Client Secret**: Included

To use your own credentials, edit `backend/.env`.

## 🔄 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

Changes auto-reload with hot module replacement!

## 📝 Documentation

- [GOALS.md](docs/GOALS.md) - Project objectives
- [PRINCIPLES.md](docs/PRINCIPLES.md) - Development guidelines
- [PROGRESS.md](docs/PROGRESS.md) - Development timeline
- [DEVELOPMENT_SUMMARY.md](DEVELOPMENT_SUMMARY.md) - Complete overview

## ✅ Status

**All systems operational!** ✨

- ✅ Backend API running
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

## 📄 License

ISC

---

**Built with ❤️ using React and Node.js**
