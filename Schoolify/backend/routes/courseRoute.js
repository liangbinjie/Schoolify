import express from "express";
import multer from "multer";
import Course from "../db/models/courseModel.js";

const courseRouter = express.Router();

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory as Buffer
const upload = multer({ storage });

// create COURSE post route with image upload
courseRouter.post("/", upload.single("image"), async (req, res) => {
    try {
        const { code, name, description, startDate, endDate, teacher } = req.body;
        const imageFile = req.file;

        if (!code || !name || !description || !startDate || !endDate || !teacher) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }

        // Validate image file type
        if (imageFile && imageFile.mimetype !== "image/jpeg" && imageFile.mimetype !== "image/png") {
            return res.status(400).json({ message: "Invalid file type. Only JPEG and PNG are allowed." });
        }

        // Save course
        const newCourse = new Course({
            code,
            name,
            description,
            startDate,
            endDate,
            image: imageFile ? {
                data: imageFile.buffer,
                contentType: imageFile.mimetype
            } : null,
            studentList: [],
            teacher,
            state: "in edition"
        });

        await newCourse.save();
        res.status(201).json({ message: "Course created successfully", course: newCourse });
    } catch (err) {
        console.error("Error creating course:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Clone course route
courseRouter.post("/clone/:id", async (req, res) => {
    const { id } = req.params;
    const { code, name, description, startDate, endDate, image, teacher } = req.body;

    if (!code || !name || !startDate || !endDate || !teacher) {
        return res.status(400).json({ message: "Please provide code, name, start date, end date, and teacher for the cloned course" });
    }

    try {
        // Find the original course to clone
        const originalCourse = await Course.findById(id);
        if (!originalCourse) {
            return res.status(404).json({ message: "Original course not found" });
        }

        // Check if the new code and name are different from the original
        if (code === originalCourse.code) {
            return res.status(400).json({ message: "The cloned course must have a different code from the original" });
        }

        if (name === originalCourse.name) {
            return res.status(400).json({ message: "The cloned course must have a different name from the original" });
        }

        // Convert dates to comparable format
        const originalStartDate = new Date(originalCourse.startDate).toISOString().split('T')[0];
        const originalEndDate = new Date(originalCourse.endDate).toISOString().split('T')[0];
        const newStartDate = new Date(startDate).toISOString().split('T')[0];
        const newEndDate = new Date(endDate).toISOString().split('T')[0];

        // Check if dates are different
        if (newStartDate === originalStartDate) {
            return res.status(400).json({ message: "The cloned course must have a different start date from the original" });
        }

        if (newEndDate === originalEndDate) {
            return res.status(400).json({ message: "The cloned course must have a different end date from the original" });
        }

        // Check if the teacher already has a course with this code or name
        const existingCourseByTeacher = await Course.findOne({ 
            teacher: teacher,
            $or: [
                { code: code },
                { name: name }
            ]
        });

        if (existingCourseByTeacher) {
            return res.status(400).json({ message: "You already have a course with this code or name" });
        }

        // Create the cloned course
        const clonedCourse = new Course({
            code, // Required to be different
            name, // Required to be different
            description: description !== undefined ? description : originalCourse.description, // Optional to change
            startDate, // Required to be different
            endDate, // Required to be different
            image: image !== undefined ? image : originalCourse.image, // Optional to change
            studentList: [], // Start with empty student list for the clone
            teacher,
            state: "in edition" // Set default state to "in edition"
        });

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


// Get student list of a course by id
courseRouter.get("/:id/students", async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.findById(id, "studentList"); // Only fetch the studentList field
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.status(200).json(course.studentList);
    } catch (err) {
        console.error("Error fetching student list:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get course image by ID
courseRouter.get("/:id/image", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course || !course.image || !course.image.data) {
            return res.status(404).json({ message: "Image not found" });
        }

        res.set("Content-Type", course.image.contentType);
        res.send(course.image.data);

    } catch (err) {
        console.error("Error retrieving course image:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Obtener todos los cursos
courseRouter.get("/", async (req, res) => {
    try {
        const courses = await Course.find(); // Obtiene todos los cursos de la base de datos
        res.status(200).json(courses);
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

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

export default courseRouter;

