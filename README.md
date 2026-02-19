# HelpMe - Emergency Assistance Platform

A real-time emergency assistance platform that allows users to send emergency alerts to their close contacts with location sharing.

## Features

- 🚨 Emergency Alert System
- 📱 SMS notifications via Twilio
- 🗺️ Real-time location tracking with Mapbox
- 👥 Emergency contacts management
- 🔐 OTP-based authentication
- 📍 Location sharing with Google Maps integration

## Tech Stack

### Backend
- Node.js & Express
- MongoDB (Atlas)
- Twilio API for SMS
- JWT Authentication
- Firebase Admin (for push notifications)

### Frontend
- React
- Vite
- Mapbox GL JS
- Axios
- React Router

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Twilio account (for SMS)
- Mapbox account (for maps)

## Environment Variables

### Backend (.env)
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_COUNTRY_CODE=91
MAPBOX_ACCESS_TOKEN=your_mapbox_token
WEB_CLIENT_URL=http://localhost:3002
PORT=5000
```

### Frontend (client/.env)
```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## Installation

### Backend Setup
```bash
# Install dependencies
npm install

# Start server
npm start
```

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from .env

### Frontend (Render/Vercel/Netlify)
1. Navigate to client directory
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

## API Endpoints

### Authentication
- `POST /api/v1/users/send-otp` - Send OTP to phone
- `POST /api/v1/users/verify-otp` - Verify OTP and login/register

### User
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/update` - Update user profile
- `POST /api/v1/users/emergency-alert` - Send emergency alert

### Location
- `PUT /api/v1/location/update` - Update user location
- `POST /api/v1/location/users` - Get nearby users

## Important Notes

### Twilio Trial Account
- Can only send SMS to verified phone numbers
- Daily limit of 50 SMS
- Verify numbers at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified

### Mapbox
- Free tier: 50,000 map loads per month
- Get token at: https://account.mapbox.com/

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
