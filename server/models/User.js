import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,        // only for email login
  googleId: String         // only for Google login
});

export default mongoose.model("User", userSchema);