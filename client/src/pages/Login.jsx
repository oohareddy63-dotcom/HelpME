import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState({ coordinates: [0, 0] });
  const [fcmToken, setFcmToken] = useState('web-fcm-token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [step, setStep] = useState(1); // 1: phone entry, 2: OTP verification
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const navigate = useNavigate();

  // Validate phone number
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
          setLocationError('');
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const useDefaultLocation = () => {
    setLocation({ coordinates: [76.4180791, 29.8154373] });
    setLocationError('');
  };

  React.useEffect(() => {
    getLocation();
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    if (location.coordinates[0] === 0) {
      setError('Location is required. Please enable location services.');
      setLoading(false);
      return;
    }

    try {
      // Check if user exists and send OTP
      const response = await api.post('/api/v1/users/send-otp', {
        phone: parseInt(phone)
      });

      if (response.data.success) {
        setStep(2); // Move to OTP verification step
        if (response.data.otp) {
          setDevOtp(response.data.otp);
        }
      } else {
        setError(response.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      if (err.response) {
        setError(err.response.data.error || 'Failed to send OTP');
      } else {
        setError(err.code === 'ERR_NETWORK' ? 'Cannot reach server. Ensure the backend is running on port 5000.' : 'Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp.trim()) {
      setError('OTP is required');
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/v1/users/verify-otp', {
        phone: parseInt(phone),
        otp,
        location,
        fcmToken
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId || response.data.user?.id || '');
        setIsAuthenticated(true);
        setUser(response.data.user || { phone: parseInt(phone) });
        navigate('/dashboard');
      } else {
        setError(response.data.error || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      if (err.response) {
        setError(err.response.data.error || 'OTP verification failed');
      } else {
        setError(err.code === 'ERR_NETWORK' ? 'Cannot reach server. Ensure the backend is running on port 5000.' : 'Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (error) setError('');
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-illustration">
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👤</div>
            <h2>HelpMe</h2>
            <p>Emergency Assistance Platform</p>
          </div>
        </div>
        
        <div className="auth-form-container">
          <h2>{step === 1 ? 'Login' : 'Verify OTP'}</h2>
          <p>{step === 1 ? 'Access your emergency assistance platform' : `Enter OTP sent to ${phone}`}</p>
          
          {error && <div className="error-message">{error}</div>}
          {locationError && <div className="warning-message">{locationError}</div>}
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+1 (123) 456-7890"
                  className={error && !phone ? 'error' : ''}
                  disabled={loading}
                  maxLength="10"
                />
                <small>Format: 1234567890</small>
              </div>
              
              <div className="form-group">
                <label>Location Status:</label>
                <div className="location-status">
                  {location.coordinates[0] !== 0 ? (
                    <span className="status-success">✓ Location obtained</span>
                  ) : (
                    <span className="status-warning">
                      ⚠ Getting location...
                      <button 
                        type="button" 
                        onClick={getLocation} 
                        className="btn btn-sm btn-secondary"
                        disabled={loading}
                      >
                        Retry
                      </button>
                      <button 
                        type="button" 
                        onClick={useDefaultLocation} 
                        className="btn btn-sm btn-secondary"
                        disabled={loading}
                      >
                        Use default
                      </button>
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || location.coordinates[0] === 0}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label htmlFor="otp">Enter 6-Digit OTP:</label>
                <input
                  type="tel"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter OTP"
                  className={error && !otp ? 'error' : ''}
                  disabled={loading}
                  maxLength="6"
                />
                {devOtp ? <small className="dev-otp">Dev mode: Your OTP is <strong>{devOtp}</strong></small> : <small>Check your phone for the OTP message</small>}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Change Phone Number
              </button>
            </form>
          )}
          
          <div className="auth-links">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;