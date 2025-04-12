import express from "express";
import bcrypt from "bcrypt";
import User from '../db/models/userModel.js'

const userRouter = express.Router();

// ======================================================== CRUD operations for user ===================================================
// get user by id
userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password -salt"); // Exclude password and salt
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get all users
userRouter.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password -salt"); // Exclude password and salt
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

// update user
userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, username, password, birthDate, profilePicture } = req.body;

  try {
    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
      email,
      username,
      password,
      birthDate,
      profilePicture
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error("User update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// delete user
userRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("User deletion error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default userRouter;
