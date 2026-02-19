# Quick Deployment Steps for Render

## Current Status
- Frontend deployed at: https://helpme5.onrender.com
- Backend needs to be deployed or URL needs to be updated

## Step 1: Deploy Backend (if not already deployed)

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect to GitHub repo: `oohareddy63-dotcom/HelpME`
4. Configure:
   - **Name**: helpme-backend (or any name)
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables (use your actual credentials):
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_COUNTRY_CODE=91
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
WEB_CLIENT_URL=https://helpme5.onrender.com
PORT=5000
```

**Note**: Get your actual credentials from the `.env` file (not committed to git)

6. Click "Create Web Service"
7. Wait for deployment
8. **Copy your backend URL** (e.g., https://helpme-backend-xyz.onrender.com)

## Step 2: Update Frontend Environment Variable

1. Go to your frontend service on Render (helpme5)
2. Go to "Environment" tab
3. Add this environment variable:
```
VITE_API_URL=https://your-backend-url.onrender.com
```
(Replace with your actual backend URL from Step 1)

4. Click "Save Changes"
5. Render will automatically redeploy

## Step 3: Update Backend CORS (Already Done)

The backend code has been updated to allow requests from:
- https://helpme5.onrender.com

If you change the frontend URL, update the `allowedOrigins` array in `index.js`

## Step 4: Test

1. Visit https://helpme5.onrender.com
2. Try logging in with default user:
   - Phone: 9999999999
   - OTP: 123456
3. Test emergency alert

## Important Notes

### First Request After Deployment
- Free tier services spin down after 15 minutes
- First request takes 30-60 seconds to wake up
- This is normal for free tier

### MongoDB Atlas
Make sure MongoDB allows connections from anywhere:
1. Go to https://cloud.mongodb.com/
2. Network Access → Add IP Address → `0.0.0.0/0`

### Twilio SMS
- Trial account can only send to verified numbers
- Verify numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
- Or upgrade to paid account for unrestricted SMS

## Troubleshooting

### "Failed to send OTP" Error
- Check that VITE_API_URL is set correctly in frontend environment
- Check backend logs for errors
- Verify backend is running

### CORS Error
- Make sure backend has frontend URL in allowedOrigins
- Check WEB_CLIENT_URL environment variable

### Backend Not Responding
- Wait 30-60 seconds for cold start
- Check backend logs in Render dashboard
- Verify all environment variables are set

## Quick Fix for Current Deployment

If backend is already deployed, just add the environment variable to frontend:

1. Render Dashboard → helpme5 service
2. Environment tab
3. Add: `VITE_API_URL=https://your-backend-url.onrender.com`
4. Save (auto-redeploys)

Done!
