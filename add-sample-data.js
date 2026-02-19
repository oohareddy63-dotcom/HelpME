const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const sampleUsers = [
  {
    phone: 6362591283,
    name: 'Test User',
    location: {
      type: 'Point',
      coordinates: [76.4180791, 29.8154373]
    },
    fcmToken: 'sample_fcm_token_123',
    closeContacts: {
      'Mom': '+919876543210',
      'Dad': '+919876543211',
      'Sister': '+919876543212'
    },
    notifications: [
      {
        notification: {
          title: 'Emergency Alert',
          body: 'Test emergency alert message'
        },
        data: {}
      }
    ]
  },
  {
    phone: 9876543210,
    name: 'John Doe',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139]
    },
    fcmToken: 'sample_fcm_token_456',
    closeContacts: {
      'Friend1': '+919876543213',
      'Friend2': '+919876543214'
    },
    notifications: []
  }
];

async function addSampleData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove if you want to keep existing data)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Add sample users
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Added user: ${userData.name} (${userData.phone})`);
    }

    console.log('Sample data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample data:', error);
    process.exit(1);
  }
}

addSampleData();
