import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  googleAccessToken: String,
  refreshToken: String

});

export default mongoose.model("User", userSchema);