# Deployment Troubleshooting Guide

## OTP Problem on Render - Solutions

### Problem: "Failed to send OTP" or OTP not working after deployment

This guide will help you fix OTP issues on Render deployment.

---

## Quick Diagnosis

### Step 1: Check Backend Logs

1. Go to Render Dashboard → Your Backend Service
2. Click "Logs" tab
3. Look for these messages when you try to send OTP:

**Good signs:**
```
[OTP Request] Phone: 9999999999
[OTP Generated] 123456 for phone 9999999999
[Dev Mode] Twilio not configured - OTP: 123456
```

**Bad signs:**
```
Error: MONGO_URI not defined
Error connecting to database
Failed to send OTP
```

### Step 2: Check Frontend Can Reach Backend

1. Open browser console (F12) on your deployed frontend
2. Try to send OTP
3. Look for network errors:

**Good:**
```
POST https://your-backend.onrender.com/api/v1/users/send-otp
Status: 200 OK
Response: { success: true, otp: "123456" }
```

**Bad:**
```
POST https://your-backend.onrender.com/api/v1/users/send-otp
Status: Failed
ERR_NETWORK or CORS error
```

---

## Solution 1: Backend Not Reachable (Most Common)

### Symptoms:
- "Cannot reach server" error
- "Network error" in frontend
- CORS errors in browser console

### Fix:

1. **Check Frontend Environment Variable**
   - Render Dashboard → Frontend Service (helpme5) → Environment
   - Make sure `VITE_API_URL` is set to your backend URL
   - Example: `https://helpme-backend-xyz.onrender.com`
   - **Important**: No trailing slash!

2. **Verify Backend is Running**
   - Visit your backend URL in browser
   - Should see: `{"message":"app is delpoyed and tested"}`
   - If not loading, check backend logs for errors

3. **Check CORS Configuration**
   - Backend should have `WEB_CLIENT_URL=https://helpme5.onrender.com`
   - Code already includes this in allowed origins

4. **Redeploy Frontend**
   - After adding `VITE_API_URL`, Render auto-redeploys
   - Wait 2-3 minutes for deployment to complete

---

## Solution 2: MongoDB Connection Issues

### Symptoms:
- Backend logs show "Error connecting to database"
- "Internal Server Error" responses
- Backend crashes on startup

### Fix:

1. **Check MongoDB URI**
   - Render Dashboard → Backend Service → Environment
   - Verify `MONGO_URI` is correct
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/helpme?retryWrites=true&w=majority`

2. **Allow Render IPs in MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Network Access → Add IP Address
   - Add: `0.0.0.0/0` (allow from anywhere)
   - Click "Confirm"

3. **Test Connection**
   - Check backend logs after redeployment
   - Should see: "MongoDB connected successfully"

---

## Solution 3: Missing Environment Variables

### Symptoms:
- Backend starts but OTP fails
- "JWT_SECRET not defined" errors
- Twilio errors in logs

### Fix:

Check all required environment variables are set in Render:

**Backend Environment Variables (Required):**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_COUNTRY_CODE=91
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
WEB_CLIENT_URL=https://helpme5.onrender.com
PORT=5000
```

**Frontend Environment Variables (Required):**
```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

---

## Solution 4: OTP Working But Not Receiving SMS

### Symptoms:
- OTP is generated (visible in logs)
- No SMS received on phone
- "Trial restriction" or "Daily limit" in logs

### This is Expected Behavior!

**Why:**
- Twilio trial account can only send to verified numbers
- Daily limit: 50 SMS per day
- After limit, SMS stops but OTP still works

**How to Use:**

1. **Check Backend Logs for OTP**
   - Render Dashboard → Backend Service → Logs
   - Look for: `[Dev Mode] OTP for 9999999999: 123456`
   - Use this OTP to login

2. **Or Use Default User**
   - Phone: 9999999999
   - OTP: 123456 (valid for 1 year)

3. **For Real SMS (Production):**
   - Verify phone numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
   - Add: 6362591283 or any number you want to test
   - OR upgrade to paid Twilio account

---

## Solution 5: Cold Start Delays

### Symptoms:
- First request takes 30-60 seconds
- Timeout errors on first try
- Works fine after first request

### This is Normal for Free Tier!

**Fix:**
- Wait 30-60 seconds for first request
- Try again if timeout occurs
- Subsequent requests will be fast

**For Production:**
- Upgrade to paid Render plan (no cold starts)
- Or keep free tier and inform users about initial delay

---

## Testing Checklist

After applying fixes, test in this order:

### 1. Backend Health Check
- [ ] Visit backend URL in browser
- [ ] Should see: `{"message":"app is delpoyed and tested"}`

### 2. Frontend Can Reach Backend
- [ ] Open frontend in browser
- [ ] Open browser console (F12)
- [ ] Try to send OTP
- [ ] Check Network tab for successful API call

### 3. OTP Generation
- [ ] Check backend logs
- [ ] Should see: `[OTP Generated] 123456 for phone...`

### 4. Login with Default User
- [ ] Phone: 9999999999
- [ ] OTP: 123456
- [ ] Should login successfully

### 5. Login with New Number
- [ ] Enter any 10-digit number
- [ ] Check backend logs for OTP
- [ ] Use OTP from logs to login

---

## Common Mistakes

### ❌ Wrong: Frontend VITE_API_URL with trailing slash
```
VITE_API_URL=https://backend.onrender.com/
```

### ✅ Correct: No trailing slash
```
VITE_API_URL=https://backend.onrender.com
```

---

### ❌ Wrong: Using localhost in production
```
VITE_API_URL=http://localhost:5000
```

### ✅ Correct: Using actual backend URL
```
VITE_API_URL=https://your-backend.onrender.com
```

---

### ❌ Wrong: MongoDB not allowing Render IPs
```
Network Access: Only specific IPs allowed
```

### ✅ Correct: Allow all IPs
```
Network Access: 0.0.0.0/0 added
```

---

## Still Not Working?

### Get Detailed Logs

1. **Backend Logs:**
   ```
   Render Dashboard → Backend Service → Logs
   Look for [OTP Request], [OTP Generated], [SMS] messages
   ```

2. **Frontend Console:**
   ```
   Browser → F12 → Console tab
   Look for API errors and responses
   ```

3. **Network Tab:**
   ```
   Browser → F12 → Network tab
   Filter: XHR
   Check send-otp request and response
   ```

### Contact Support

If still having issues, provide:
1. Backend logs (last 50 lines)
2. Frontend console errors
3. Network tab screenshot of failed request
4. Environment variables (without sensitive values)

---

## Success Indicators

You'll know it's working when:

✅ Backend URL loads in browser
✅ Frontend console shows successful API calls
✅ Backend logs show OTP generation
✅ Can login with default user (9999999999 / 123456)
✅ Can see OTP in backend logs for new numbers

---

## Quick Reference

**Default Test User:**
- Phone: 9999999999
- OTP: 123456

**Backend Health Check:**
- Visit: `https://your-backend.onrender.com`
- Should see: `{"message":"app is delpoyed and tested"}`

**Check OTP in Logs:**
- Render Dashboard → Backend → Logs
- Look for: `[Dev Mode] OTP for [phone]: [code]`

**Verify Phone for Real SMS:**
- https://console.twilio.com/us1/develop/phone-numbers/manage/verified
