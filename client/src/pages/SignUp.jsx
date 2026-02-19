import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const SignUp = ({ setIsAuthenticated, setUser }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ coordinates: [0, 0] });
  const [fcmToken, setFcmToken] = useState('web-fcm-token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: phone verification, 2: OTP verification, 3: full registration
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(''); // For development - OTP shown when SMS not configured
  const navigate = useNavigate();

  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            coordinates: [position.coords.longitude, position.coords.latitude]
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  React.useEffect(() => {
    getLocation();
  }, []);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate phone number
    if (!phone.trim()) {
      setError('Phone number is required');
      setLoading(false);
      return;
    }

    if (phone.length !== 10 || !/^[0-9]{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/v1/users/send-otp', {
        phone
      });

      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
        if (response.data.otp) {
          setDevOtp(response.data.otp);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || 
        (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Ensure the backend is running on port 5000.' : 'Failed to send OTP. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate inputs
    if (!name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!address.trim()) {
      setError('Address is required');
      setLoading(false);
      return;
    }

    if (!otp.trim()) {
      setError('OTP is required');
      setLoading(false);
      return;
    }

    if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    if (location.coordinates[0] === 0) {
      setError('Location is required. Please enable location services.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/v1/users/verify-otp', {
        phone,
        otp,
        name,
        address,
        location,
        fcmToken
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId || response.data.user?.id || '');
        setIsAuthenticated(true);
        setUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-illustration">
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🆘</div>
            <h2>HelpMe</h2>
            <p>Emergency Assistance Platform</p>
          </div>
        </div>
        
        <div className="auth-form-container">
          <h2>Create Account</h2>
          <p>Join our emergency assistance network</p>
          
          {error && <div className="error-message">{error}</div>}
          
          {step === 1 ? (
            <form onSubmit={sendOtp}>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your 10-digit phone number"
                  required
                  maxLength="10"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={verifyOtp}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="otp">OTP Code</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    if (error) setError('');
                  }}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                />
                {devOtp ? (
                  <small className="dev-otp">Dev mode: Your OTP is <strong>{devOtp}</strong></small>
                ) : (
                  <small>Check your phone for the OTP code</small>
                )}
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || location.coordinates[0] === 0}
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
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
          ) : null}
          
          <div className="auth-links">
            <p>Already have an account? <Link to="/">Sign in here</Link></p>
          </div>
          
          {!location.coordinates[0] && (
            <div className="warning-message">
              <p>⚠️ Please enable location services to continue</p>
              <button onClick={getLocation} className="btn btn-secondary btn-sm">
                Enable Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;