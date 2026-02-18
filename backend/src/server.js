const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const lastfmRoutes = require('./routes/lastfm');
const spotifyRoutes = require('./routes/spotify');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Environment check:');
console.log('LASTFM_API_KEY:', process.env.LASTFM_API_KEY ? 'SET' : 'NOT SET');
console.log('LASTFM_USERNAME:', process.env.LASTFM_USERNAME ? 'SET' : 'NOT SET');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'SET' : 'NOT SET');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/lastfm', lastfmRoutes);
app.use('/api/spotify', spotifyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
