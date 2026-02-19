const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const User = require("../models/user");
const OtpCache = require("../models/otpCache");

// Twilio configuration - safely initialize only when credentials exist
let twilioClient = null;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioCountryCode = process.env.TWILIO_COUNTRY_CODE || '91'; // Default India +91
if (accountSid && authToken) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(accountSid, authToken);
  } catch (err) {
    console.warn('Twilio init failed - OTP will work in dev mode only:', err.message);
  }
}

// @route       POST api/v1/users/send-otp
// @dsc         Send OTP to user's phone
// @access      Public
router.post("/send-otp", [
  check("phone", "Please include a valid 10-digit phone number").custom((val) => String(val).length === 10)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { phone } = req.body;
  const phoneNum = typeof phone === "string" ? parseInt(phone, 10) : phone;

  console.log(`[OTP Request] Phone: ${phoneNum}, Type: ${typeof phone}`);

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    console.log(`[OTP Generated] ${otp} for phone ${phoneNum}, expires at ${otpExpiry}`);

    const existingUser = await User.findOne({ phone: phoneNum });
    if (existingUser) {
      await User.updateOne({ phone: phoneNum }, { $set: { otp, otpExpiry } });
      console.log(`[OTP] Updated existing user ${phoneNum}`);
    } else {
      await OtpCache.findOneAndUpdate(
        { phone: phoneNum },
        { $set: { otp, otpExpiry } },
        { upsert: true, new: true }
      );
      console.log(`[OTP] Created OTP cache for new user ${phoneNum}`);
    }

    if (twilioClient && twilioPhoneNumber) {
      const toNumber = phone.toString().startsWith('+') ? phone : `+${twilioCountryCode.replace(/^\+/, '')}${phone}`;
      console.log(`[SMS] Attempting to send to ${toNumber}`);
      try {
        await twilioClient.messages.create({
          body: `Your HelpMe verification code is: ${otp}. Valid for 10 minutes.`,
          from: twilioPhoneNumber,
          to: toNumber
        });
        console.log(`[SMS] OTP sent successfully to ${toNumber}`);
      } catch (twilioError) {
        console.error('[SMS Error]', twilioError.message, 'Code:', twilioError.code);
        
        // Handle various Twilio errors gracefully
        const isDailyLimitExceeded = twilioError.code === 63038;
        const isTrialRestriction = twilioError.code === 21608 || twilioError.code === 21211;
        const isInvalidNumber = twilioError.code === 21614;
        
        if (isDailyLimitExceeded) {
          console.log(`[SMS] Daily limit exceeded - Dev fallback - OTP: ${otp}`);
        } else if (isTrialRestriction) {
          console.log(`[SMS] Trial restriction - Dev fallback - OTP: ${otp}`);
        } else if (isInvalidNumber) {
          console.log(`[SMS] Invalid number - Dev fallback - OTP: ${otp}`);
        } else {
          console.log(`[SMS] Error ${twilioError.code} - Dev fallback - OTP: ${otp}`);
        }
        
        // Don't throw error - allow OTP to be returned in response
      }
    } else {
      console.log(`[Dev Mode] Twilio not configured - OTP for ${phone}: ${otp}`);
    }

    // Always return OTP in response for development/testing
    // In production with working SMS, you can remove this
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otp, // Return OTP for testing (remove in production with working SMS)
      devMode: !twilioClient || !twilioPhoneNumber
    });

  } catch (err) {
    console.error('Error sending OTP:', err.message);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP. Please try again."
    });
  }
});

