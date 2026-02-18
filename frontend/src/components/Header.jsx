import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header fade-in">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">🎵</div>
          <h1>Navidrome Dashboard</h1>
        </div>
        <p className="tagline">Your Last.fm listening activity</p>
      </div>
    </header>
  );
};

export default Header;
