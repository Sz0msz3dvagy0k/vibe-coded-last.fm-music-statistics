import { useState, useEffect } from 'react';
import { lastfmAPI } from '../services/api';
import { subsonicAPI } from '../services/subsonic';
import './TopTracks.css';

const TopTracks = ({ period }) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoading(true);
      try {
        const data = await lastfmAPI.getTopTracks(period, 10);
        const rawTracks = data.toptracks.track;
        const useSubsonic = subsonicAPI.isConfigured();

        const tracksWithImages = await Promise.all(
          rawTracks.map(async (track) => {
            if (useSubsonic) {
              const artistName = track.artist?.name || '';
              const coverArtId = await subsonicAPI.getSongCoverArtId(track.name, artistName);
              if (coverArtId) {
                return { ...track, _coverArtUrl: subsonicAPI.getCoverArtUrl(coverArtId, 64) };
              }
            }
            return track;
          })
        );
        setTracks(tracksWithImages);
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
              src={(() => {
                if (track._coverArtUrl) return track._coverArtUrl;
                const imgUrl = track.image?.[3]?.['#text'] || track.image?.[2]?.['#text'] || track.image?.[1]?.['#text'] || track.image?.[0]?.['#text'];
                return (imgUrl && imgUrl.trim() !== '') ? imgUrl : 'https://via.placeholder.com/50x50/1e2538/9aa0a6?text=♪';
              })()}
              alt={track.name}
              className="track-image"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50/1e2538/9aa0a6?text=♪'; }}
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
