const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

const updateDefaultUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helpme', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'helpme'
    });
    console.log('MongoDB Connected...');

    // Update default user
    const user = await User.findOneAndUpdate(
      { phone: 9999999999 },
      {
        $set: {
          name: 'Demo User',
          address: 'Bangalore, India',
          location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716]
          },
          closeContacts: {
            'Emergency Contact 1': 9876543210,
            'Emergency Contact 2': 9876543211,
            'Family Member': 9876543212
          },
          otp: '123456',
          otpExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Default user updated successfully!');
    console.log('');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('Phone Number: 9999999999');
    console.log('OTP: 123456');
    console.log('========================');
    console.log('');
    console.log('User Details:');
    console.log('- Name:', user.name);
    console.log('- Phone:', user.phone);
    console.log('- Address:', user.address);
    console.log('- Location: Bangalore (12.9716, 77.5946)');
    console.log('- Emergency Contacts:', Object.keys(user.closeContacts || {}).length, 'contacts');
    console.log('');
    console.log('Emergency Contacts:');
    if (user.closeContacts) {
      for (const [name, phone] of Object.entries(user.closeContacts)) {
        console.log(`  - ${name}: ${phone}`);
      }
    }
    console.log('');
    console.log('🎯 You can now login with these credentials!');
    console.log('');
    console.log('Steps to login:');
    console.log('1. Go to: http://localhost:3002/login');
    console.log('2. Enter phone: 9999999999');
    console.log('3. Click "Send OTP"');
    console.log('4. Enter OTP: 123456');
    console.log('5. Click "Verify & Login"');

    process.exit(0);
  } catch (err) {
    console.error('Error updating default user:', err.message);
    process.exit(1);
  }
};

updateDefaultUser();
