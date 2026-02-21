const axios = require('axios');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

class LastFMService {
  constructor() {
    this.apiKey = process.env.LASTFM_API_KEY;
    this.username = process.env.LASTFM_USERNAME;
    this.baseUrl = 'http://ws.audioscrobbler.com/2.0/';
  }

  async makeRequest(method, params = {}) {
    const cacheKey = `${method}_${JSON.stringify(params)}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const requestParams = {
        method,
        user: this.username,
        api_key: this.apiKey,
        format: 'json',
        ...params
      };
      
      console.log('Last.fm request:', method, requestParams);
      
      const response = await axios.get(this.baseUrl, {
        params: requestParams
      });
      
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Last.fm API error (${method}):`, error.message);
      throw error;
    }
  }

  async getRecentTracks(limit = 10) {
    return this.makeRequest('user.getrecenttracks', { limit });
  }

  async getTopArtists(period = 'overall', limit = 10) {
    return this.makeRequest('user.gettopartists', { period, limit });
  }

  async getTopTracks(period = 'overall', limit = 10) {
    return this.makeRequest('user.gettoptracks', { period, limit });
  }

  async getTopAlbums(period = 'overall', limit = 10) {
    return this.makeRequest('user.gettopalbums', { period, limit });
  }

  async getUserInfo() {
    return this.makeRequest('user.getinfo');
  }

  async getWeeklyChartList() {
    return this.makeRequest('user.getweeklychartlist');
  }

  async getWeeklyArtistChart(from, to) {
    return this.makeRequest('user.getweeklyartistchart', { from, to });
  }
}

module.exports = new LastFMService();
