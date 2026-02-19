# Environment Variables for Render Deployment

## Backend Service Environment Variables

Add these in Render Dashboard → Your Backend Service → Environment:

```
MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/helpme?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

TWILIO_ACCOUNT_SID=your_twilio_account_sid

TWILIO_AUTH_TOKEN=your_twilio_auth_token

TWILIO_PHONE_NUMBER=your_twilio_phone_number

TWILIO_COUNTRY_CODE=91

MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

WEB_CLIENT_URL=https://helpme5.onrender.com

PORT=5000
```

### Important Notes for Backend:

1. **MONGO_URI**: Replace with your actual MongoDB Atlas connection string
   - Get it from: https://cloud.mongodb.com/ → Connect → Connect your application
   - Make sure to replace `<username>`, `<password>`, and database name

2. **JWT_SECRET**: Create a strong random string (at least 32 characters)
   - You can generate one at: https://randomkeygen.com/
   - Or use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. **WEB_CLIENT_URL**: Already set to your deployed frontend URL

---

## Frontend Service Environment Variables

Add these in Render Dashboard → Your Frontend Service (helpme5) → Environment:

```
VITE_API_URL=https://your-backend-url.onrender.com

VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Important Notes for Frontend:

1. **VITE_API_URL**: Replace `your-backend-url.onrender.com` with your actual backend URL
   - Find it in Render Dashboard → Your Backend Service → URL at the top
   - Example: `https://helpme-backend-abc123.onrender.com`
   - **This is the CRITICAL variable that fixes the "Failed to send OTP" error**

2. **VITE_MAPBOX_ACCESS_TOKEN**: Already set with your Mapbox token

---

## Quick Deployment Checklist

### Step 1: Deploy Backend
- [ ] Create Web Service on Render
- [ ] Connect GitHub repo: `oohareddy63-dotcom/HelpME`
- [ ] Root Directory: (leave empty)
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Add all 9 backend environment variables above
- [ ] Wait for deployment to complete
- [ ] Copy the backend URL (e.g., `https://helpme-backend-xyz.onrender.com`)

### Step 2: Update Frontend Environment
- [ ] Go to your frontend service (helpme5) on Render
- [ ] Click "Environment" tab
- [ ] Add `VITE_API_URL` with your backend URL from Step 1
- [ ] Add `VITE_MAPBOX_ACCESS_TOKEN` 
- [ ] Save (auto-redeploys)

### Step 3: Test
- [ ] Wait 2-3 minutes for frontend redeploy
- [ ] Visit https://helpme5.onrender.com
- [ ] Login with: Phone: 9999999999, OTP: 123456
- [ ] Test emergency alert
- [ ] Verify everything works

---

## MongoDB Atlas Setup

Make sure MongoDB allows connections from Render:

1. Go to https://cloud.mongodb.com/
2. Click on your cluster → Network Access
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere"
5. Add IP: `0.0.0.0/0`
6. Click "Confirm"

---

## Twilio Setup

For SMS to work properly:

### Trial Account (Current):
- Can only send to verified phone numbers
- Verify numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Add phone number: 6362591283 (or any number you want to test)

### Production (Recommended):
- Upgrade to paid account: https://console.twilio.com/billing
- Remove trial restrictions
- Send SMS to any number

---

## Testing After Deployment

### Test 1: Default User Login
- Phone: 9999999999
- OTP: 123456
- Should login successfully

### Test 2: New User Registration
- Enter any 10-digit phone number
- Should receive OTP (if number is verified in Twilio)
- Enter OTP and complete registration

### Test 3: Emergency Alert
- Login and click "Send Emergency Alert"
- Should send SMS to emergency contacts
- Check backend logs for confirmation

---

## Troubleshooting

### "Failed to send OTP" Error
- ✅ Make sure `VITE_API_URL` is set in frontend environment
- ✅ Check backend is running (visit backend URL in browser)
- ✅ Wait 30-60 seconds for cold start (free tier)

### Backend Not Starting
- Check logs in Render Dashboard → Backend Service → Logs
- Verify all environment variables are set
- Check MongoDB connection string is correct

### SMS Not Sending
- Check Twilio credentials are correct
- Verify phone numbers in Twilio console (trial account)
- Check backend logs for Twilio errors

### CORS Error
- Make sure `WEB_CLIENT_URL` in backend matches frontend URL
- Should be: `https://helpme5.onrender.com`

---

## Local Development

For local development, use the `.env` files in the repository:

### Backend `.env`:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_COUNTRY_CODE=91
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
WEB_CLIENT_URL=http://localhost:3002
PORT=5000
```

### Frontend `client/.env`:
```
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Run locally:
```bash
# Backend
cd help-me
npm install
npm start

# Frontend (in new terminal)
cd help-me/client
npm install
npm run dev
```

---

## Success!

Once all environment variables are set and services are deployed, your HelpMe Emergency Assistance Platform will be fully functional at:

- **Frontend**: https://helpme5.onrender.com
- **Backend**: https://your-backend-url.onrender.com

Default test user: Phone 9999999999, OTP 123456
