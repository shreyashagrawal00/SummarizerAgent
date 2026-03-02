import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();

if (!process.env.JWT_SECRET || !process.env.REFRESH_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET or REFRESH_SECRET is not defined in the environment.");
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});