const axios = require('axios');

// Test location-based user discovery
async function testLocationDiscovery() {
  const baseURL = 'http://localhost:5000';
  console.log('Testing location-based user discovery...\n');
  
  try {
    // Register two test users
    console.log('1. Creating test users...');
    
    const user1 = await axios.post(`${baseURL}/api/v1/users/register`, {
      name: 'User One',
      phone: '1111111115',
      address: 'Location 1',
      location: {
        coordinates: [77.2090, 28.7041] // Delhi
      },
      fcmToken: 'test-fcm-token-1'
    });
    
    console.log('✓ User 1 created:', user1.data.userId);
    
    const user2 = await axios.post(`${baseURL}/api/v1/users/register`, {
      name: 'User Two',
      phone: '2222222225',
      address: 'Location 2',
      location: {
        coordinates: [77.2095, 28.7045] // Very close to user 1
      },
      fcmToken: 'test-fcm-token-2'
    });
    
    console.log('✓ User 2 created:', user2.data.userId);
    
    // Test location update for user 1
    console.log('\n2. Testing location update...');
    const locationUpdate = await axios.put(`${baseURL}/api/v1/location/update`, {
      location: {
        coordinates: [77.2090, 28.7041]
      }
    }, {
      headers: {
        'Authorization': `Bearer ${user1.data.token}`
      }
    });
    
    console.log('✓ Location updated:', locationUpdate.data);
    
    // Test finding nearby users
    console.log('\n3. Finding nearby users...');
    const nearbyUsers = await axios.post(`${baseURL}/api/v1/location/users`, {
      longitude: 77.2090,
      latitude: 28.7041,
      distance: 50000 // 50km
    }, {
      headers: {
        'Authorization': `Bearer ${user1.data.token}`
      }
    });
    
    console.log('✓ Nearby users found:', nearbyUsers.data.results.length);
    console.log('User results:', nearbyUsers.data.results.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
      distance: Math.sqrt(
        Math.pow(u.location.coordinates[0] - 77.2090, 2) +
        Math.pow(u.location.coordinates[1] - 28.7041, 2)
      ) * 111000 + ' meters'
    })));
    
    // Test emergency alert
    console.log('\n4. Testing emergency alert...');
    const emergencyAlert = await axios.post(`${baseURL}/api/v1/location/users`, {
      longitude: 77.2090,
      latitude: 28.7041,
      distance: 5000
    }, {
      headers: {
        'Authorization': `Bearer ${user1.data.token}`
      }
    });
    
    console.log('✓ Emergency alert sent:', emergencyAlert.data.success);
    console.log('Nearby users notified:', emergencyAlert.data.results.length);
    
    console.log('\n✅ Location discovery tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Location discovery test failed:', error.response?.data || error.message);
  }
}

testLocationDiscovery();