const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/v1/users/login', {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'test-token'
    });
    
    console.log('Login Response:', response.data);
    
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testLogin();
