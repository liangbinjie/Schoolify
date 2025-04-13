import express from "express";
import Enrollment from "../db/models/enrollmentModel.js";

const enrollmentRouter = express.Router();

// ======================= Obtener todas las matrículas =======================
enrollmentRouter.get("/", async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "username firstName lastName")
      .populate("course", "name code"); 
    res.status(200).json(enrollments);
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================= Obtener matrículas por estudiante =======================
enrollmentRouter.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const enrollments = await Enrollment.find({ student: userId })
      .populate("course", "name code description image startDate endDate");
    res.status(200).json(enrollments);
  } catch (err) {
    console.error("Error fetching user's enrollments:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================= Crear nueva matrícula =======================
enrollmentRouter.post("/", async (req, res) => {
  const { student, course } = req.body;

  if (!student || !course) {
    return res.status(400).json({ message: "Student and course are required" });
  }

  try {
    // Validar si ya está matriculado
    const existing = await Enrollment.findOne({ student, course });
    if (existing) {
      return res.status(400).json({ message: "User is already enrolled in this course" });
    }

    const newEnrollment = new Enrollment({ student, course });
    await newEnrollment.save();

    res.status(201).json({ message: "Enrollment created", enrollment: newEnrollment });

  } catch (err) {
    console.error("Error creating enrollment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ======================= Eliminar matrícula =======================
enrollmentRouter.delete("/", async (req, res) => {
  const { student, course } = req.body;

  try {
    const deleted = await Enrollment.findOneAndDelete({ student, course });
    if (!deleted) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json({ message: "Enrollment deleted" });
  } catch (err) {
    console.error("Error deleting enrollment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default enrollmentRouter;
