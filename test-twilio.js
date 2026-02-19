// Twilio Test Script
// Run this file with: node test-twilio.js

require('dotenv').config();
const twilio = require('twilio');

// Load credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('=== Twilio Configuration Test ===\n');
console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : 'NOT SET');
console.log('Auth Token:', authToken ? `${authToken.substring(0, 10)}...` : 'NOT SET');
console.log('Phone Number:', twilioPhoneNumber || 'NOT SET');
console.log('\n');

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('❌ ERROR: Twilio credentials are not properly configured in .env file');
  console.log('\nPlease ensure your .env file contains:');
  console.log('TWILIO_ACCOUNT_SID=your_account_sid');
  console.log('TWILIO_AUTH_TOKEN=your_auth_token');
  console.log('TWILIO_PHONE_NUMBER=your_phone_number');
  process.exit(1);
}

// Initialize Twilio client
const client = twilio(accountSid, authToken);

async function testTwilioConnection() {
  try {
    console.log('Testing Twilio connection...\n');
    
    // Test 1: Verify account
    console.log('✓ Twilio client initialized successfully');
    
    // Test 2: Fetch account details
    const account = await client.api.accounts(accountSid).fetch();
    console.log('✓ Account verified:', account.friendlyName);
    console.log('  Status:', account.status);
    console.log('  Type:', account.type);
    
    // Test 3: List available phone numbers
    console.log('\n✓ Twilio phone number configured:', twilioPhoneNumber);
    
    console.log('\n=== Twilio Configuration is READY ===');
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('1. This is a TRIAL account - you can only send SMS to verified phone numbers');
    console.log('2. Verify recipient numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    console.log('3. Trial messages will include "Sent from your Twilio trial account" prefix');
    console.log('4. Daily SMS limit: 50 messages per day');
    
    console.log('\n✅ Your emergency alert system is ready to send SMS!');
    
  } catch (error) {
    console.error('\n❌ ERROR testing Twilio connection:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 20003) {
      console.log('\n💡 TIP: Your credentials are invalid. Please check:');
      console.log('   - Account SID starts with "AC"');
      console.log('   - Auth Token is correct');
      console.log('   - Get credentials from: https://console.twilio.com/');
    }
    
    process.exit(1);
  }
}

// Optional: Send a test message (uncomment to test)
async function sendTestMessage(toPhoneNumber) {
  try {
    console.log(`\nSending test message to ${toPhoneNumber}...`);
    
    const message = await client.messages.create({
      body: '🆘 Test message from HelpMe Emergency Alert System. Your Twilio integration is working!',
      from: twilioPhoneNumber,
      to: toPhoneNumber
    });
    
    console.log('✅ Test message sent successfully!');
    console.log('   Message SID:', message.sid);
    console.log('   Status:', message.status);
    console.log('   To:', message.to);
    
  } catch (error) {
    console.error('\n❌ ERROR sending test message:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 21608) {
      console.log('\n💡 TIP: The recipient phone number is not verified.');
      console.log('   For trial accounts, verify numbers at:');
      console.log('   https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    }
  }
}

// Run the test
testTwilioConnection();

// Uncomment the line below to send a test message
// Replace with a verified phone number (must include country code, e.g., +15558675310)
// sendTestMessage('+15558675310');
