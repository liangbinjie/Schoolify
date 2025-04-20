import express from "express";
import Course from "../db/models/courseModel.js";
import User from "../db/models/userModel.js";

const courseEnrollmentRouter = express.Router();

// Enroll in a course
courseEnrollmentRouter.post("/enroll", async (req, res) => {
    try {
        const {courseID} = req.body;
        const {userID} = req.body;

        // Find the course by ID and the user by ID
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if the user is already enrolled in the course
        if (course.studentList.includes(user.username)) {
            return res.status(400).json({ message: "User is already enrolled in this course" });
        }

        // Add the user to the course's student list
        user.enrolledCourses.push(courseID);
        course.studentList.push(user.username);
        await user.save();
        await course.save();

        res.status(200).json({ message: "User enrolled successfully", user, course });
    } catch (err) {
        console.error("Error enrolling in course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Unenroll from a course
courseEnrollmentRouter.post("/unenroll/", async (req, res) => {
    try {
        const { courseID } = req.body;
        const { userID } = req.body;

        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Check if the user is enrolled in the course
        if (course.studentList.includes(user.username)) {
            // Remove the user from the course's student list
            course.studentList = course.studentList.filter(student => student !== user.username);
            user.enrolledCourses = user.enrolledCourses.filter(course => course !== courseID);
            await user.save();
            await course.save();
            res.status(200).json({ message: "User unenrolled successfully" });
        }
        // If the user is not enrolled, return a message
        else {
            return res.status(400).json({ message: "User is not enrolled in this course" });
        }

    } catch (err) {
        console.error("Error unenrolling from course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get all users from a course
courseEnrollmentRouter.get("/students/:courseID", async (req, res) => {
    try {
        const { courseID } = req.params;

        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Get all users enrolled in the course
        const students = course.studentList;

        res.status(200).json(students);
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get all courses from a user
courseEnrollmentRouter.get("/courses/:userID", async (req, res) => {
    try {
        const { userID } = req.params;

        const user = await User.findById(userID)
            .populate("enrolledCourses", "_id name code");;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Get all courses the user is enrolled in

        res.status(200).json(user.enrolledCourses);
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default courseEnrollmentRouter;