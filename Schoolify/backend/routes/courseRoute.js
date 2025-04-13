import express from "express";
import bcrypt from "bcrypt";
import Course from '../db/models/courseModel.js'

const courseRouter = express.Router();

// get course by id
courseRouter.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json(course);
    } catch (err) {
        console.error("Error fetching course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get all courses
courseRouter.get("/", async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// create COURSE post route
courseRouter.post("/", async (req, res) => {
    const { code, name, description, startDate, endDate, image, studentList, teacher } = req.body;

    if (!code || !name || !description || !startDate || !endDate || !image || !teacher) {
        return res.status(400).json({ message: "Please fill in all required fields" });
    }

    try {
        // Check for existing course
        const existing = await Course.findOne({ $or: [{ code }, { name }] });
        if (existing) {
            return res.status(400).json({ message: "Course code or name already exists" });
        }

        // Save course
        const newCourse = new Course({
            code,
            name,
            description,
            startDate,
            endDate,
            image,
            studentList: studentList || [], // Default to empty array if not provided
            teacher,
            state: "in edition" // Set default state to "in edition"
        });

        await newCourse.save();
        res.status(201).json({ message: "Course created successfully", course: newCourse });

    } catch (err) {
        console.error("Error creating course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Clone course route
courseRouter.post("/clone/:courseId", async (req, res) => {
    const { courseId } = req.params;
    const { newCode, newName, newStartDate, newEndDate } = req.body;
    
    if (!newCode || !newName || !newStartDate || !newEndDate) {
        return res.status(400).json({ message: "Please provide new code, name, and dates for the cloned course" });
    }

    try {
        // Find the original course
        const originalCourse = await Course.findById(courseId);
        if (!originalCourse) {
            return res.status(404).json({ message: "Original course not found" });
        }

        // Check if a course with the new code already exists
        const existingCourse = await Course.findById(newCode);
        if (existingCourse) {
            return res.status(400).json({ message: "A course with the new code already exists" });
        }

        // Clone the course with the required modifications
        const clonedCourse = new Course({
            _id: newCode,
            name: newName,
            description: originalCourse.description,
            startDate: newStartDate,
            endDate: newEndDate,
            image: originalCourse.image,
            studentList: [], // Optionally, you can copy students from original course if needed
            teacher: originalCourse.teacher,
            status: "in edition" // Set status to "en edicion"
        });

        // Save the cloned course
        await clonedCourse.save();

        res.status(201).json({ 
            message: "Course cloned successfully", 
            course: clonedCourse 
        });
    } catch (err) {
        console.error("Error cloning course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// update course by id
courseRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { code, name, description, startDate, endDate, image, studentList, teacher } = req.body;

    try {
        const course = await Course.findByIdAndUpdate(id, { code, name, description, startDate, endDate, image, studentList, teacher }, { new: true });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json(course);
    } catch (err) {
        console.error("Error updating course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// delete course by id
courseRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error("Error deleting course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default courseRouter;