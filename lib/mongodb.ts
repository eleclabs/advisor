import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env");
}

export async function connectDB() {
  // ✅ ใช้ state ของ mongoose จริง ๆ
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    // กำลัง connecting อยู่ ไม่ต้อง connect ซ้ำ
    return;
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("MongoDB Connected");
}