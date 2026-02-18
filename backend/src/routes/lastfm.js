const express = require('express');
const router = express.Router();
const lastfmService = require('../services/lastfm');

// Get recent tracks
router.get('/recent-tracks', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const data = await lastfmService.getRecentTracks(limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top artists
router.get('/top-artists', async (req, res) => {
  try {
    const period = req.query.period || 'overall';
    const limit = req.query.limit || 10;
    const data = await lastfmService.getTopArtists(period, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top tracks
router.get('/top-tracks', async (req, res) => {
  try {
    const period = req.query.period || 'overall';
    const limit = req.query.limit || 10;
    const data = await lastfmService.getTopTracks(period, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top albums
router.get('/top-albums', async (req, res) => {
  try {
    const period = req.query.period || 'overall';
    const limit = req.query.limit || 10;
    const data = await lastfmService.getTopAlbums(period, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user info
router.get('/user-info', async (req, res) => {
  try {
    const data = await lastfmService.getUserInfo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly chart list
router.get('/weekly-charts', async (req, res) => {
  try {
    const data = await lastfmService.getWeeklyChartList();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly artist chart
router.get('/weekly-artist-chart', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to parameters required' });
    }
    const data = await lastfmService.getWeeklyArtistChart(from, to);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
