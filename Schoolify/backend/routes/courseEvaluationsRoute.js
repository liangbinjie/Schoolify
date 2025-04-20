import express from "express";
import Evaluation from "../db/models/evaluationModel.js";
import EvaluationResult from "../db/models/evaluationResultModel.js";

const evaluationRouter = express.Router();

z

// Obtener evaluaciones de un curso
evaluationRouter.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    const evaluations = await Evaluation.find({ course: courseId });
    res.status(200).json(evaluations);
  } catch (err) {
    console.error("Error fetching evaluations:", err);
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

  try {
    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
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
      score
    });

    await result.save();
    res.status(201).json({ message: "Evaluation submitted successfully", score });
  } catch (err) {
    console.error("Error submitting evaluation:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default evaluationRouter;