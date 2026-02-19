const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Disable automatic transaction support for MongoDB Atlas free tier
    mongoose.set('autoIndex', true);
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helpme', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'helpme',
      // Disable retryable writes which require replica sets
      retryWrites: false,
      w: 'majority'
    });

    console.log("MongoDB Connected successfully");
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
