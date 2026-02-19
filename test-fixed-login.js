const axios = require('axios');

async function testFixedLogin() {
  console.log('🔧 Testing Fixed Login...');
  
  try {
    // Test like frontend does (with proxy)
    const response = await axios.post('http://localhost:3002/api/v1/users/login', {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'fixed-test'
    });
    
    if (response.data.success) {
      console.log('✅ FIXED! Login working through proxy');
      console.log('✅ Token:', response.data.token.substring(0, 30) + '...');
      console.log('✅ User ID:', response.data.userId);
      console.log('\n🎉 Network Error FIXED!');
      console.log('🌐 Frontend can now login successfully');
    } else {
      console.log('❌ Still not working:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Frontend not running - start npm run dev');
    } else if (error.response) {
      console.log('💡 Server error:', error.response.status);
    }
  }
}

testFixedLogin();
