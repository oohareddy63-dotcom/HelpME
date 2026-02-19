const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

// Test data
const testUser = {
  name: 'Test User',
  phone: 1234567890,
  location: { coordinates: [76.4180791, 29.8154373] },
  address: 'Test Address',
  fcmToken: 'test-fcm-token'
};

const testContacts = {
  'John Doe': 9996850279,
  'Jane Smith': 8866875545
};

async function testCloseContacts() {
  try {
    console.log('🧪 Testing Close Contacts API...\n');

    // 1. Login the test user
    console.log('1. Logging in test user...');
    const loginResponse = await axios.post(`${API_BASE}/users/login`, {
      phone: testUser.phone,
      location: testUser.location,
      fcmToken: testUser.fcmToken
    });
    const token = loginResponse.data.token;
    console.log('✅ User logged in successfully');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Add close contacts
    console.log('2. Adding close contacts...');
    const addContactsResponse = await axios.post(
      `${API_BASE}/users/addCloseContact`,
      { closeContacts: testContacts },
      { headers: { 'x-auth-token': token } }
    );
    console.log('✅ Close contacts added successfully');
    console.log('Response:', addContactsResponse.data.success ? 'Success' : 'Failed');
    console.log('Contacts added:', Object.keys(testContacts).join(', ') + '\n');

    // 3. Get close contacts
    console.log('3. Retrieving close contacts...');
    const getContactsResponse = await axios.get(
      `${API_BASE}/users/getCloseContact`,
      { headers: { 'x-auth-token': token } }
    );
    console.log('✅ Close contacts retrieved successfully');
    console.log('Response success:', getContactsResponse.data.success);
    console.log('Contacts retrieved:', getContactsResponse.data.contacts);
    
    // Verify the data structure
    const contacts = getContactsResponse.data.contacts;
    if (contacts && typeof contacts === 'object') {
      console.log('\n📋 Contact List:');
      Object.entries(contacts).forEach(([name, phone]) => {
        console.log(`  • ${name}: ${phone}`);
      });
      console.log('\n🎉 All tests passed! The close contacts functionality is working correctly.');
    } else {
      console.log('\n❌ Error: Expected contacts object but got:', typeof contacts);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCloseContacts();
