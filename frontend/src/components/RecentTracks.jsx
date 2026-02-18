import React, { useState, useEffect } from 'react';
import { lastfmAPI } from '../services/api';
import './RecentTracks.css';

const RecentTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentTracks = async () => {
      try {
        const data = await lastfmAPI.getRecentTracks(10);
        setTracks(data.recenttracks.track);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchRecentTracks();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h2>Recent Tracks</h2>
        <div className="track-list">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '0.5rem' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card slide-in">
      <h2 className="section-title">🎧 Recent Tracks</h2>
      <div className="track-list">
        {tracks.slice(0, 8).map((track, index) => (
          <div key={index} className="track-item">
            <img 
              src={track.image?.[2]?.['#text'] || track.image?.[3]?.['#text'] || track.image?.[1]?.['#text'] || 'https://via.placeholder.com/50x50/1e2538/9aa0a6?text=♪'} 
              alt={track.name}
              className="track-image"
            />
            <div className="track-info">
              <div className="track-name">{track.name}</div>
              <div className="track-artist">{track.artist['#text'] || track.artist.name}</div>
            </div>
            {track['@attr']?.nowplaying === 'true' && (
              <div className="now-playing">
                <span className="pulse-dot"></span>
                Now Playing
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTracks;
