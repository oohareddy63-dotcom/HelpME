const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function createDevOTP() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find or create test user with OTP
    const phone = 6362591283;
    const otp = '123456'; // Fixed OTP for testing
    
    let user = await User.findOne({ phone });
    if (user) {
      await User.updateOne({ phone }, { 
        $set: { 
          otp, 
          otpExpiry: new Date(Date.now() + 10 * 60 * 1000) 
        } 
      });
      console.log(`Updated existing user: ${user.name}`);
    } else {
      user = new User({
        phone,
        name: 'Test User',
        location: {
          type: 'Point',
          coordinates: [76.4180791, 29.8154373]
        },
        fcmToken: 'sample_fcm_token_123',
        closeContacts: {
          'Mom': '+919876543210',
          'Dad': '+919876543211'
        },
        notifications: [],
        otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
      });
      await user.save();
      console.log(`Created new user: ${user.name}`);
    }

    console.log(`Development OTP created: ${otp} for phone: ${phone}`);
    console.log('Use this OTP to login: 123456');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createDevOTP();
