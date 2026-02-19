import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Settings = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Handle hardware button mapping
  const handleHardwareButton = () => {
    setMessage('Hardware button configuration coming soon!');
    setTimeout(() => setMessage(''), 3000);
  };

  // Navigate to close contacts
  const handleAddCloseContacts = () => {
    navigate('/close-contacts');
  };

  // Clear message after 3 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="logo">HelpMe</div>
        <div className="header-nav">
          <Link to="/dashboard" className="nav-link">Home</Link>
          <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="settings">
          <div className="settings-header">
            <h2>Settings</h2>
          </div>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
            <button 
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'settings' && (
              <div>
                <div className="settings-option">
                  <div>
                    <h3>Map Hardware Button</h3>
                    <p>Configure your device's hardware emergency button</p>
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleHardwareButton}
                    disabled={loading}
                  >
                    Configure
                  </button>
                </div>

                <div className="settings-option">
                  <div>
                    <h3>Add Close Contacts</h3>
                    <p>Manage your emergency contact list</p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddCloseContacts}
                    disabled={loading}
                  >
                    Manage Contacts
                  </button>
                </div>

                <div className="settings-option">
                  <div>
                    <h3>Logout</h3>
                    <p>Sign out of your account</p>
                  </div>
                  <button 
                    className="btn btn-danger"
                    onClick={handleLogout}
                    disabled={loading}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div className="settings-option">
                  <div>
                    <h3>Name</h3>
                    <p>{user?.name || 'Not set'}</p>
                  </div>
                </div>
                <div className="settings-option">
                  <div>
                    <h3>Phone Number</h3>
                    <p>{user?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="settings-option">
                  <div>
                    <h3>Address</h3>
                    <p>{user?.address || 'Not set'}</p>
                  </div>
                </div>
                <div className="settings-option">
                  <div>
                    <h3>Account Status</h3>
                    <p>Active</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <div className="settings-option">
                  <div>
                    <h3>Emergency Alerts</h3>
                    <p>Receive notifications when nearby users need help</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div>
                    <h3>Sound Alerts</h3>
                    <p>Play sound for emergency notifications</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="settings-option">
                  <div>
                    <h3>Vibration</h3>
                    <p>Vibrate for emergency alerts</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