// @route       POST api/v1/users/verify-otp
// @dsc         Verify OTP - for login (existing users) or registration (with name)
// @access      Public
router.post("/verify-otp", [
  check("phone", "Please include a valid phone number").custom((val) => String(val).length === 10),
  check("otp", "Please include OTP").isLength({ min: 6, max: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { phone, otp, name, address, location, fcmToken } = req.body;
  const phoneNum = typeof phone === "string" ? parseInt(phone, 10) : phone;

  console.log(`[OTP Verify] Phone: ${phoneNum}, OTP: ${otp}`);

  try {
    // Find user with valid OTP (User model stores phone as number)
    let user = await User.findOne({ 
      phone: phoneNum, 
      otp: String(otp),
      otpExpiry: { $gt: new Date() }
    });

    console.log(`[OTP Verify] User found in User model: ${!!user}`);

    if (!user) {
      const otpEntry = await OtpCache.findOne({ phone: phoneNum, otp: String(otp), otpExpiry: { $gt: new Date() } });
      console.log(`[OTP Verify] OTP found in cache: ${!!otpEntry}`);
      
      if (!otpEntry) {
        console.log(`[OTP Verify] Invalid or expired OTP for ${phoneNum}`);
        return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
      }
      
      if (!name || !String(name).trim() || !location?.coordinates?.length || !fcmToken) {
        console.log(`[OTP Verify] Missing registration data - name: ${!!name}, location: ${!!location?.coordinates}, fcmToken: ${!!fcmToken}`);
        return res.status(400).json({ success: false, error: "Name, location and fcmToken are required for registration" });
      }
      
      const coords = location.coordinates[0] !== 0 ? location.coordinates : [76.4180791, 29.8154373];
      user = new User({ phone: phoneNum, name: String(name).trim(), address: address || "", location: { type: "Point", coordinates: coords }, fcmToken });
      await user.save();
      await OtpCache.deleteOne({ phone: phoneNum });
      console.log(`[OTP Verify] New user created: ${user._id}`);
    } else {
      await User.updateOne({ phone: phoneNum }, { $unset: { otp: 1, otpExpiry: 1 } });
      if (location?.coordinates?.length && fcmToken) {
        const update = {};
        if (location.coordinates[0] !== 0) update.location = { type: "Point", coordinates: location.coordinates };
        if (fcmToken) update.fcmToken = fcmToken;
        if (Object.keys(update).length) await User.updateOne({ phone: phoneNum }, { $set: update });
      }
      console.log(`[OTP Verify] Existing user logged in: ${user._id}`);
    }

    const userData = {
      id: user._id,
      phone: user.phone,
      name: (name && String(name).trim()) || user.name || "",
      address: address || user.address || ""
    };

    jwt.sign({ user: userData }, process.env.JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ success: true, token, userId: String(user._id), user: userData });
    });

  } catch (err) {
    console.error('Error verifying OTP:', err.message);
    res.status(500).json({ success: false, error: "OTP verification failed" });
  }
});

