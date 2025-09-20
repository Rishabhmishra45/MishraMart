import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not set in env");
    }

    // Direct connect without deprecated options
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ MongoDB Connected...");
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDb;
