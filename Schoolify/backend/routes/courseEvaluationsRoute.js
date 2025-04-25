import express from "express";
import Evaluation from "../db/models/evaluationModel.js";
import EvaluationResult from "../db/models/evaluationResultModel.js";
import mongoose from "mongoose";

const evaluationRouter = express.Router();

// Crear una nueva evaluación
evaluationRouter.post("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, questions, startDate, endDate, createdBy } = req.body;
    
    const newEvaluation = new Evaluation({
      course: courseId,
      title,
      description,
      questions: questions || [],
      startDate,
      endDate,
      createdBy
    });
    
    const savedEvaluation = await newEvaluation.save();
    res.status(201).json(savedEvaluation);
  } catch (err) {
    console.error("Error creating evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Obtener evaluaciones de un curso
evaluationRouter.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  console.log("Course ID:", courseId); // Verifica si courseId tiene un valor válido

  try {
      const evaluations = await Evaluation.find({ course: courseId });
      if (!evaluations || evaluations.length === 0) {
          return res.status(404).json({ message: "No evaluations found for this course" });
      }
      res.status(200).json(evaluations);
  } catch (err) {
      console.error("Error fetching evaluations:", err);
      res.status(500).json({ message: "Internal server error" });
  }
});

// Obtener una evaluación específica
evaluationRouter.get("/:courseId/evaluation/:evaluationId", async (req, res) => {
  const { courseId, evaluationId } = req.params;

  try {
    const evaluation = await Evaluation.findOne({ _id: evaluationId, course: courseId });
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    res.status(200).json(evaluation);
  } catch (err) {
    console.error("Error fetching evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Actualizar una evaluación
evaluationRouter.put("/:courseId/:evaluationId", async (req, res) => {
  try {
    const { courseId, evaluationId } = req.params;
    const updateData = req.body;
    
    // Verificar que la evaluación exista y pertenezca al curso
    const evaluation = await Evaluation.findOne({ 
      _id: evaluationId, 
      course: courseId 
    });
    
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    
    // Actualizar los campos proporcionados
    Object.keys(updateData).forEach(key => {
      evaluation[key] = updateData[key];
    });
    
    const updatedEvaluation = await evaluation.save();
    res.status(200).json(updatedEvaluation);
  } catch (err) {
    console.error("Error updating evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Eliminar una evaluación
evaluationRouter.delete("/:courseId/:evaluationId", async (req, res) => {
  try {
    const { courseId, evaluationId } = req.params;
    
    // Verificar que la evaluación exista y pertenezca al curso
    const evaluation = await Evaluation.findOne({ 
      _id: evaluationId, 
      course: courseId 
    });
    
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }
    
    await Evaluation.deleteOne({ _id: evaluationId });
    
    res.status(200).json({ message: "Evaluation deleted successfully" });
  } catch (err) {
    console.error("Error deleting evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Enviar respuestas y calcular calificación
evaluationRouter.post("/:evaluationId/submit", async (req, res) => {
  const { evaluationId } = req.params;
  const { studentId, answers } = req.body;

  if (!studentId || !answers) {
      return res.status(400).json({ message: "Please provide student ID and answers" });
  }

  // Validar que studentId sea un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format" });
  }

  try {
      const evaluation = await Evaluation.findById(evaluationId);
      if (!evaluation) {
          return res.status(404).json({ message: "Evaluation not found" });
      }

      if (!evaluation.questions || evaluation.questions.length === 0) {
          return res.status(400).json({ message: "Evaluation has no questions" });
      }

      // Validar formato de respuestas
      if (!Array.isArray(answers) || answers.length !== evaluation.questions.length) {
          return res.status(400).json({ message: "Invalid answers format" });
      }

      // Verificar si ya existe un resultado
      const existingResult = await EvaluationResult.findOne({ evaluation: evaluationId, student: studentId });
      if (existingResult) {
          return res.status(400).json({ message: "Evaluation already submitted" });
      }

      // Calcular la calificación
      const totalQuestions = evaluation.questions.length;
      let correctAnswers = 0;

      evaluation.questions.forEach((question, index) => {
          if (answers[index] === question.correctOption) {
              correctAnswers++;
          }
      });

      const score = (correctAnswers / totalQuestions) * 100;

      // Guardar el resultado
      const result = new EvaluationResult({
          evaluation: evaluationId,
          student: studentId,
          answers,
          score,
      });

      await result.save();
      res.status(201).json({ message: "Evaluation submitted successfully", score });
  } catch (err) {
      console.error("Error submitting evaluation:", err);
      res.status(500).json({ message: "Internal server error" });
  }
});

// Obtener resultados de evaluaciones por curso y estudiante
evaluationRouter.get("/:courseId/results/:studentId", async (req, res) => {
  const { courseId, studentId } = req.params;

  try {
    const results = await EvaluationResult.find({ student: studentId })
      .populate({
        path: "evaluation",
        match: { course: courseId }, // Filtrar evaluaciones por curso
        select: "title"
      });

    // Filtrar resultados que tengan evaluaciones válidas
    const filteredResults = results.filter(result => result.evaluation !== null);

    res.status(200).json(filteredResults);
  } catch (err) {
    console.error("Error fetching evaluation results:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Obtener promedios de resultados por curso
evaluationRouter.get("/:courseId/results", async (req, res) => {
  const { courseId } = req.params;

  try {
    // Obtener todas las evaluaciones del curso
    const evaluations = await Evaluation.find({ course: courseId }).select("_id");
    const evaluationIds = evaluations.map((evaluation) => evaluation._id);

    // Obtener los resultados de las evaluaciones
    const results = await EvaluationResult.find({ evaluation: { $in: evaluationIds } })
      .populate("student", "firstName lastName email username");

    // Agrupar resultados por estudiante
    const studentScores = {};
    results.forEach((result) => {
      const studentId = result.student._id.toString();
      if (!studentScores[studentId]) {
        studentScores[studentId] = {
          student: result.student,
          totalScore: 0,
          evaluationCount: 0,
        };
      }
      studentScores[studentId].totalScore += result.score;
      studentScores[studentId].evaluationCount += 1;
    });

    // Calcular el promedio por estudiante
    const studentAverages = Object.values(studentScores).map((entry) => ({
      student: entry.student,
      averageScore: entry.evaluationCount > 0 ? (entry.totalScore / entry.evaluationCount).toFixed(2) : "N/A",
    }));

    res.status(200).json({
      totalEvaluations: evaluations.length,
      studentAverages,
    });
  } catch (err) {
    console.error("Error fetching evaluation results:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

evaluationRouter.get("/:courseId/evaluation/:evaluationId", async (req, res) => {
  const { courseId, evaluationId } = req.params;

  try {
      const evaluation = await Evaluation.findOne({ _id: evaluationId, course: courseId });
      if (!evaluation) {
          return res.status(404).json({ message: "Evaluation not found" });
      }
      res.status(200).json(evaluation);
  } catch (err) {
      console.error("Error fetching evaluation:", err);
      res.status(500).json({ message: "Internal server error" });
  }
});
export default evaluationRouter;