const axios = require('axios');

// Test the backend API endpoints
async function testAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('Testing Help-me API endpoints...\n');
  
  try {
    // Test root endpoint
    console.log('1. Testing root endpoint...');
    const rootResponse = await axios.get(`${baseURL}/`);
    console.log('✓ Root endpoint:', rootResponse.data.message);
    
    // Test user verification endpoint
    console.log('\n2. Testing user verification...');
    const verifyResponse = await axios.post(`${baseURL}/api/v1/users/verify`, {
      phone: '1234567890'
    });
    console.log('✓ Verification response:', verifyResponse.data);
    
    // Test registration endpoint (this will fail without proper location)
    console.log('\n3. Testing registration endpoint...');
    try {
      const registerResponse = await axios.post(`${baseURL}/api/v1/users/register`, {
        name: 'Test User',
        phone: '1234567890',
        address: 'Test Address',
        location: {
          coordinates: [77.2090, 28.7041] // Delhi coordinates
        },
        fcmToken: 'test-fcm-token'
      });
      console.log('✓ Registration response:', registerResponse.data);
    } catch (error) {
      console.log('Registration failed (expected without MongoDB):', error.response?.data || error.message);
    }
    
    // Test location update endpoint (requires auth)
    console.log('\n4. Testing location update endpoint...');
    try {
      const locationResponse = await axios.put(`${baseURL}/api/v1/location/update`, {
        location: {
          coordinates: [77.2090, 28.7041]
        }
      }, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✓ Location update response:', locationResponse.data);
    } catch (error) {
      console.log('Location update failed (expected without auth):', error.response?.status);
    }
    
    console.log('\n✅ API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();