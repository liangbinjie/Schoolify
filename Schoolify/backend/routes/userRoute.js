import express from "express";
import bcrypt from "bcrypt";
import User from '../db/models/userModel.js'

const userRouter = express.Router();

// create USER post route
userRouter.post("/", async (req, res) => {
  const { firstName, lastName, email, username, password, birthDate, profilePicture } = req.body;

  if (!firstName || !lastName || !email || !username || !password || !birthDate) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    // Manually generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      salt, // Save salt separately
      birthDate,
      profilePicture
    });

    await newUser.save();
    res.status(201).json({ message: "User created", userId: newUser._id });

  } catch (err) {
    console.error("User creation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;