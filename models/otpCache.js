const mongoose = require("mongoose");

const OtpCacheSchema = mongoose.Schema({
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpiry: {
    type: Date,
    required: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt fields
});

module.exports = mongoose.model("OtpCache", OtpCacheSchema);