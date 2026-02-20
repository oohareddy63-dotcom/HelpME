const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('your_username')) {
      console.log('\n⚠️  MongoDB URI not configured!');
      console.log('   Please update MONGO_URI in .env file');
      console.log('   Get it from: https://cloud.mongodb.com/\n');
      console.log('   Server will continue without database...\n');
      return; // Don't exit, just return
    }

    // Disable automatic transaction support for MongoDB Atlas free tier
    mongoose.set('autoIndex', true);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'helpme',
      // Disable retryable writes which require replica sets
      retryWrites: false,
      w: 'majority',
      serverSelectionTimeoutMS: 5000 // Fail fast
    });

    console.log("✅ MongoDB Connected successfully");
  } catch (err) {
    console.error('\n⚠️  MongoDB connection error:', err.message);
    console.log('   Server will continue without database...');
    console.log('   Update MONGO_URI in .env to enable database\n');
    // Don't exit - let server run without DB for testing
  }
};

module.exports = connectDB;
