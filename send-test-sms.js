// Send Test SMS Script
// Usage: node send-test-sms.js <phone_number>
// Example: node send-test-sms.js 9876543210

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioCountryCode = process.env.TWILIO_COUNTRY_CODE || '91';

console.log('\n=== Twilio SMS Test ===\n');

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.error('❌ Please provide a phone number');
  console.log('\nUsage: node send-test-sms.js <phone_number>');
  console.log('Example: node send-test-sms.js 9876543210\n');
  process.exit(1);
}

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('❌ Twilio credentials not configured in .env file\n');
  process.exit(1);
}

console.log('Configuration:');
console.log(`  Account SID: ${accountSid.substring(0, 10)}...`);
console.log(`  Auth Token: ${authToken.substring(0, 10)}...`);
console.log(`  From Number: ${twilioPhoneNumber}`);
console.log(`  Country Code: +${twilioCountryCode}`);
console.log(`  To Number: ${phoneNumber}\n`);

const client = twilio(accountSid, authToken);

async function sendTestSMS() {
  try {
    // Format phone number
    const toNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${twilioCountryCode}${phoneNumber}`;
    
    console.log(`Sending test SMS to ${toNumber}...\n`);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const message = await client.messages.create({
      body: `Your HelpMe verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhoneNumber,
      to: toNumber
    });
    
    console.log('✅ SMS SENT SUCCESSFULLY!\n');
    console.log('Message Details:');
    console.log(`  SID: ${message.sid}`);
    console.log(`  Status: ${message.status}`);
    console.log(`  To: ${message.to}`);
    console.log(`  From: ${message.from}`);
    console.log(`  OTP: ${otp}\n`);
    
    console.log('📱 Check your phone for the SMS!\n');
    console.log('If you don\'t receive it:');
    console.log('1. Check Twilio logs: https://console.twilio.com/us1/monitor/logs/sms');
    console.log('2. Verify the number is verified for trial accounts');
    console.log('3. Check if the number has signal/data\n');
    
  } catch (error) {
    console.error('\n❌ FAILED TO SEND SMS\n');
    console.error('Error Details:');
    console.error(`  Code: ${error.code}`);
    console.error(`  Message: ${error.message}`);
    console.error(`  Status: ${error.status || 'N/A'}\n`);
    
    // Provide specific solutions based on error code
    if (error.code === 21608) {
      console.log('🔧 SOLUTION: Unverified Phone Number');
      console.log('   For trial accounts, you MUST verify the recipient number.');
      console.log('   Steps:');
      console.log('   1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('   2. Click "Add a new Caller ID"');
      console.log('   3. Enter your phone number: ' + phoneNumber);
      console.log('   4. Verify with the code you receive');
      console.log('   5. Try sending SMS again\n');
    } else if (error.code === 21614) {
      console.log('🔧 SOLUTION: Invalid Phone Number');
      console.log('   The phone number format is incorrect.');
      console.log('   Try:');
      console.log('   - For India: node send-test-sms.js 9876543210');
      console.log('   - For US: node send-test-sms.js 5558675310');
      console.log('   - With country code: node send-test-sms.js +919876543210\n');
    } else if (error.code === 21211) {
      console.log('🔧 SOLUTION: Invalid "To" Phone Number');
      console.log('   The phone number is not in a valid format.');
      console.log('   Make sure:');
      console.log('   - Number has correct digits for the country');
      console.log('   - Country code in .env matches your number');
      console.log('   - Current country code: +' + twilioCountryCode + '\n');
    } else if (error.code === 63038) {
      console.log('🔧 SOLUTION: Daily SMS Limit Exceeded');
      console.log('   Trial accounts have a limit of 50 SMS per day.');
      console.log('   Options:');
      console.log('   - Wait until midnight UTC');
      console.log('   - Upgrade to a paid account');
      console.log('   - Use the OTP from backend logs for testing\n');
    } else if (error.code === 20003) {
      console.log('🔧 SOLUTION: Authentication Error');
      console.log('   Your Twilio credentials are invalid.');
      console.log('   Check:');
      console.log('   - TWILIO_ACCOUNT_SID in .env');
      console.log('   - TWILIO_AUTH_TOKEN in .env');
      console.log('   - Get correct values from: https://console.twilio.com/\n');
    } else {
      console.log('🔧 SOLUTION: Check Twilio Console');
      console.log('   View detailed error logs at:');
      console.log('   https://console.twilio.com/us1/monitor/logs/sms\n');
    }
  }
}

sendTestSMS();
