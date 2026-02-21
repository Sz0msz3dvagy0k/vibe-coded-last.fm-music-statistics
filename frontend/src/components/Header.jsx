import { useState } from 'react';
import { subsonicAPI } from '../services/subsonic';
import Settings from './Settings';
import './Header.css';

const Header = () => {
  const [showSettings, setShowSettings] = useState(false);
  const configured = subsonicAPI.isConfigured();

  return (
    <>
      <header className="header fade-in">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">🎵</div>
            <h1>Navidrome Dashboard</h1>
          </div>
          <p className="tagline">Your Last.fm listening activity</p>
        </div>
        <button
          className={`settings-btn${configured ? ' settings-btn--active' : ''}`}
          onClick={() => setShowSettings(true)}
          aria-label="Open Subsonic settings"
          title={configured ? 'Subsonic configured' : 'Configure Subsonic'}
        >
          ⚙️
        </button>
      </header>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Header;
