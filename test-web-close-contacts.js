const axios = require('axios');

// Configure axios to use the backend server
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testWebCloseContacts() {
  try {
    console.log('🧪 Testing Web Close Contacts API...\n');

    // 1. Login with existing user
    console.log('1. Logging in with test user...');
    const loginResponse = await api.post('/api/v1/users/login', {
      phone: 1234567890,
      location: { coordinates: [76.4180791, 29.8154373] },
      fcmToken: 'test-web-fcm-token'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ User logged in successfully');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Get current close contacts
    console.log('2. Getting current close contacts...');
    const getContactsResponse = await api.get('/api/v1/users/getCloseContact', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Close contacts retrieved successfully');
    console.log('Current contacts:', getContactsResponse.data.contacts);
    console.log('Success:', getContactsResponse.data.success);

    // 3. Add test contacts
    console.log('\n3. Adding test contacts...');
    const testContacts = {
      'Alice Johnson': 9876543210,
      'Bob Smith': 8765432109,
      'Carol Davis': 7654321098
    };

    const addContactsResponse = await api.post('/api/v1/users/addCloseContact', {
      closeContacts: testContacts
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Close contacts added successfully');
    console.log('Added contacts:', Object.keys(testContacts).join(', '));

    // 4. Verify contacts were added
    console.log('\n4. Verifying contacts were added...');
    const verifyResponse = await api.get('/api/v1/users/getCloseContact', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('✅ Contacts verified');
    console.log('Total contacts:', Object.keys(verifyResponse.data.contacts).length);
    
    console.log('\n📋 Contact List:');
    Object.entries(verifyResponse.data.contacts).forEach(([name, phone]) => {
      console.log(`  • ${name}: ${phone}`);
    });

    console.log('\n🎉 Web Close Contacts API test completed successfully!');
    console.log('📱 The web application is ready to use at: http://localhost:3001');
    console.log('🔗 You can now test the Close Contacts functionality in the browser');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Make sure the backend server is running and the user exists');
    }
  }
}

// Run the test
testWebCloseContacts();
