# ⚠️ IMPORTANT: Setup MongoDB First!

## You Need to Update MongoDB Connection String

The `.env` file has a placeholder MongoDB URI. You must replace it with your actual connection string.

---

## Quick Setup (5 minutes)

### Step 1: Get Your MongoDB Connection String

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** to your account
3. **Click "Connect"** on your cluster
4. **Choose "Connect your application"**
5. **Copy the connection string**

It looks like:
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

### Step 2: Modify the Connection String

**Remove** `retryWrites=true&` and **add** database name:

**Before:**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://username:password@cluster0.abc123.mongodb.net/helpme?w=majority
```

### Step 3: Update .env File

1. Open `help-me/.env`
2. Find this line:
   ```
   MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/helpme?w=majority
   ```
3. Replace with your actual connection string
4. Save the file

### Step 4: Allow Connections in MongoDB Atlas

1. Go to MongoDB Atlas
2. Click "Network Access" (left sidebar)
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere"
5. Enter: `0.0.0.0/0`
6. Click "Confirm"

---

## Then Run These Commands:

```bash
# 1. Test connections
node test-all-connections.js

# 2. Create default user
node create-default-user.js

# 3. Start the app
node start-app.js
```

---

## Don't Have MongoDB Atlas?

### Create Free Account (2 minutes):

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a free cluster (M0)
4. Create database user
5. Get connection string
6. Follow steps above

---

## Alternative: Use Local MongoDB

If you have MongoDB installed locally:

Update `.env`:
```
MONGO_URI=mongodb://localhost:27017/helpme
```

---

## Need Help?

**Error: "querySrv ENOTFOUND"**
- Means MongoDB URI is not correct
- Follow steps above to get real connection string

**Error: "Authentication failed"**
- Username or password is wrong
- Check your MongoDB Atlas credentials

**Error: "Network timeout"**
- Add 0.0.0.0/0 to Network Access in MongoDB Atlas

---

## After MongoDB is Set Up:

Everything else is already configured:
- ✅ Twilio credentials
- ✅ Mapbox token
- ✅ JWT secret
- ✅ Frontend configuration
- ✅ Backend configuration

Just need MongoDB connection string!

---

## Quick Reference

**Your Current Configuration:**
- Backend Port: 5000
- Frontend Port: 3002
- Twilio: ✅ Configured
- Mapbox: ✅ Configured
- MongoDB: ⚠️ Needs your connection string

**What to Update:**
- `help-me/.env` → Line 2 → MONGO_URI

**Then Run:**
```bash
node test-all-connections.js
node create-default-user.js
node start-app.js
```

---

## 🎯 You're Almost There!

Just add your MongoDB connection string and everything will work perfectly!
