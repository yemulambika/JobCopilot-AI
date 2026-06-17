const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error("MongoDB connection error: MONGODB_URI is not set. Please set it in your environment variables and redeploy.");
      process.exit(1);
    }
    const conn = await mongoose.connect(uri, {
      // Mongoose 7+ doesn't need these options, but kept for clarity
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;


