import React, { useState } from 'react';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'http://localhost:5000';

const TestLogin = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await axios.post('/api/v1/users/login', {
        phone: 1234567890,
        location: { coordinates: [76.4180791, 29.8154373] },
        fcmToken: 'test-token'
      });
      
      if (response.data.success) {
        setResult(`✅ Login successful! Token: ${response.data.token.substring(0, 20)}...`);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
      } else {
        setResult(`❌ Login failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setResult(`❌ Error: ${error.message}`);
      
      if (error.code === 'ERR_NETWORK') {
        setResult('❌ Network error - check if backend is running on port 5000');
      } else if (error.response) {
        setResult(`❌ Server error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔍 Login Debug Test</h2>
      
      <button 
        onClick={testLogin}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#00bcd4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test Login'}
      </button>
      
      <div style={{
        padding: '15px',
        backgroundColor: '#2d2d2d',
        border: '1px solid #404040',
        borderRadius: '5px',
        color: 'white',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap'
      }}>
        {result || 'Click "Test Login" to check connection'}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>This test will:</p>
        <ul>
          <li>Connect to backend at http://localhost:5000</li>
          <li>Test the login endpoint</li>
          <li>Show any errors that occur</li>
          <li>Store token in localStorage if successful</li>
        </ul>
      </div>
    </div>
  );
};

export default TestLogin;
