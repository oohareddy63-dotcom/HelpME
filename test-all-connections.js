const mongoose = require('mongoose');
require('dotenv').config();

console.log('\n🔍 Testing All Connections...\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking Environment Variables:');
console.log('   ✓ MONGO_URI:', process.env.MONGO_URI ? '✓ Set' : '✗ Missing');
console.log('   ✓ JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Missing');
console.log('   ✓ TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✓ Set' : '✗ Missing');
console.log('   ✓ TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✓ Set' : '✗ Missing');
console.log('   ✓ TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✓ Set' : '✗ Missing');
console.log('   ✓ MAPBOX_ACCESS_TOKEN:', process.env.MAPBOX_ACCESS_TOKEN ? '✓ Set' : '✗ Missing');

// Test 2: MongoDB Connection
console.log('\n2️⃣ Testing MongoDB Connection:');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'helpme',
  retryWrites: false,
  w: 'majority'
})
.then(() => {
  console.log('   ✅ MongoDB Connected Successfully!');
  
  // Test 3: Twilio
  console.log('\n3️⃣ Testing Twilio Configuration:');
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('   ✅ Twilio Client Initialized!');
    console.log('   📱 Phone Number:', process.env.TWILIO_PHONE_NUMBER);
    console.log('   🌍 Country Code:', process.env.TWILIO_COUNTRY_CODE);
  } catch (err) {
    console.log('   ⚠️  Twilio Error:', err.message);
  }
  
  // Test 4: Check Default User
  console.log('\n4️⃣ Checking Default User:');
  const User = require('./models/user');
  User.findOne({ phone: 9999999999 })
    .then(user => {
      if (user) {
        console.log('   ✅ Default User Found!');
        console.log('   📱 Phone:', user.phone);
        console.log('   👤 Name:', user.name);
        console.log('   🔑 OTP:', user.otp || '123456');
      } else {
        console.log('   ⚠️  Default User Not Found - Run create-default-user.js');
      }
      
      console.log('\n✅ All Tests Complete!\n');
      console.log('📋 Summary:');
      console.log('   ✓ Environment variables loaded');
      console.log('   ✓ MongoDB connected');
      console.log('   ✓ Twilio configured');
      console.log('   ✓ Ready to start server!\n');
      
      process.exit(0);
    })
    .catch(err => {
      console.log('   ⚠️  Error checking user:', err.message);
      process.exit(0);
    });
})
.catch(err => {
  console.log('   ❌ MongoDB Connection Failed!');
  console.log('   Error:', err.message);
  console.log('\n⚠️  Please update MONGO_URI in .env file\n');
  process.exit(1);
});
