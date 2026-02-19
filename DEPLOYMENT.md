# Deployment Guide for Render

## ✅ Code Successfully Pushed to GitHub

Repository: https://github.com/oohareddy63-dotcom/HelpME.git

## Backend Deployment on Render

### Step 1: Create Web Service

1. Go to: https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: `oohareddy63-dotcom/HelpME`
5. Configure:
   - **Name**: helpme-backend
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### Step 2: Add Environment Variables

In Render dashboard, add these environment variables:

```
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_COUNTRY_CODE=91

MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

WEB_CLIENT_URL=https://your-frontend-url.onrender.com

PORT=5000
```

### Step 3: Deploy

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://helpme-backend.onrender.com`

## Frontend Deployment on Render

### Step 1: Create Static Site

1. Go to: https://dashboard.render.com/
2. Click "New +" → "Static Site"
3. Select repository: `oohareddy63-dotcom/HelpME`
4. Configure:
   - **Name**: helpme-frontend
   - **Branch**: main
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: client/dist

### Step 2: Add Environment Variables

```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

### Step 3: Update API URL

Before deploying frontend, update the API URL in `client/src/api.js`:

```javascript
const api = axios.create({
  baseURL: 'https://helpme-backend.onrender.com', // Your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Step 4: Deploy

1. Click "Create Static Site"
2. Wait for deployment
3. Your app will be live at: `https://helpme-frontend.onrender.com`

## Post-Deployment Steps

### 1. Update Backend CORS

Update `WEB_CLIENT_URL` in backend environment variables to your frontend URL:
```
WEB_CLIENT_URL=https://helpme-frontend.onrender.com
```

### 2. Test the Application

1. Visit your frontend URL
2. Try registering/logging in
3. Test emergency alert
4. Verify SMS is being sent

### 3. Monitor Logs

- Backend logs: Render dashboard → Your service → Logs
- Check for any errors

## Important Notes

### Free Tier Limitations

Render free tier:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free

### Upgrade for Production

For production use, upgrade to paid plan:
- No spin-down
- Better performance
- Custom domains
- More resources

### MongoDB Atlas

Ensure MongoDB Atlas allows connections from anywhere:
1. Go to: https://cloud.mongodb.com/
2. Network Access → Add IP Address
3. Add: `0.0.0.0/0` (allow from anywhere)

### Twilio

Remember to verify phone numbers in Twilio console for trial account:
https://console.twilio.com/us1/develop/phone-numbers/manage/verified

## Troubleshooting

### Backend not starting
- Check logs in Render dashboard
- Verify all environment variables are set
- Check MongoDB connection string

### Frontend can't connect to backend
- Verify API URL in `client/src/api.js`
- Check CORS settings in backend
- Verify backend is running

### SMS not sending
- Check Twilio credentials
- Verify phone numbers (trial account)
- Check backend logs for Twilio errors

## Custom Domain (Optional)

### Backend
1. Render dashboard → Your service → Settings
2. Add custom domain
3. Update DNS records

### Frontend
1. Render dashboard → Your static site → Settings
2. Add custom domain
3. Update DNS records

## Success!

Your HelpMe Emergency Assistance Platform is now deployed and ready to use!

- Backend: https://helpme-backend.onrender.com
- Frontend: https://helpme-frontend.onrender.com
