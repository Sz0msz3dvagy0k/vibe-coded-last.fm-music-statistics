import { useState, useEffect } from 'react';
import { lastfmAPI } from '../services/api';
import { subsonicAPI } from '../services/subsonic';
import './TopArtists.css';

const TopArtists = ({ period }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopArtists = async () => {
      setLoading(true);
      try {
        const data = await lastfmAPI.getTopArtists(period, 8);
        const useSubsonic = subsonicAPI.isConfigured();

        const artistsWithImages = await Promise.all(
          data.topartists.artist.map(async (artist) => {
            // Try Subsonic first, fall back to Last.fm image
            if (useSubsonic) {
              const coverArtId = await subsonicAPI.getArtistCoverArtId(artist.name);
              if (coverArtId) {
                return { ...artist, image: subsonicAPI.getCoverArtUrl(coverArtId, 300) };
              }
            }
            return { ...artist, image: artist.image?.[3]?.['#text'] || artist.image?.[2]?.['#text'] || null };
          })
        );
        setArtists(artistsWithImages);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, [period]);

  if (loading) {
    return (
      <div className="card">
        <h2>Top Artists</h2>
        <div className="artist-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '200px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card slide-in">
      <h2 className="section-title">⭐ Top Artists</h2>
      <div className="artist-grid">
        {artists.map((artist, index) => (
          <div key={index} className="artist-card">
            <div className="artist-rank">{index + 1}</div>
            <img 
              src={artist.image || 'https://via.placeholder.com/300x300/1e2538/9aa0a6?text=♪'} 
              alt={artist.name}
              className="artist-image"
            />
            <div className="artist-overlay">
              <div className="artist-name">{artist.name}</div>
              <div className="artist-plays">{parseInt(artist.playcount).toLocaleString()} plays</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;
