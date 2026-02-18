import React, { useState, useEffect } from 'react';
import { lastfmAPI } from './services/api';
import Header from './components/Header';
import UserStats from './components/UserStats';
import RecentTracks from './components/RecentTracks';
import TopArtists from './components/TopArtists';
import TopTracks from './components/TopTracks';
import ListeningChart from './components/ListeningChart';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [period, setPeriod] = useState('overall');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await lastfmAPI.getUserInfo();
        setUserInfo(data.user);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading-container">
          <div className="skeleton" style={{ width: '200px', height: '40px', margin: '2rem auto' }} />
          <div className="grid grid-2 container">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton" style={{ height: '300px' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <div className="error-container">
          <h2>Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
      <main className="container">
        {userInfo && <UserStats userInfo={userInfo} />}
        
        <div className="period-selector mb-3">
          <button 
            className={period === '7day' ? 'active' : ''} 
            onClick={() => setPeriod('7day')}
          >
            7 Days
          </button>
          <button 
            className={period === '1month' ? 'active' : ''} 
            onClick={() => setPeriod('1month')}
          >
            1 Month
          </button>
          <button 
            className={period === '3month' ? 'active' : ''} 
            onClick={() => setPeriod('3month')}
          >
            3 Months
          </button>
          <button 
            className={period === 'overall' ? 'active' : ''} 
            onClick={() => setPeriod('overall')}
          >
            All Time
          </button>
        </div>

        <div className="grid grid-2 mb-3">
          <RecentTracks />
          <ListeningChart period={period} />
        </div>

        <div className="grid grid-2">
          <TopArtists period={period} />
          <TopTracks period={period} />
        </div>
      </main>
    </div>
  );
}

export default App;
