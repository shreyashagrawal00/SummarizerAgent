import mongoose from "mongoose";

const connectDB = async () => {
  // Support both MONGO_URI and MONGODB_URI naming conventions
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error("CRITICAL ERROR: Neither MONGO_URI nor MONGODB_URI is defined in environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;