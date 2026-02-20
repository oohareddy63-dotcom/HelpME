# 🚀 Setup and Run - 100% Working Guide

## Prerequisites

Before running, you need:
- ✅ Node.js installed
- ✅ MongoDB Atlas account (free tier)
- ✅ Twilio account (already configured)

---

## Step 1: Update MongoDB Connection String

**IMPORTANT**: You must add your MongoDB connection string!

1. Go to https://cloud.mongodb.com/
2. Click "Connect" → "Connect your application"
3. Copy your connection string
4. Open `help-me/.env`
5. Replace this line:
   ```
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/helpme?w=majority
   ```
   With your actual connection string (remove `retryWrites=true&` if present)

**Example:**
```
MONGO_URI=mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/helpme?w=majority
```

---

## Step 2: Install Dependencies

### Backend:
```bash
cd help-me
npm install
```

### Frontend:
```bash
cd client
npm install
cd ..
```

---

## Step 3: Test All Connections

Run this to verify everything is configured:

```bash
node test-all-connections.js
```

**Expected Output:**
```
✅ MongoDB Connected Successfully!
✅ Twilio Client Initialized!
✅ Default User Found!
✅ All Tests Complete!
```

**If MongoDB fails:**
- Check your connection string in `.env`
- Make sure you replaced `your_username` and `your_password`
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

## Step 4: Create Default User (First Time Only)

```bash
node create-default-user.js
```

This creates a test user:
- Phone: 9999999999
- OTP: 123456

---

## Step 5: Start the Application

### Option A: Start Both Servers Together (Recommended)

```bash
node start-app.js
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:3002

### Option B: Start Separately

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## Step 6: Test the Application

1. **Open Browser**: http://localhost:3002

2. **Test Login**:
   - Click "Login"
   - Phone: 9999999999
   - Click "Send OTP"
   - OTP will show on screen: 123456
   - Enter OTP and login

3. **Test Registration**:
   - Click "Sign Up"
   - Enter any 10-digit phone number
   - OTP will show on screen
   - Fill in name and address
   - Complete registration

4. **Test Emergency Alert**:
   - After login, click "Send Emergency Alert"
   - Should see success message

---

## ✅ Verification Checklist

### Backend (http://localhost:5000)
- [ ] Visit in browser, should see: `{"message":"app is delpoyed and tested"}`
- [ ] Console shows: "MongoDB Connected successfully"
- [ ] Console shows: "Server started on http://localhost:5000"

### Frontend (http://localhost:3002)
- [ ] Home page loads with cyan/blue gradient
- [ ] Can navigate to Login page
- [ ] Can navigate to Sign Up page

### OTP System
- [ ] Send OTP shows OTP on screen (dev mode)
- [ ] Can verify OTP and login
- [ ] Can register new users

### Database
- [ ] Users are saved to MongoDB
- [ ] Can login with saved users
- [ ] Emergency contacts are saved

---

## 🐛 Troubleshooting

### "MongoDB Connection Failed"
**Solution:**
1. Check `.env` file has correct `MONGO_URI`
2. Go to MongoDB Atlas → Network Access
3. Add IP: `0.0.0.0/0` (allow from anywhere)
4. Verify username/password are correct

### "Port 5000 already in use"
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### "Port 3002 already in use"
**Solution:**
```bash
# Kill the process or change port in client/vite.config.js
server: {
  port: 3003
}
```

### "Cannot reach server" in frontend
**Solution:**
1. Make sure backend is running on port 5000
2. Check `client/.env` has: `VITE_API_URL=http://localhost:5000`
3. Restart frontend

### OTP not showing
**Solution:**
- This is normal! OTP shows in response (dev mode)
- Check browser console (F12) for OTP
- Or use default user: 9999999999 / 123456

---

## 📝 Environment Variables Summary

### Backend (.env)
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_key_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_COUNTRY_CODE=91
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
WEB_CLIENT_URL=http://localhost:3002
PORT=5000
```

### Frontend (client/.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

---

## 🎯 Quick Start Commands

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Test connections
node test-all-connections.js

# 3. Create default user (first time only)
node create-default-user.js

# 4. Start application
node start-app.js

# 5. Open browser
# http://localhost:3002
```

---

## ✅ Success Indicators

You'll know everything is working when:

✅ Backend console shows "MongoDB Connected successfully"
✅ Backend console shows "Server started on http://localhost:5000"
✅ Frontend opens at http://localhost:3002
✅ Can login with 9999999999 / 123456
✅ Dashboard loads after login
✅ Can send emergency alerts

---

## 🎉 You're All Set!

Your HelpMe Emergency Assistance Platform is now running locally!

**Default Test User:**
- Phone: 9999999999
- OTP: 123456

**URLs:**
- Frontend: http://localhost:3002
- Backend: http://localhost:5000

**Next Steps:**
- Add emergency contacts in dashboard
- Test emergency alert feature
- Deploy to Render (see DEPLOY_NOW.md)

---

## 📚 Additional Resources

- **Deployment**: See `DEPLOY_NOW.md`
- **Troubleshooting**: See `DEPLOYMENT_TROUBLESHOOTING.md`
- **MongoDB Fix**: See `MONGODB_FIX_COMPLETE.md`
- **Vite Fix**: See `VITE_HOST_FIX.md`