// @route       POST api/v1/users/verify
// @dsc         register a user
// @access      Public
router.post(
  "/verify",
  [check("phone", "Please include a valid number").isLength(10)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { phone } = req.body;

    try {
      let user = await User.findOne({ phone });
      if (user) {
        res.status(409).json({
          success: false,
          error: `User with ${phone} already exists`,
        });
      } else {
        res.status(200).json({
          success: true,
          message: `Successfully sent Code to verify the Mobile Number ${phone}`,
          code: "123456",
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }
);

// @route       POST api/v1/users
// @dsc         register a user
// @access      Public
router.post(
  "/register",
  [
    check("name", "Please add a name").notEmpty(),
    check("phone", "Please include a valid number").isLength(10),
    check("location.coordinates", "Please include a valid location").isArray(),
    check("address", "Please include a valid address").notEmpty(),
    check("fcmToken", "Please add fcm token").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { name, phone, location, address, fcmToken } = req.body;
      let user = await User.findOne({ phone });
      if (user) {
        res.status(409).json({
          success: false,
          error: `User with ${phone} already exists`,
        });
      } else {
        user = new User({
          name,
          phone,
          location: {
            type: "Point",
            coordinates: location.coordinates
          },
          address,
          fcmToken,
        });
        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 360000000,
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              success: true,
              token: token,
              userId: user.id,
            });
          }
        );
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }
);

// @route       POST api/v1/users
// @dsc         login a user
// @access      Public
router.post(
  "/login",
  [
    check("phone", "Please include a valid number").isLength(10),
    check("location.coordinates", "Please include a valid location").isArray(),
    check("fcmToken", "Please add fcm token").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { phone, location, fcmToken } = req.body;
      let user = await User.findOne({ phone });
      if (!user) {
        res.status(404).json({
          success: false,
          error: `User with ${phone} doesn't exists`,
        });
      } else {
        user.location = {
          type: "Point",
          coordinates: location.coordinates
        };
        user.fcmToken = fcmToken;
        await user.save();

        const payload = {
          user: {
            id: user.id,
          },
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          {
            expiresIn: 360000000,
          },
          (err, token) => {
            if (err) throw err;
            res.status(200).json({
              success: true,
              token: token,
              userId: user.id,
            });
          }
        );
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }
);

// @route       GET api/v1/users/addCloseContacts
// @dsc         add close contacts of user
// @access      Private
router.post(
  "/addCloseContact",
  [check("closeContacts", "closeContacts is a type of map").exists()],
  auth,
  async (req, res) => {
    const { closeContacts } = req.body;
    try {
      let user = await User.findById(req.user.id);
      user.closeContacts = closeContacts;
      await user.save();
      res.status(200).json({
        success: true,
        user: user,
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }
);

// @route       GET api/v1/users/getCloseContacts
// @dsc         get close contacts of user()family etc)
// @access      Private
router.get("/getCloseContact", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);

    const contacts = user.closeContacts || {};

    // for (var i = 0; i < phoneNumbers.length; i++) {
    //   client.messages
    //     .create({
    //       body:
    //         "Message from Help-me! if you recieved it then ping on the group",
    //       from: "+12058461985",
    //       to: `+91${phoneNumbers[i]}`,
    //     })
    //     .then((message) => console.log(message.sid));
    // }

    res.status(200).json({
      success: true,
      contacts: contacts,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// @route       POST api/v1/users/emergency-alert
// @dsc         Send emergency SMS to all close contacts
// @access      Private
router.post("/emergency-alert", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { location } = req.body;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const contacts = user.closeContacts || {};
    const contactNumbers = Object.values(contacts);
    
    if (contactNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No emergency contacts found. Please add contacts first."
      });
    }

    const userName = user.name || user.phone;
    const locationText = location ? 
      `Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}` : 
      'Location not available';
    
    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨\n${userName} needs immediate help!\n${locationText}\nPlease contact them or call emergency services if needed.`;

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Send SMS to each contact
    for (const [contactName, phoneNumber] of Object.entries(contacts)) {
      try {
        if (twilioClient && twilioPhoneNumber) {
          const toNumber = phoneNumber.toString().startsWith('+') ? 
            phoneNumber : `+${twilioCountryCode.replace(/^\+/, '')}${phoneNumber}`;
          
          const message = await twilioClient.messages.create({
            body: emergencyMessage,
            from: twilioPhoneNumber,
            to: toNumber
          });
          
          console.log(`Emergency SMS sent to ${contactName} (${phoneNumber}): ${message.sid}`);
          results.push({ contact: contactName, phone: phoneNumber, status: 'sent', sid: message.sid });
          successCount++;
        } else {
          // Development mode - log the message
          console.log(`Dev mode - Emergency SMS to ${contactName} (${phoneNumber}): ${emergencyMessage}`);
          results.push({ contact: contactName, phone: phoneNumber, status: 'dev_mode', message: emergencyMessage });
          successCount++;
        }
      } catch (smsError) {
        console.error(`Failed to send emergency SMS to ${contactName} (${phoneNumber}):`, smsError.message);
        results.push({ contact: contactName, phone: phoneNumber, status: 'failed', error: smsError.message });
        failureCount++;
      }
    }

    // Log emergency alert in user's record (you could add this to a separate emergency log collection)
    console.log(`Emergency alert triggered by user ${user.phone} (${userName}) at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: `Emergency alert sent to ${successCount} contacts`,
      results: {
        total: contactNumbers.length,
        sent: successCount,
        failed: failureCount,
        details: results
      }
    });

  } catch (err) {
    console.error('Error sending emergency alert:', err.message);
    res.status(500).json({
      success: false,
      error: "Failed to send emergency alert. Please try again."
    });
  }
});

// @route       GET api/v1/users/me
// @dsc         get current logged in user
// @access      Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// @route       GET api/users/:id
// @dsc         get user with uid
// @access      Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

// @route       POST api/v1/users/direct-login
// @desc         Direct login for default user (no OTP required)
// @access      Public
router.post("/direct-login", async (req, res) => {
  const { username, password } = req.body;
  
  // Default credentials for testing
  const DEFAULT_USERNAME = "admin";
  const DEFAULT_PASSWORD = "admin123";
  
  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    try {
      // Find or create default user
      let user = await User.findOne({ phone: 9999999999 });
      
      if (!user) {
        user = new User({
          phone: 9999999999,
          name: 'Default Admin User',
          location: {
            type: 'Point',
            coordinates: [76.4180791, 29.8154373]
          },
          fcmToken: 'default_fcm_token',
          closeContacts: {
            'Emergency1': '+919876543210',
            'Emergency2': '+919876543211'
          },
          notifications: []
        });
        await user.save();
      }
      
      // Generate JWT token
      const payload = {
        user: {
          id: user._id,
          phone: user.phone
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        (err, token) => {
          if (err) throw err;
          res.json({
            success: true,
            token,
            user: {
              id: user._id,
              phone: user.phone,
              name: user.name
            }
          });
        }
      );
    } catch (err) {
      console.error('Direct login error:', err.message);
      res.status(500).json({
        success: false,
        error: "Internal Server Error"
      });
    }
  } else {
    res.status(401).json({
      success: false,
      error: "Invalid credentials"
    });
  }
});

module.exports = router;
