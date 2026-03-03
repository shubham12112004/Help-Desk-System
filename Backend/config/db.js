const mongoose = require("mongoose");

const connectDB = async () => {
  // Enhanced connection options for stability
  const connectionOptions = {
    serverSelectionTimeoutMS: 30000, // Increased from 5s to 30s
    socketTimeoutMS: 75000, // Increased from 45s to 75s
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
    heartbeatFrequencyMS: 10000,
  };

  // Handle connection events
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });

  // Try MongoDB Atlas first
  if (process.env.MONGO_URI) {
    try {
      console.log("🔄 Attempting MongoDB Atlas connection...");
      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      console.log("✅ MongoDB Connected Successfully (Atlas)");
      return;
    } catch (error) {
      console.error("❌ MongoDB Atlas connection failed");
      console.error("Error:", error.message);
      console.log("⚠️  Falling back to local MongoDB...");
    }
  }

  // Fallback to local MongoDB
  const localUri =
    process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/helpdeskDB";

  try {
    console.log("🔄 Attempting Local MongoDB connection...");
    await mongoose.connect(localUri, connectionOptions);
    console.log("✅ MongoDB Connected Successfully (Local)");
  } catch (error) {
    console.error("❌ MongoDB local connection failed");
    console.error("Error:", error.message);
    console.log("\n⚠️  MongoDB not available. Please:");
    console.log("   1. Install MongoDB: https://www.mongodb.com/try/download/community");
    console.log("   2. Start MongoDB service: net start MongoDB");
    console.log("   3. Or fix MongoDB Atlas connection (check IP whitelist)\n");
    process.exit(1);
  }
};

module.exports = connectDB;