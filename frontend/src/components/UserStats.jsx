import './UserStats.css';

const UserStats = ({ userInfo }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="user-stats fade-in">
      <div className="stats-grid">
        <div className="stat-card" style={{ '--accent': 'var(--accent-blue)' }}>
          <div className="stat-icon">🎵</div>
          <div className="stat-value">{formatNumber(userInfo.playcount)}</div>
          <div className="stat-label">Total Scrobbles</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--accent-purple)'  }}>
          <div className="stat-icon">👤</div>
          <div className="stat-value">{userInfo.name}</div>
          <div className="stat-label">Username</div>
        </div>
        <div className="stat-card" style={{ '--accent': 'var(--accent-pink)' }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">
            {new Date(userInfo.registered.unixtime * 1000).getFullYear()}
          </div>
          <div className="stat-label">Member Since</div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
