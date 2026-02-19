const axios = require('axios');

// Configure axios exactly like the frontend
axios.defaults.baseURL = 'http://localhost:5000';

async function debugLogin() {
  console.log('🔍 Debug Login Process');
  console.log('========================');
  
  try {
    console.log('1. Testing connection to backend...');
    const healthCheck = await axios.get('/');
    console.log('✅ Backend is reachable');
    console.log('Response:', healthCheck.data);
    
    console.log('\n2. Testing login endpoint...');
    const loginData = {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'debug-test-token'
    };
    
    console.log('Login data:', loginData);
    
    const response = await axios.post('/api/v1/users/login', loginData);
    
    console.log('✅ Login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.success) {
      console.log('✅ Token received:', response.data.token.substring(0, 50) + '...');
      console.log('✅ User ID:', response.data.userId);
    }
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend is not running. Start with: npm start');
    } else if (error.code === 'ENOTFOUND') {
      console.log('💡 Backend URL is incorrect');
    } else if (error.message.includes('CORS')) {
      console.log('💡 CORS issue - check backend configuration');
    }
  }
}

debugLogin();
