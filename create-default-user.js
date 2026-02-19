const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const createDefaultUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helpme', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'helpme'
    });
    console.log('MongoDB Connected...');

    // Check if default user already exists
    const existingUser = await User.findOne({ phone: 9999999999 });
    if (existingUser) {
      console.log('Default user already exists!');
      console.log('Phone: 9999999999');
      console.log('Name:', existingUser.name);
      process.exit(0);
    }

    // Create default user
    const defaultUser = new User({
      phone: 9999999999,
      name: 'Demo User',
      address: 'Bangalore, India',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716] // Bangalore coordinates
      },
      closeContacts: {
        'Emergency Contact 1': 9876543210,
        'Emergency Contact 2': 9876543211
      },
      fcmToken: 'demo-fcm-token',
      otp: '123456', // Default OTP for easy login
      otpExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Valid for 1 year
    });

    await defaultUser.save();

    console.log('✅ Default user created successfully!');
    console.log('');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('Phone Number: 9999999999');
    console.log('OTP: 123456');
    console.log('========================');
    console.log('');
    console.log('User Details:');
    console.log('- Name: Demo User');
    console.log('- Address: Bangalore, India');
    console.log('- Location: Bangalore (12.9716, 77.5946)');
    console.log('- Emergency Contacts: 2 contacts added');
    console.log('');
    console.log('You can now login with these credentials!');

    process.exit(0);
  } catch (err) {
    console.error('Error creating default user:', err.message);
    process.exit(1);
  }
};

createDefaultUser();
