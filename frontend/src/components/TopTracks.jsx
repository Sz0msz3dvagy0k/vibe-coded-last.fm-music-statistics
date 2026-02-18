import React, { useState, useEffect } from 'react';
import { lastfmAPI } from '../services/api';
import './TopTracks.css';

const TopTracks = ({ period }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoading(true);
      try {
        const data = await lastfmAPI.getTopTracks(period, 10);
        setTracks(data.toptracks.track);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [period]);

  if (loading) {
    return (
      <div className="card">
        <h2>Top Tracks</h2>
        <div className="top-tracks-list">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card slide-in">
      <h2 className="section-title">🔥 Top Tracks</h2>
      <div className="top-tracks-list">
        {tracks.map((track, index) => (
          <div key={index} className="top-track-item">
            <div className="track-rank">{index + 1}</div>
            <img 
              src={track.image[2]['#text'] || '/placeholder.png'} 
              alt={track.name}
              className="track-image"
            />
            <div className="track-details">
              <div className="track-name">{track.name}</div>
              <div className="track-artist">{track.artist.name}</div>
            </div>
            <div className="track-stats">
              <div className="track-playcount">{parseInt(track.playcount).toLocaleString()}</div>
              <div className="track-label">plays</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
