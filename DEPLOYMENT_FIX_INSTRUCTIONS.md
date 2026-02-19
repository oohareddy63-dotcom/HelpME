# Fix "Failed to send OTP" Error - Deployment Instructions

## Problem
Your frontend at https://helpme5.onrender.com cannot connect to the backend because the API URL is not configured.

## Solution - 3 Simple Steps

### Step 1: Find Your Backend URL

Go to your Render dashboard and find your backend service URL. It should look like:
- `https://helpme-backend-xyz.onrender.com`
- OR whatever name you gave your backend service

If you haven't deployed the backend yet, deploy it first using the instructions in `RENDER_DEPLOYMENT_STEPS.md`

### Step 2: Add Environment Variable to Frontend

1. Go to https://dashboard.render.com/
2. Click on your frontend service (helpme5)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (use your actual backend URL)
6. Click "Save Changes"

Render will automatically redeploy your frontend with the new configuration.

### Step 3: Wait and Test

1. Wait 2-3 minutes for the redeploy to complete
2. Visit https://helpme5.onrender.com
3. Try logging in with the default user:
   - Phone: 9999999999
   - OTP: 123456

## That's It!

The error should be fixed. If you still see issues:

1. Check backend logs in Render dashboard
2. Make sure backend has all environment variables set (see RENDER_DEPLOYMENT_STEPS.md)
3. Wait 30-60 seconds on first request (free tier cold start)

## Backend Environment Variables Checklist

Make sure your backend has these set in Render:

- ✅ MONGO_URI
- ✅ JWT_SECRET
- ✅ TWILIO_ACCOUNT_SID
- ✅ TWILIO_AUTH_TOKEN
- ✅ TWILIO_PHONE_NUMBER
- ✅ TWILIO_COUNTRY_CODE
- ✅ MAPBOX_ACCESS_TOKEN
- ✅ WEB_CLIENT_URL (should be https://helpme5.onrender.com)
- ✅ PORT (should be 5000)

## Code Changes Pushed

The following changes have been pushed to GitHub:

1. ✅ Frontend API client now uses environment variable for backend URL
2. ✅ Backend CORS updated to allow https://helpme5.onrender.com
3. ✅ Timeout increased to 30 seconds for slower cold starts
4. ✅ Environment variable examples updated

Your Render services should automatically pick up these changes on next deploy.
