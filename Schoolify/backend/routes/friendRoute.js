import express from "express";
import User from "../db/models/userModel.js";

const friendRouter = express.Router();

// Send friend request 
friendRouter.post("/send-friend-request/:friendUsername", async (req, res) => {
    const { friendUsername } = req.params;
    const { username } = req.body; // body contains the username of the user sending the request
    console.log("Add Friend Request: ", { friendUsername, username });

    if (username === friendUsername) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself"});
    }

    const myUser = await User.findOne({ username });
    const friendUser = await User.findOne({ username: friendUsername });

    if (!friendUser || !myUser) {
        return res.status(400).json({ message: "User not found" });
    }

    if (friendUser.receivedRequests.includes(username)) {
        return res.status(400).json({ message: "Friend request already sent" });
    }

    if (myUser.friends.includes(friendUsername)) {
        return res.status(400).json({ message: "You are already friends" });
    }
    if (myUser.sentRequests.includes(friendUsername)) {
        return res.status(400).json({ message: "Friend request already sent" });
    }

    myUser.sentRequests.push(friendUsername);
    friendUser.receivedRequests.push(username);
    await myUser.save();
    await friendUser.save();
    res.status(200).json({ message: "Friend request sent", user: myUser });
});

// Decline a friend request
friendRouter.post("/decline-friend-request/:friendUsername", async (req, res) => {
    const { friendUsername } = req.params;
    const { username } = req.body; // body contains the username of the user sending the request
    console.log("Decline Friend Request: ", { friendUsername, username });

    const myUser = await User.findOne({ username });
    const friendUser = await User.findOne({ username: friendUsername });

    if (!friendUser || !myUser) {
        return res.status(400).json({ message: "User not found" });
    }

    if (!myUser.receivedRequests.includes(friendUsername)) {
        return res.status(400).json({ message: "No friend request from this user" });
    }

    myUser.receivedRequests = myUser.receivedRequests.filter(user => user !== friendUsername);
    friendUser.sentRequests = friendUser.sentRequests.filter(user => user !== username);
    await myUser.save();
    await friendUser.save();
    res.status(200).json({ message: "Friend request declined", user: myUser });
});

// Accept a friend request
friendRouter.post("/accept-friend-request/:friendUsername", async (req, res) => {
    const { friendUsername } = req.params;
    const { username } = req.body; // body contains the username of the user sending the request
    console.log("Accept Friend Request: ", { friendUsername, username });

    const myUser = await User.findOne({ username });
    const friendUser = await User.findOne({ username: friendUsername });

    if (!friendUser || !myUser) {
        return res.status(400).json({ message: "User not found" });
    }

    if (!myUser.receivedRequests.includes(friendUsername)) {
        return res.status(400).json({ message: "No friend request from this user" });
    }

    myUser.friends.push(friendUsername);
    myUser.receivedRequests = myUser.receivedRequests.filter(user => user !== friendUsername);
    friendUser.friends.push(username);
    friendUser.sentRequests = friendUser.sentRequests.filter(user => user !== username);
    await myUser.save();
    await friendUser.save();
    res.status(200).json({ message: "Friend request accepted", user: myUser });
});

// Unfriend a user
friendRouter.post("/unfriend/:friendUsername", async (req, res) => {
    const { friendUsername } = req.params;
    const { username } = req.body; // body contains the username of the user sending the request
    
    const myUser = await User.findOne({ username });
    const friendUser = await User.findOne({ username: friendUsername });
    
    if (!friendUser || !myUser) {
        return res.status(400).json({ message: "User not found" });
    }
    
    if (!myUser.friends.includes(friendUsername)) {
        return res.status(400).json({ message: "You are not friends with this user" });
    }
    
    console.log("Unfriend: ", { friendUsername, username });
    myUser.friends = myUser.friends.filter(user => user !== friendUsername);
    friendUser.friends = friendUser.friends.filter(user => user !== username);
    await myUser.save();
    await friendUser.save();
    res.status(200).json({ message: "Unfriended successfully", user: myUser });
});


export default friendRouter;