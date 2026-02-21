const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotify');

// Search for artist
router.get('/artist', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ error: 'name parameter required' });
    }
    const data = await spotifyService.searchArtist(name);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Artist not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for album
router.get('/album', async (req, res) => {
  try {
    const { name, artist } = req.query;
    if (!name || !artist) {
      return res.status(400).json({ error: 'name and artist parameters required' });
    }
    const data = await spotifyService.searchAlbum(name, artist);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Album not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search for track
router.get('/track', async (req, res) => {
  try {
    const { name, artist } = req.query;
    if (!name || !artist) {
      return res.status(400).json({ error: 'name and artist parameters required' });
    }
    const data = await spotifyService.searchTrack(name, artist);
    if (data) {
      res.json(data);
    } else {
      res.status(404).json({ error: 'Track not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
