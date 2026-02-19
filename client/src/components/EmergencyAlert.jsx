import React, { useState } from 'react';
import axios from 'axios';

const EmergencyAlert = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
              distance: 5000 // 5km radius
            });
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  };

  const sendEmergencyAlert = async () => {
    setLoading(true);
    try {
      const locationData = await getLocation();
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/v1/location/users', locationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAlertSent(true);
        setTimeout(() => {
          setAlertSent(false);
          setShowModal(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending alert:', err);
      alert('Failed to send emergency alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyClick = () => {
    setShowModal(true);
  };

  const handleConfirm = () => {
    sendEmergencyAlert();
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Emergency Button */}
      <button 
        className="emergency-button"
        onClick={handleEmergencyClick}
        title="Emergency Alert"
      >
        🚨
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="alert-modal">
          <div className="alert-content">
            <h2>🚨 Emergency Alert</h2>
            <p>Are you in distress? This will send an alert to nearby users and your trusted contacts.</p>
            <p>Your current location will be shared.</p>
            
            <div className="alert-buttons">
              <button 
                className="btn btn-danger"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Alert'}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {alertSent && (
        <div className="alert-modal">
          <div className="alert-content">
            <h2>✅ Alert Sent</h2>
            <p>Your emergency alert has been sent successfully!</p>
            <p>Nearby users and your contacts have been notified.</p>
            <p>Help is on the way.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyAlert;