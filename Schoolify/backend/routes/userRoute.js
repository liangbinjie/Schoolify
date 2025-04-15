import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import User from '../db/models/userModel.js'

const userRouter = express.Router();

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory as Buffer
const upload = multer({ storage });

// ======================================================== CRUD operations for user ===================================================
// get user by id
userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password -salt -profilePicture"); // Exclude password and salt
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
userRouter.post("/", upload.single("profilePicture"), async (req, res) => {
  const { firstName, lastName, email, username, password, birthDate } = req.body;
  const profilePictureFile = req.file;

  if (!firstName || !lastName || !email || !username || !password || !birthDate) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "Email or username already exists" });
    }

    if (profilePictureFile.mimetype !== "image/jpeg" && profilePictureFile.mimetype !== "image/png") {
      return res.status(400).json({ message: "Invalid file type. Only JPEG and PNG are allowed." });
    }

    // Manually generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
      salt,
      birthDate,
      profilePicture: profilePictureFile ? {
        data: profilePictureFile.buffer,
        contentType: profilePictureFile.mimetype
      } : undefined
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

userRouter.get("/me", async (req, res) => {
  try {
    const userId = req.user.id; // Asegúrate de que el middleware de autenticación agregue el ID del usuario al objeto `req`
    const user = await User.findById(userId).select("-password -salt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get user pfp
userRouter.get("/:id/profile-picture", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({ message: "Profile picture not found" });
    }

    res.set("Content-Type", user.profilePicture.contentType);
    res.send(user.profilePicture.data);
    
  } catch (err) {
    console.error("Error retrieving profile picture:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default userRouter;
