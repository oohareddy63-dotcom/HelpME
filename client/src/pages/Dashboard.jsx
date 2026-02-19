import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from '../api';
import mapboxgl from 'mapbox-gl';

const DEFAULT_CENTER = [76.4180791, 29.8154373];
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_TOKEN;

// Debug: Log token status
console.log('=== MAPBOX DEBUG ===');
console.log('Token:', MAPBOX_TOKEN);
console.log('Token available:', !!MAPBOX_TOKEN);
console.log('Token starts with pk.:', MAPBOX_TOKEN?.startsWith('pk.'));
console.log('Token length:', MAPBOX_TOKEN?.length);
console.log('mapboxgl.accessToken set:', mapboxgl.accessToken);
console.log('mapboxgl object:', mapboxgl);
console.log('WebGL supported:', mapboxgl.supported());
console.log('===================');

const Dashboard = ({ user, setUser, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const mapRef = useRef();
  const [activeTab, setActiveTab] = useState('emergency'); // New state for active tab
  const [location, setLocation] = useState({ coordinates: [0, 0] });
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_CENTER[0],
    latitude: DEFAULT_CENTER[1],
    zoom: 10
  });
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeLocation, setActiveLocation] = useState(null); // Track which location to use for directions/share
  const [popupInfo, setPopupInfo] = useState(null);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            coordinates: [position.coords.longitude, position.coords.latitude]
          };
          setLocation(newLocation);
          setViewState(v => ({
            ...v,
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 15
          }));
          updateLocation(newLocation);
          setLoading(false);
          setMapError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setMapError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setMapError('Geolocation is not supported by your browser');
    }
  }, []);

  const updateLocation = async (newLocation) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put('/api/v1/location/update', {
        location: newLocation
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating location:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const getNearbyUsers = async () => {
    if (location.coordinates[0] === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post('/api/v1/location/users', {
        longitude: location.coordinates[0],
        latitude: location.coordinates[1],
        distance: 5000
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setNearbyUsers(response.data.results || []);
      }
    } catch (err) {
      console.error('Error getting nearby users:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const getUserNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/v1/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setNotifications(response.data.user?.notifications || []);
      }
    } catch (err) {
      console.error('Error getting notifications:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const sendEmergencyAlert = async () => {
    try {
      setEmergencyLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await axios.post('/api/v1/users/emergency-alert', {
        location: location.coordinates[0] !== 0 ? {
          latitude: location.coordinates[1],
          longitude: location.coordinates[0]
        } : null
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Emergency alert sent successfully!');
        setShowEmergencyConfirm(false);
      } else {
        throw new Error(response.data.error || 'Failed to send emergency alert');
      }
    } catch (err) {
      console.error('Error sending emergency alert:', err);
      alert(err.response?.data?.error || err.message || 'Failed to send emergency alert');
    } finally {
      setEmergencyLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 30000);
    return () => clearInterval(interval);
  }, [getLocation]);

  useEffect(() => {
    if (location.coordinates[0] !== 0) {
      getNearbyUsers();
      getUserNotifications();
    }
  }, [location]);

  useEffect(() => {
    const interval = setInterval(getUserNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Mapbox map
  const handleMapLoad = useCallback(() => {
    console.log('✅ Map loaded successfully!');
    setMapLoading(false);
    setMapError(null);
  }, []);

  const handleMapError = useCallback((error) => {
    console.error('❌ Map error:', error);
    setMapError(`Map failed to load: ${error.message || 'Unknown error'}`);
    setMapLoading(false);
  }, []);

  const handleMapRender = useCallback(() => {
    console.log('🎨 Map rendered');
  }, []);

  // Update user marker when map is loaded
  useEffect(() => {
    if (!mapRef.current || activeTab !== 'map' || location.coordinates[0] === 0) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.map-marker-user');
    existingMarkers.forEach(marker => marker.remove());

    // Create marker element
    const el = document.createElement('div');
    el.className = 'map-marker map-marker-user';
    el.innerHTML = '📍';
    el.style.cursor = 'pointer';
    el.style.fontSize = '24px';

    // Add marker to map
    new mapboxgl.Marker(el)
      .setLngLat([location.coordinates[0], location.coordinates[1]])
      .addTo(map);
  }, [location, activeTab]);

  // Update emergency markers
  useEffect(() => {
    if (!mapRef.current || activeTab !== 'map') return;

    const map = mapRef.current.getMap();
    if (!map) return;

    // Remove existing emergency markers
    const existingMarkers = document.querySelectorAll('.map-marker-emergency');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    nearbyUsers.forEach((nearbyUser) => {
      if (nearbyUser.id !== user?.id && nearbyUser.location?.coordinates) {
        const el = document.createElement('div');
        el.className = 'map-marker map-marker-emergency';
        el.innerHTML = '🚨';
        el.style.cursor = 'pointer';
        el.style.fontSize = '24px';

        new mapboxgl.Marker(el)
          .setLngLat([nearbyUser.location.coordinates[0], nearbyUser.location.coordinates[1]])
          .addTo(map);
      }
    });
  }, [nearbyUsers, activeTab, user]);

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/dashboard" className="brand-link">
              <span className="brand-icon">🆘</span>
              <span className="brand-text">HelpMe</span>
            </Link>
          </div>
          <div className="navbar-menu">
            <button 
              onClick={() => setActiveTab('emergency')} 
              className={`navbar-item ${activeTab === 'emergency' ? 'active' : ''}`}
            >
              <span className="nav-icon">🚨</span>
              <span className="nav-text">Emergency</span>
            </button>
            <button 
              onClick={() => setActiveTab('map')} 
              className={`navbar-item ${activeTab === 'map' ? 'active' : ''}`}
            >
              <span className="nav-icon">🗺️</span>
              <span className="nav-text">Map</span>
            </button>
            <button 
              onClick={() => setActiveTab('coordinates')} 
              className={`navbar-item ${activeTab === 'coordinates' ? 'active' : ''}`}
            >
              <span className="nav-icon">📍</span>
              <span className="nav-text">Location</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')} 
              className={`navbar-item ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-text">Profile</span>
            </button>
            <Link to="/close-contacts" className="navbar-item">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Contacts</span>
            </Link>
            <Link to="/settings" className="navbar-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </Link>
            <button onClick={handleLogout} className="navbar-item logout-item">
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content full-page">
        {nearbyUsers.length > 0 && (
          <div className="alert-banner">
            <span className="alert-icon">🚨</span>
            <span className="alert-text">Emergency Alert: Someone nearby needs help!</span>
            <button onClick={() => setActiveTab('map')} className="alert-action">View Map</button>
          </div>
        )}

        {/* Emergency Alert Page */}
        {activeTab === 'emergency' && (
          <div className="page-content emergency-page">
            <div className="page-header">
              <h1>🚨 Emergency Alert System</h1>
              <p>Send immediate help request to your emergency contacts</p>
            </div>
            <div className="emergency-card">
              <div className="emergency-content">
                <div className="emergency-icon-large">🆘</div>
                <h2>Emergency Alert</h2>
                <p>This will send SMS to all your emergency contacts with your current location</p>
                <div className="emergency-stats">
                  <div className="stat-item">
                    <span className="stat-number">{user?.closeContacts ? Object.keys(user.closeContacts).length : 0}</span>
                    <span className="stat-label">Emergency Contacts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{location.coordinates[0] !== 0 ? 'Ready' : 'No GPS'}</span>
                    <span className="stat-label">Location Status</span>
                  </div>
                </div>
                <button
                  className="emergency-button-large"
                  onClick={() => setShowEmergencyConfirm(true)}
                  disabled={emergencyLoading}
                >
                  {emergencyLoading ? 'Sending Alert...' : '🚨 SEND EMERGENCY ALERT'}
                </button>
                <div className="emergency-warning">
                  <p><strong>⚠️ Use only in real emergencies</strong></p>
                  <p>This will immediately notify all your emergency contacts</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Page */}
        {activeTab === 'map' && (
          <div className="page-content map-page">
            <div className="page-header">
              <h1>🗺️ Live Map</h1>
              <p>Your location and nearby emergency alerts</p>
            </div>
            <div className="map-container-full">
              {!MAPBOX_TOKEN ? (
                <div className="map-error">
                  <div className="error-message">
                    <h3>Mapbox Token Missing</h3>
                    <p>Please configure VITE_MAPBOX_ACCESS_TOKEN in .env file</p>
                  </div>
                </div>
              ) : mapError ? (
                <div className="map-error">
                  <div className="error-message">
                    <h3>Map Error</h3>
                    <p>{mapError}</p>
                    <button onClick={() => {
                      setMapError(null);
                      setMapLoading(true);
                      if (map.current) {
                        map.current.remove();
                        map.current = null;
                      }
                      window.location.reload();
                    }} className="btn btn-primary">
                      Refresh Page
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {mapLoading && (
                    <div className="map-loading">
                      <div className="loading">Loading map...</div>
                    </div>
                  )}
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative', 
                    minHeight: '400px',
                    background: '#f0f0f0',
                    border: '2px solid red'
                  }}>
                    <Map
                      ref={mapRef}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      initialViewState={{
                        longitude: viewState.longitude,
                        latitude: viewState.latitude,
                        zoom: viewState.zoom
                      }}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                      onLoad={handleMapLoad}
                      onError={handleMapError}
                      onRender={handleMapRender}
                      attributionControl={true}
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1
                      }}
                    >
                      {/* Navigation controls will be added by react-map-gl automatically */}
                    </Map>
                    {/* Debug overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.8)',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '5px',
                      zIndex: 1000,
                      fontSize: '12px',
                      maxWidth: '300px'
                    }}>
                      <div>Token: {MAPBOX_TOKEN ? '✅ Set' : '❌ Missing'}</div>
                      <div>WebGL: {mapboxgl.supported() ? '✅ Supported' : '❌ Not Supported'}</div>
                      <div>Map Instance: {mapRef.current ? '✅ Created' : '⏳ Waiting...'}</div>
                      <div>Active Tab: {activeTab}</div>
                      {mapError && <div style={{color: '#ff6b6b', marginTop: '5px'}}>Error: {mapError}</div>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Coordinates Page */}
        {activeTab === 'coordinates' && (
          <div className="page-content coordinates-page">
            <div className="page-header">
              <h1>📍 Location Details</h1>
              <p>Your current coordinates and location actions</p>
            </div>
            <div className="coordinates-card">
              {location.coordinates[0] !== 0 ? (
                <>
                  <div className="location-display">
                    <div className="location-icon">📍</div>
                    <div className="location-info">
                      <h3>Current Location</h3>
                      <div className="coordinates-text">
                        <div className="coord-row">
                          <span className="coord-label">Latitude:</span>
                          <span className="coord-value">{location.coordinates[1].toFixed(6)}</span>
                        </div>
                        <div className="coord-row">
                          <span className="coord-label">Longitude:</span>
                          <span className="coord-value">{location.coordinates[0].toFixed(6)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="location-actions">
                    <button
                      className="action-button primary"
                      onClick={() => {
                        setActiveLocation(location.coordinates);
                        setShowDirections(true);
                      }}
                    >
                      <span className="action-icon">🧭</span>
                      <span className="action-text">Get Directions</span>
                    </button>
                    <button
                      className="action-button secondary"
                      onClick={() => {
                        setActiveLocation(location.coordinates);
                        setShowShare(true);
                      }}
                    >
                      <span className="action-icon">📤</span>
                      <span className="action-text">Share Location</span>
                    </button>
                    <button
                      className="action-button tertiary"
                      onClick={getLocation}
                      disabled={loading}
                    >
                      <span className="action-icon">🔄</span>
                      <span className="action-text">{loading ? 'Updating...' : 'Refresh Location'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-location">
                  <div className="no-location-icon">📍</div>
                  <h3>Location Not Available</h3>
                  <p>Please enable location services to see your coordinates</p>
                  <button className="action-button primary" onClick={getLocation} disabled={loading}>
                    <span className="action-icon">📍</span>
                    <span className="action-text">{loading ? 'Getting Location...' : 'Get My Location'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Page */}
        {activeTab === 'profile' && (
          <div className="page-content profile-page">
            <div className="page-header">
              <h1>👤 User Profile</h1>
              <p>Your account information and status</p>
            </div>
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="profile-info">
                  <h2>Welcome, {user?.name || 'User'}</h2>
                  <p className="profile-phone">{user?.phone}</p>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-icon">📍</div>
                  <div className="stat-content">
                    <h3>Location Status</h3>
                    <p className={location.coordinates[0] !== 0 ? 'status-active' : 'status-inactive'}>
                      {loading ? 'Getting location...' : location.coordinates[0] !== 0 ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-content">
                    <h3>Emergency Contacts</h3>
                    <p className={user?.closeContacts && Object.keys(user.closeContacts).length > 0 ? 'status-active' : 'status-inactive'}>
                      {user?.closeContacts ? Object.keys(user.closeContacts).length : 0} contacts
                    </p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🚨</div>
                  <div className="stat-content">
                    <h3>Nearby Alerts</h3>
                    <p className={nearbyUsers.filter(u => u.id !== user?.id).length > 0 ? 'status-warning' : 'status-safe'}>
                      {nearbyUsers.filter(u => u.id !== user?.id).length} alerts
                    </p>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <Link to="/close-contacts" className="profile-action-btn primary">
                  <span className="action-icon">👥</span>
                  <span className="action-text">Manage Contacts</span>
                </Link>
                <Link to="/settings" className="profile-action-btn secondary">
                  <span className="action-icon">⚙️</span>
                  <span className="action-text">Settings</span>
                </Link>
                <button onClick={handleLogout} className="profile-action-btn danger">
                  <span className="action-icon">🚪</span>
                  <span className="action-text">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Directions Modal */}
        {showDirections && activeLocation && (
          <div className="modal-overlay" onClick={() => setShowDirections(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Get Directions</h3>
                <button className="modal-close" onClick={() => setShowDirections(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>Choose your preferred navigation app:</p>
                <div className="location-info">
                  <strong>Destination:</strong><br/>
                  {activeLocation[1].toFixed(6)}, {activeLocation[0].toFixed(6)}
                </div>
                <div className="directions-options">
                  <button 
                    className="btn btn-primary btn-full"
                    onClick={() => {
                      const lat = activeLocation[1];
                      const lng = activeLocation[0];
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                      setShowDirections(false);
                    }}
                  >
                    🗺️ Google Maps
                  </button>
                  <button 
                    className="btn btn-secondary btn-full"
                    onClick={() => {
                      const lat = activeLocation[1];
                      const lng = activeLocation[0];
                      window.open(`https://maps.apple.com/?daddr=${lat},${lng}`, '_blank');
                      setShowDirections(false);
                    }}
                  >
                    🍎 Apple Maps
                  </button>
                  <button 
                    className="btn btn-secondary btn-full"
                    onClick={() => {
                      const lat = activeLocation[1];
                      const lng = activeLocation[0];
                      window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
                      setShowDirections(false);
                    }}
                  >
                    🚗 Waze
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShare && activeLocation && (
          <div className="modal-overlay" onClick={() => setShowShare(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Share Location</h3>
                <button className="modal-close" onClick={() => setShowShare(false)}>×</button>
              </div>
              <div className="modal-body">
                <p>Share this location:</p>
                <div className="share-options">
                  <div className="location-info">
                    <strong>Coordinates:</strong><br/>
                    {activeLocation[1].toFixed(6)}, {activeLocation[0].toFixed(6)}
                  </div>
                  <div className="share-buttons">
                    <button 
                      className="btn btn-primary btn-full"
                      onClick={() => {
                        const lat = activeLocation[1];
                        const lng = activeLocation[0];
                        const locationUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                        navigator.clipboard.writeText(locationUrl).then(() => {
                          alert('Location link copied to clipboard!');
                          setShowShare(false);
                        }).catch(() => {
                          // Fallback for older browsers
                          const textArea = document.createElement('textarea');
                          textArea.value = locationUrl;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          alert('Location link copied to clipboard!');
                          setShowShare(false);
                        });
                      }}
                    >
                      📋 Copy Link
                    </button>
                    <button 
                      className="btn btn-secondary btn-full"
                      onClick={() => {
                        const lat = activeLocation[1];
                        const lng = activeLocation[0];
                        const text = `Location: https://www.google.com/maps?q=${lat},${lng}`;
                        if (navigator.share) {
                          navigator.share({
                            title: 'Location - HelpMe',
                            text: text,
                            url: `https://www.google.com/maps?q=${lat},${lng}`
                          }).then(() => {
                            setShowShare(false);
                          }).catch(console.error);
                        } else {
                          // Fallback for browsers without Web Share API
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
                          window.open(whatsappUrl, '_blank');
                          setShowShare(false);
                        }
                      }}
                    >
                      📱 Share via App
                    </button>
                    <button 
                      className="btn btn-success btn-full"
                      onClick={() => {
                        const lat = activeLocation[1];
                        const lng = activeLocation[0];
                        const subject = 'Location Share - HelpMe';
                        const body = `Here is the location: https://www.google.com/maps?q=${lat},${lng}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                        setShowShare(false);
                      }}
                    >
                      📧 Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Confirmation Modal */}
        {showEmergencyConfirm && (
          <div className="modal-overlay" onClick={() => setShowEmergencyConfirm(false)}>
            <div className="modal-content emergency-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>🚨 Emergency Alert Confirmation</h3>
                <button className="modal-close" onClick={() => setShowEmergencyConfirm(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="emergency-warning">
                  <p><strong>Are you sure you want to send an emergency alert?</strong></p>
                  <p>This will immediately notify all your emergency contacts that you need help.</p>
                  
                  {user?.closeContacts && Object.keys(user.closeContacts).length > 0 ? (
                    <div className="contacts-preview">
                      <p><strong>Alert will be sent to:</strong></p>
                      <ul>
                        {Object.entries(user.closeContacts).map(([name, phone]) => (
                          <li key={name}>{name} ({phone})</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="no-contacts-warning">
                      <p><strong>⚠️ No emergency contacts found!</strong></p>
                      <p>Please add emergency contacts first.</p>
                      <Link to="/close-contacts" className="btn btn-secondary btn-sm">
                        Add Contacts
                      </Link>
                    </div>
                  )}
                  
                  {location.coordinates[0] !== 0 && (
                    <div className="location-preview">
                      <p><strong>Your location will be shared:</strong></p>
                      <p>{location.coordinates[1].toFixed(6)}, {location.coordinates[0].toFixed(6)}</p>
                    </div>
                  )}
                </div>
                
                {user?.closeContacts && Object.keys(user.closeContacts).length > 0 && (
                  <div className="emergency-actions">
                    <button
                      className="btn btn-danger btn-full"
                      onClick={sendEmergencyAlert}
                      disabled={emergencyLoading}
                    >
                      {emergencyLoading ? 'Sending Alert...' : '🚨 YES, SEND EMERGENCY ALERT'}
                    </button>
                    <button
                      className="btn btn-secondary btn-full"
                      onClick={() => setShowEmergencyConfirm(false)}
                      disabled={emergencyLoading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
