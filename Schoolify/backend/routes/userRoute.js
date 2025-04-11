import express from "express";
import mongoClient from "../db/mongoClient.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
    let db = mongoClient.db("schoolify");
    let collection = await db.collection("users");
    let users = await collection.find({}).toArray();
    res.status(200).json(users);
});

userRouter.get("/:id", async (req, res) => {
    let db = mongoClient.db("schoolify");
    let collection = await db.collection("users");
    let user = await collection.findOne({ _id: ObjectId(req.params.id) });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
});

userRouter.post("/", async (req, res) => {
    let { firstName, lastName, email, username, password, birthDate, profilePicture} = req.body;
    if (!firstName || !lastName || !email || !username || !password || !birthDate) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        let hashedPassword = await bcrypt.hash(password, salt);
        let newUser = {
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            salt,
            birthDate,
            profilePicture
        };
        let db = mongoClient.db("schoolify");
        let collection = await db.collection("users");
        let result = await collection.insertOne(newUser);
        res.status(201).json({ message: "User created", userId: result.insertedId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default userRouter;