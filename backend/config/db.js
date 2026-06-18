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
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
  }
};

/* MongoDB connection event listeners */
mongoose.connection.on("connected", () => {
  console.log("MongoDB Connected");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB Error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});

module.exports = connectDB;


