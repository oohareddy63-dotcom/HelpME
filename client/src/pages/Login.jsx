import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('9999999999'); // Demo phone
  const [password, setPassword] = useState('admin123'); // Demo password
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [isDirectLogin, setIsDirectLogin] = useState(true); // Default → Direct Login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState({ coordinates: [0, 0] });

  /* -------------------- Helpers -------------------- */

  const validatePhone = (value) => /^[0-9]{10}$/.test(value);

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

  /* -------------------- Location -------------------- */

  const getLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          coordinates: [
            position.coords.longitude,
            position.coords.latitude
          ]
        });
      },
      () => {
        // Safe fallback location (always works)
        setLocation({ coordinates: [76.4180791, 29.8154373] });
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  /* -------------------- DIRECT LOGIN (Demo Safe) -------------------- */

  const handleDirectLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const DEMO_PHONE = '9999999999';
    const DEMO_PASSWORD = 'admin123';

    setTimeout(() => {
      if (phone === DEMO_PHONE && password === DEMO_PASSWORD) {
        const demoUser = {
          id: 'demo-user',
          name: 'Demo User',
          phone: DEMO_PHONE
        };

        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('userId', demoUser.id);
        localStorage.setItem('user', JSON.stringify(demoUser));

        setIsAuthenticated(true);
        setUser(demoUser);

        navigate('/dashboard');
      } else {
        setError('Invalid demo credentials');
      }

      setLoading(false);
    }, 400);
  };

  /* -------------------- OTP FLOW (Optional / Safe) -------------------- */

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(phone)) {
      setError('Enter valid 10-digit phone number');
      return;
    }

    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (otp === '123456') {
        const demoUser = {
          id: 'demo-user',
          name: 'Demo User',
          phone
        };

        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('userId', demoUser.id);
        localStorage.setItem('user', JSON.stringify(demoUser));

        setIsAuthenticated(true);
        setUser(demoUser);

        navigate('/dashboard');
      } else {
        setError('Invalid OTP (Use 123456)');
      }

      setLoading(false);
    }, 400);
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-illustration">
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '4rem' }}>👤</div>
            <h2>HelpMe</h2>
            <p>Emergency Assistance Platform</p>
          </div>
        </div>

        <div className="auth-form-container">

          <h2>{isDirectLogin ? 'Direct Login' : step === 1 ? 'Login' : 'Verify OTP'}</h2>

          {error && <div className="error-message">{error}</div>}

          {/* Toggle Buttons */}

          <div style={{ marginBottom: '15px' }}>
            {isDirectLogin ? (
              <button
                className="btn btn-link"
                onClick={() => {
                  setIsDirectLogin(false);
                  setError('');
                }}
              >
                Use Phone OTP Login
              </button>
            ) : (
              <button
                className="btn btn-link"
                onClick={() => {
                  setIsDirectLogin(true);
                  setStep(1);
                  setError('');
                }}
              >
                Use Direct Login (Demo Safe)
              </button>
            )}
          </div>

          {/* ---------------- DIRECT LOGIN ---------------- */}

          {isDirectLogin && (
            <form onSubmit={handleDirectLogin}>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  disabled={loading}
                />
                <small>Demo: 9999999999</small>
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <small>Demo: admin123</small>
              </div>

              <button className="btn btn-primary btn-block">
                {loading ? 'Logging in...' : 'Login Directly'}
              </button>

            </form>
          )}

          {/* ---------------- OTP LOGIN ---------------- */}

          {!isDirectLogin && step === 1 && (
            <form onSubmit={handleSendOtp}>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                />
              </div>

              <button className="btn btn-primary">
                Send OTP
              </button>

            </form>
          )}

          {!isDirectLogin && step === 2 && (
            <form onSubmit={handleVerifyOtp}>

              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="tel"
                  value={otp}
                  onChange={handleOtpChange}
                />
                <small>Demo OTP: 123456</small>
              </div>

              <button className="btn btn-primary">
                {loading ? 'Verifying...' : 'Verify OTP'}
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
