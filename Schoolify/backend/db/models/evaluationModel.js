import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Lista de opciones
  correctOption: { type: Number, required: true } // Índice de la opción correcta
});

const evaluationSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "courses", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  questions: [questionSchema], // Lista de preguntas
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // Docente que creó la evaluación
}, { timestamps: true });

export default mongoose.model("Evaluation", evaluationSchema);

