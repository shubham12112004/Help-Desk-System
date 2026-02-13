const mongoose = require("mongoose");

const connectDB = async () => {
  const connectionOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

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
    process.exit(1);
  }
};

module.exports = connectDB;