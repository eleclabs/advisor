import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  image: String,   // Cloudinary URL

  role: {
    type: String,
    enum: ["ADMIN", "TEACHER", "EXECUTIVE", "COMMITTEE"],
    default: "TEACHER",
  },

  provider: {
    type: String,
    default: "credentials",
  },
}, { timestamps: true });

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);