// Quick Phone Number Verification Script
// This helps you verify if your phone number is ready to receive OTP

require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioCountryCode = process.env.TWILIO_COUNTRY_CODE || '1';

console.log('\n=== Phone Number Verification Helper ===\n');

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('❌ Twilio credentials not configured in .env file');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function checkVerifiedNumbers() {
  try {
    console.log('Fetching verified phone numbers from Twilio...\n');
    
    const validationRequests = await client.validationRequests.list({ limit: 20 });
    
    if (validationRequests.length === 0) {
      console.log('⚠️  No verified phone numbers found!\n');
      console.log('For trial accounts, you MUST verify recipient numbers.');
      console.log('\nTo verify a number:');
      console.log('1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
      console.log('2. Click "Add a new Caller ID"');
      console.log('3. Enter your phone number');
      console.log('4. Verify with the code received\n');
      return;
    }
    
    console.log('✅ Verified Phone Numbers:\n');
    validationRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.phoneNumber}`);
      console.log(`   Status: ${request.validationCode ? 'Verified' : 'Pending'}`);
      console.log(`   Friendly Name: ${request.friendlyName || 'N/A'}`);
      console.log('');
    });
    
    console.log('✅ You can send OTP to these numbers!\n');
    
  } catch (error) {
    console.error('Error fetching verified numbers:', error.message);
    console.log('\n💡 TIP: You can manually check verified numbers at:');
    console.log('https://console.twilio.com/us1/develop/phone-numbers/manage/verified\n');
  }
}

async function sendTestOTP(phoneNumber) {
  try {
    // Format phone number
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${twilioCountryCode}${phoneNumber}`;
    
    console.log(`\nSending test OTP to ${formattedNumber}...\n`);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const message = await client.messages.create({
      body: `Your HelpMe verification code is: ${otp}. Valid for 10 minutes.`,
      from: twilioPhoneNumber,
      to: formattedNumber
    });
    
    console.log('✅ Test OTP sent successfully!');
    console.log(`   Message SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   To: ${message.to}`);
    console.log(`   OTP: ${otp}\n`);
    
    console.log('Check your phone for the SMS message!\n');
    
  } catch (error) {
    console.error('\n❌ Failed to send test OTP:');
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Error Message: ${error.message}\n`);
    
    if (error.code === 21608) {
      console.log('💡 This number is not verified for your trial account.');
      console.log('   Verify it at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified\n');
    } else if (error.code === 21614) {
      console.log('💡 Invalid phone number format.');
      console.log('   Use format: +[country code][number]');
      console.log('   Example: +15558675310\n');
    }
  }
}

// Main execution
async function main() {
  console.log('Twilio Configuration:');
  console.log(`  Account SID: ${accountSid.substring(0, 10)}...`);
  console.log(`  Phone Number: ${twilioPhoneNumber}`);
  console.log(`  Country Code: +${twilioCountryCode}\n`);
  
  await checkVerifiedNumbers();
  
  // Uncomment to send test OTP
  // Replace with your verified phone number
  // await sendTestOTP('5558675310');  // US format (10 digits)
  // await sendTestOTP('+15558675310'); // Full format with country code
}

main();
