import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true },  // Hashed password
  salt:      { type: String, required: true },  // Store salt separately
  birthDate: { type: String, required: true },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("QWE", userSchema);
export default User;
