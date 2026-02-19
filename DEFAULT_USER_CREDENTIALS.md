# Default User Credentials

## 🔐 Login Credentials

Use these credentials to login and test the application:

```
Phone Number: 9999999999
OTP: 123456
```

## 👤 User Profile

- **Name**: Demo User
- **Phone**: 9999999999
- **Address**: Bangalore, India
- **Location**: Bangalore (12.9716, 77.5946)

## 👥 Emergency Contacts (Pre-configured)

The default user has 3 emergency contacts already added:

1. **Emergency Contact 1**: 9876543210
2. **Emergency Contact 2**: 9876543211
3. **Family Member**: 9876543212

## 🚀 How to Login

### Local Development

1. Make sure both servers are running:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3002

2. Go to: **http://localhost:3002/login**

3. Enter phone number: **9999999999**

4. Click **"Send OTP"**

5. Enter OTP: **123456**

6. Click **"Verify & Login"**

7. You're in! 🎉

### Production (After Deployment)

1. Go to your deployed frontend URL

2. Follow the same steps above

## ✨ What You Can Test

Once logged in, you can test all features:

### 1. Dashboard
- View your location on the map
- See nearby emergency alerts
- Check your profile information

### 2. Emergency Alert
- Click "Emergency Alert" button
- Confirm the alert
- SMS will be sent to all 3 emergency contacts (if Twilio is configured)

### 3. Map
- View real-time location
- See your marker on the map
- Navigate the map with controls

### 4. Location/Coordinates
- View your exact coordinates
- Get directions
- Share your location

### 5. Profile
- View your profile details
- See emergency contact count
- Check location status

### 6. Contacts Management
- Go to "Contacts" page
- View existing emergency contacts
- Add new contacts
- Edit or remove contacts

### 7. Settings
- Update your profile
- Change your name or address
- Manage account settings

## 🔄 Resetting the Default User

If you need to reset the default user, run:

```bash
node update-default-user.js
```

This will:
- Reset the OTP to 123456
- Update user details
- Ensure emergency contacts are set

## 📝 Creating Additional Test Users

You can create more test users by modifying `create-default-user.js` or using the signup flow:

1. Go to signup page
2. Enter a different phone number
3. Get OTP (via SMS if Twilio is configured)
4. Complete registration

## ⚠️ Important Notes

### OTP Validity
- The default user's OTP (123456) is valid for 1 year
- This is for testing purposes only
- In production, OTPs expire after 10 minutes

### SMS Notifications
- Emergency alerts will attempt to send SMS to the 3 contacts
- If using Twilio trial account, these numbers must be verified
- Verify numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

### Security
- **DO NOT use these credentials in production**
- Change the default user credentials before deploying
- Use proper OTP expiry times in production

## 🎯 For Deployment

When deploying to production:

1. **Option 1**: Remove the default user
   ```javascript
   // In MongoDB, delete the user with phone 9999999999
   ```

2. **Option 2**: Change the credentials
   - Update phone number
   - Use a real phone number you control
   - Set proper OTP expiry

3. **Option 3**: Keep for demo purposes
   - Useful for showcasing the app
   - Make sure to document it's a demo account

## 🆘 Troubleshooting

### Can't login with default credentials?

1. **Check if user exists**:
   ```bash
   node update-default-user.js
   ```

2. **Verify OTP hasn't expired**:
   - The script sets expiry to 1 year from now
   - Run the update script again if needed

3. **Check backend logs**:
   - Look for authentication errors
   - Verify MongoDB connection

4. **Try creating a new user**:
   - Use the signup flow instead
   - Enter a real phone number

### Emergency contacts not working?

1. **Verify phone numbers in Twilio** (for trial accounts)
2. **Check Twilio credentials** in .env
3. **Look at backend logs** for SMS errors

## 📞 Support

If you have issues with the default user:
1. Run `node update-default-user.js` to reset
2. Check MongoDB connection
3. Verify backend is running
4. Check browser console for errors
