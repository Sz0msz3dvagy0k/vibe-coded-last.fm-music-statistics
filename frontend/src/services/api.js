import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Last.fm API calls
export const lastfmAPI = {
  getRecentTracks: async (limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/lastfm/recent-tracks`, {
      params: { limit }
    });
    return response.data;
  },

  getTopArtists: async (period = 'overall', limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/lastfm/top-artists`, {
      params: { period, limit }
    });
    return response.data;
  },

  getTopTracks: async (period = 'overall', limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/lastfm/top-tracks`, {
      params: { period, limit }
    });
    return response.data;
  },

  getTopAlbums: async (period = 'overall', limit = 10) => {
    const response = await axios.get(`${API_BASE_URL}/lastfm/top-albums`, {
      params: { period, limit }
    });
    return response.data;
  },

  getUserInfo: async () => {
    const response = await axios.get(`${API_BASE_URL}/lastfm/user-info`);
    return response.data;
  },
};

// Spotify API calls
export const spotifyAPI = {
  searchArtist: async (name) => {
    const response = await axios.get(`${API_BASE_URL}/spotify/artist`, {
      params: { name }
    });
    return response.data;
  },

  searchAlbum: async (name, artist) => {
    const response = await axios.get(`${API_BASE_URL}/spotify/album`, {
      params: { name, artist }
    });
    return response.data;
  },

  searchTrack: async (name, artist) => {
    const response = await axios.get(`${API_BASE_URL}/spotify/track`, {
      params: { name, artist }
    });
    return response.data;
  },
};
