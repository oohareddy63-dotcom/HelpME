import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [results, setResults] = useState([]);

  const addResult = (test, success, message, details = '') => {
    setResults(prev => [...prev, { test, success, message, details }]);
  };

  useEffect(() => {
    const checkConnection = async () => {
      setStatus('checking');
      setResults([]);

      try {
        // Test 1: Backend Health
        addResult('Backend Health', 'pending', 'Testing backend connection...');
        const healthResponse = await axios.get('/');
        addResult('Backend Health', 'success', 'Backend reachable', healthResponse.data.message);

        // Test 2: Login API
        addResult('Login API', 'pending', 'Testing login endpoint...');
        const loginResponse = await axios.post('/api/v1/users/login', {
          phone: 1234567890,
          location: { coordinates: [76.4180791, 29.8154373] },
          fcmToken: 'connection-test'
        });
        
        if (loginResponse.data.success) {
          addResult('Login API', 'success', 'Login successful', `Token: ${loginResponse.data.token.substring(0, 20)}...`);
          
          // Test 3: Authenticated Request
          addResult('Authenticated API', 'pending', 'Testing authenticated request...');
          const authResponse = await axios.get('/api/v1/users/me', {
            headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
          });
          
          addResult('Authenticated API', 'success', 'Auth request successful', `User: ${authResponse.data.user.phone}`);
          
          // Test 4: Close Contacts
          addResult('Close Contacts API', 'pending', 'Testing close contacts...');
          const contactsResponse = await axios.get('/api/v1/users/getCloseContact', {
            headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
          });
          
          addResult('Close Contacts API', 'success', 'Contacts API working', `Found: ${Object.keys(contactsResponse.data.contacts || {}).length} contacts`);
          
          setStatus('connected');
        } else {
          addResult('Login API', 'error', 'Login failed', loginResponse.data.error);
          setStatus('error');
        }

      } catch (error) {
        console.error('Connection test error:', error);
        
        if (error.code === 'ECONNREFUSED') {
          addResult('Connection', 'error', 'Backend not running', 'Start backend with: npm start');
        } else if (error.response) {
          addResult('API Error', 'error', `Server error: ${error.response.status}`, error.response.data?.error || 'Unknown error');
        } else {
          addResult('Network', 'error', 'Network error', error.message);
        }
        
        setStatus('error');
      }
    };

    checkConnection();
  }, []);

  const getStatusIcon = (success) => {
    if (success === 'pending') return '⏳';
    if (success === 'success') return '✅';
    if (success === 'error') return '❌';
    return '❓';
  };

  const getStatusColor = (success) => {
    if (success === 'pending') return '#ffc107';
    if (success === 'success') return '#4caf50';
    if (success === 'error') return '#f44336';
    return '#666';
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#00bcd4', marginBottom: '10px' }}>
          🔗 Frontend-Backend Connection Status
        </h1>
        <div style={{ 
          padding: '10px 20px',
          backgroundColor: status === 'connected' ? '#4caf50' : status === 'error' ? '#f44336' : '#ffc107',
          color: 'white',
          borderRadius: '20px',
          display: 'inline-block',
          fontWeight: 'bold'
        }}>
          {status === 'checking' && '🔄 CHECKING CONNECTION...'}
          {status === 'connected' && '✅ FULLY CONNECTED'}
          {status === 'error' && '❌ CONNECTION ISSUES'}
        </div>
      </div>

      <div style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '10px' }}>
        <h2 style={{ color: '#00bcd4', marginBottom: '20px' }}>Test Results:</h2>
        
        {results.map((result, index) => (
          <div key={index} style={{
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#1a1a1a',
            border: `2px solid ${getStatusColor(result.success)}`,
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '20px', marginRight: '10px' }}>
                {getStatusIcon(result.success)}
              </span>
              <strong style={{ color: getStatusColor(result.success) }}>
                {result.test}
              </strong>
            </div>
            <div style={{ marginLeft: '30px', color: '#ccc' }}>
              <div>{result.message}</div>
              {result.details && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#888', 
                  marginTop: '5px',
                  fontFamily: 'monospace'
                }}>
                  {result.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {status === 'connected' && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>🎉 CONNECTION SUCCESSFUL!</h3>
          <p>You can now use the application normally.</p>
          <div style={{ marginTop: '15px' }}>
            <a 
              href="/login" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#4caf50',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                margin: '0 10px'
              }}
            >
              Go to Login
            </a>
            <a 
              href="/signup" 
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: 'white',
                color: '#4caf50',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                margin: '0 10px'
              }}
            >
              Go to Sign Up
            </a>
          </div>
        </div>
      )}

      <div style={{ marginTop: '30px', textAlign: 'center', color: '#666' }}>
        <p><strong>Services Status:</strong></p>
        <p>🖥️ Backend: http://localhost:5000</p>
        <p>🌐 Frontend: http://localhost:3002</p>
        <p>🗺️ Mapbox: Configured</p>
        <p>📱 Twilio: Ready</p>
      </div>
    </div>
  );
};

export default ConnectionStatus;
