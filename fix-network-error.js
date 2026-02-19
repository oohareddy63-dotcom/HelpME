const axios = require('axios');

async function diagnoseNetworkError() {
  console.log('🔍 Diagnosing Network Error...');
  
  try {
    // Test 1: Direct backend connection
    console.log('1. Testing direct backend connection...');
    const direct = await axios.get('http://localhost:5000/');
    console.log('✅ Direct backend:', direct.data.message);
    
    // Test 2: Direct login API
    console.log('2. Testing direct login API...');
    const login = await axios.post('http://localhost:5000/api/v1/users/login', {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'test-token'
    });
    console.log('✅ Direct login:', login.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Frontend proxy connection
    console.log('3. Testing frontend proxy...');
    const proxy = await axios.post('http://localhost:3002/api/v1/users/login', {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'proxy-test'
    });
    console.log('✅ Proxy login:', proxy.data.success ? 'SUCCESS' : 'FAILED');
    
    console.log('\n🎯 SOLUTION:');
    if (login.data.success && proxy.data.success) {
      console.log('✅ Both direct and proxy connections work');
      console.log('💡 Issue might be in browser or frontend component');
    } else if (login.data.success && !proxy.data.success) {
      console.log('❌ Proxy not working - fix Vite config');
    } else {
      console.log('❌ Backend not working');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Start backend server');
      console.log('Run: npm start');
    } else if (error.message.includes('Network Error')) {
      console.log('\n💡 SOLUTION: Check proxy configuration');
      console.log('1. Verify Vite proxy settings');
      console.log('2. Check CORS configuration');
      console.log('3. Restart frontend server');
    }
  }
}

diagnoseNetworkError();
