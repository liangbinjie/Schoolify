import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import User from '../db/models/userModel.js'

const userRouter = express.Router();

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory as Buffer
const upload = multer({ storage });

// ======================================================== CRUD operations for user ===================================================
// get user by username
userRouter.get("/:username", async (req, res) => {
  console.log("GET USER CALL: ", req.params);
  const { username } = req.params;

  try {
    const user = await User.findOne({username: username}).select("-profilePicture -password -salt"); // Exclude password and salt
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
    const users = await User.find().select("-password -salt -profilePicture"); // Exclude password and salt
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
      } : null
    });
    console.log("New user data:", newUser);
    // Save the user to the database
    await newUser.save();
    res.status(201).json({ message: "User created", userId: newUser._id });

  } catch (err) {
    console.error("User creation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// update user
userRouter.put("/:id", upload.single("profilePicture"), async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, username, password, birthDate } = req.body;
  const profilePictureFile = req.file;

  try {
    const updateFields = {
      firstName,
      lastName,
      email,
      username,
      birthDate,
    };
    
    if (password && password !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
      updateFields.salt = salt;
    }

    if (profilePictureFile) {
      updateFields.profilePicture = {
        data: profilePictureFile.buffer,
        contentType: profilePictureFile.mimetype,
      };
    }
    console.log("Update fields:", updateFields);
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);

  } catch (err) {
    console.error("User update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// add course to user's createdCourses
userRouter.put("/:id/add-course", async (req, res) => {
    const { id } = req.params; // ID del usuario
    const { courseId } = req.body; // ID del curso

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Agregar el ID del curso a la lista createdCourses si no está presente
        if (!user.createdCourses.includes(courseId)) {
            user.createdCourses.push(courseId);
            await user.save();
        }

        res.status(200).json({ message: "Course added to createdCourses" });
    } catch (err) {
        console.error("Error updating createdCourses:", err);
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

// get user pfp by username
userRouter.get("/:username/profile-picture", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({username: username}).select("profilePicture");

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
