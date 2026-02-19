const axios = require('axios');

async function test100Percent() {
  console.log('🎯 100% Error-Free Test');
  
  try {
    // Test backend
    const health = await axios.get('http://localhost:5000/');
    console.log('✅ Backend:', health.data.message);
    
    // Test login
    const login = await axios.post('http://localhost:5000/api/v1/users/login', {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'test-token'
    });
    
    if (login.data.success) {
      console.log('✅ Login: Working');
      
      // Test authenticated request
      const auth = await axios.get('http://localhost:5000/api/v1/users/me', {
        headers: { 'Authorization': `Bearer ${login.data.token}` }
      });
      console.log('✅ Auth: Working');
      
      console.log('🎉 100% SUCCESS - No Errors!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test100Percent();
