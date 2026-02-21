const axios = require('axios');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
const TOKEN_CACHE_KEY = 'spotify_access_token';

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.tokenUrl = 'https://accounts.spotify.com/api/token';
    this.baseUrl = 'https://api.spotify.com/v1';
  }

  async getAccessToken() {
    const cachedToken = cache.get(TOKEN_CACHE_KEY);
    if (cachedToken) {
      return cachedToken;
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(
              this.clientId + ':' + this.clientSecret
            ).toString('base64')
          }
        }
      );

      const token = response.data.access_token;
      // Cache token for 50 minutes (expires in 1 hour)
      cache.set(TOKEN_CACHE_KEY, token, 3000);
      return token;
    } catch (error) {
      console.error('Spotify token error:', error.message);
      throw error;
    }
  }

  async searchArtist(artistName) {
    const cacheKey = `artist_${artistName}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: artistName,
          type: 'artist',
          limit: 1
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const artist = response.data.artists.items[0];
      cache.set(cacheKey, artist);
      return artist;
    } catch (error) {
      console.error(`Spotify artist search error (${artistName}):`, error.message);
      return null;
    }
  }

  async searchAlbum(albumName, artistName) {
    const cacheKey = `album_${albumName}_${artistName}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: `album:${albumName} artist:${artistName}`,
          type: 'album',
          limit: 1
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const album = response.data.albums.items[0];
      cache.set(cacheKey, album);
      return album;
    } catch (error) {
      console.error(`Spotify album search error (${albumName}):`, error.message);
      return null;
    }
  }

  async searchTrack(trackName, artistName) {
    const cacheKey = `track_${trackName}_${artistName}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: `track:${trackName} artist:${artistName}`,
          type: 'track',
          limit: 1
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const track = response.data.tracks.items[0];
      cache.set(cacheKey, track);
      return track;
    } catch (error) {
      console.error(`Spotify track search error (${trackName}):`, error.message);
      return null;
    }
  }
}

module.exports = new SpotifyService();
