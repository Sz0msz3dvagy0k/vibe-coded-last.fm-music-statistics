import { useState, useEffect } from 'react';
import { getSubsonicSettings, saveSubsonicSettings, clearSubsonicSettings, subsonicAPI } from '../services/subsonic';
import './Settings.css';

const Settings = ({ onClose }) => {
  const [server, setServer] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const settings = getSubsonicSettings();
    if (settings) {
      setServer(settings.server || '');
      setUsername(settings.username || '');
      setPassword(settings.password || '');
    }
  }, []);

  const handleSave = () => {
    if (!server.trim()) {
      setStatus({ type: 'error', message: 'Server address is required.' });
      return;
    }
    if (!username.trim()) {
      setStatus({ type: 'error', message: 'Username is required.' });
      return;
    }
    if (!password) {
      setStatus({ type: 'error', message: 'Password is required.' });
      return;
    }
    saveSubsonicSettings({ server, username, password });
    setStatus({ type: 'success', message: 'Settings saved.' });
  };

  const handleClear = () => {
    clearSubsonicSettings();
    setServer('');
    setUsername('');
    setPassword('');
    setStatus({ type: 'success', message: 'Settings cleared.' });
  };

  const handleTest = async () => {
    if (!server.trim() || !username.trim() || !password) {
      setStatus({ type: 'error', message: 'Please save settings before testing.' });
      return;
    }
    // Save first so the API client reads the latest values
    saveSubsonicSettings({ server, username, password });
    setTesting(true);
    setStatus(null);
    try {
      const data = await subsonicAPI.ping();
      const subsonicStatus = data?.['subsonic-response']?.status;
      if (subsonicStatus === 'ok') {
        setStatus({ type: 'success', message: 'Connection successful! Subsonic is reachable.' });
      } else {
        const errMsg = data?.['subsonic-response']?.error?.message || 'Unknown error';
        setStatus({ type: 'error', message: `Subsonic error: ${errMsg}` });
      }
    } catch (err) {
      setStatus({ type: 'error', message: `Connection failed: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Subsonic Settings</h2>
          <button className="settings-close" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <p className="settings-description">
          Configure your Subsonic-compatible server to enable high-quality cover art.
        </p>

        <div className="settings-form">
          <div className="settings-field">
            <label htmlFor="subsonic-server">Server Address</label>
            <input
              id="subsonic-server"
              type="url"
              placeholder="https://your-navidrome-server"
              value={server}
              onChange={e => setServer(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="subsonic-username">Username</label>
            <input
              id="subsonic-username"
              type="text"
              placeholder="your-username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="subsonic-password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="subsonic-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="your-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                className="toggle-password"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                type="button"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {status && (
            <div className={`settings-status settings-status--${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
            <button className="btn btn-secondary" onClick={handleTest} disabled={testing}>
              {testing ? 'Testing…' : 'Test Connection'}
            </button>
            <button className="btn btn-danger" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
