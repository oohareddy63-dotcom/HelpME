const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  phone: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: true,
    },
  },
  address: {
    type: String,
    required: false,
  },
  fcmToken: {
    type: String,
    required: true,
  },
  closeContacts: {
    type: Map,
    required: false,
  },
  notifications: [
    {
      notification: {
        title: {
          type: String,
          required: true,
        },
        body: {
          type: String,
          required: true,
        },
      },
      data: {},
    },
  ],
});

// Add OTP fields to the schema
UserSchema.add({
  otp: {
    type: String,
    required: false,
  },
  otpExpiry: {
    type: Date,
    required: false,
  }
});

UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
