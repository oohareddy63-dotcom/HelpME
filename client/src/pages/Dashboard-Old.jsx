import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = ({ user, setUser, setIsAuthenticated }) => {
  const [location, setLocation] = useState({ coordinates: [0, 0] });
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            coordinates: [position.coords.longitude, position.coords.latitude]
          };
          setLocation(newLocation);
          updateLocation(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Update location on backend
  const updateLocation = async (newLocation) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/v1/location/update', {
        location: newLocation
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  // Get nearby users
  const getNearbyUsers = async () => {
    if (location.coordinates[0] === 0) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/v1/location/users', {
        longitude: location.coordinates[0],
        latitude: location.coordinates[1],
        distance: 5000 // 5km radius
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNearbyUsers(response.data.results || []);
      }
    } catch (err) {
      console.error('Error getting nearby users:', err);
    }
  };

  // Get user notifications
  const getUserNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setNotifications(response.data.user.notifications || []);
      }
    } catch (err) {
      console.error('Error getting notifications:', err);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // Update location every 30 seconds
  useEffect(() => {
    getLocation();
    const interval = setInterval(getLocation, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get nearby users and notifications when location updates
  useEffect(() => {
    if (location.coordinates[0] !== 0) {
      getNearbyUsers();
      getUserNotifications();
    }
  }, [location]);

  // Get notifications periodically
  useEffect(() => {
    const interval = setInterval(getUserNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const position = [location.coordinates[1], location.coordinates[0]];

  return (
    <div className="dashboard">
      <div className="map-section">
        <div className="map-container">
          {location.coordinates[0] !== 0 ? (
            <MapContainer 
              center={position} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User's location */}
              <Marker position={position}>
                <Popup>
                  <strong>Your Location</strong><br />
                  You are here
                </Popup>
              </Marker>
              
              {/* Nearby users */}
              {nearbyUsers.map((nearbyUser, index) => (
                nearbyUser.id !== user?.id && (
                  <Marker 
                    key={nearbyUser.id || index}
                    position={[nearbyUser.location.coordinates[1], nearbyUser.location.coordinates[0]]}
                  >
                    <Popup>
                      <strong>Nearby User</strong><br />
                      Distance: {Math.round(
                        Math.sqrt(
                          Math.pow(nearbyUser.location.coordinates[0] - location.coordinates[0], 2) +
                          Math.pow(nearbyUser.location.coordinates[1] - location.coordinates[1], 2)
                        ) * 111000
                      )} meters away
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          ) : (
            <div className="map-placeholder">
              <p>Loading map...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="sidebar">
        <div className="user-info">
          <h3>Welcome, {user?.name || user?.phone}</h3>
          <p>Location: {location.coordinates[0] !== 0 ? 'Active' : 'Getting location...'}</p>
          <p>Nearby Users: {nearbyUsers.length - 1}</p>
          <div className="user-actions">
            <Link to="/close-contacts" className="btn btn-primary">
              Close Contacts
            </Link>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
        
        <div className="notifications">
          <h4>Recent Alerts</h4>
          {notifications.length > 0 ? (
            notifications.slice(-5).reverse().map((notification, index) => (
              <div key={index} className="notification-item">
                <strong>{notification.notification.title}</strong>
                <p>{notification.notification.body}</p>
                <small>
                  {new Date().toLocaleTimeString()}
                </small>
              </div>
            ))
          ) : (
            <p>No recent alerts</p>
          )}
        </div>
        
        <div className="emergency-info">
          <h4>Emergency Information</h4>
          <p>• Press the red emergency button in case of distress</p>
          <p>• Your location will be shared with nearby users</p>
          <p>• Trusted contacts will receive SMS alerts</p>
          <p>• Help will arrive quickly through our network</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;