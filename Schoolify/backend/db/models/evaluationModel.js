import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctIndex: Number
});

const evaluationSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questions: [questionSchema],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

export default mongoose.model("Evaluation", evaluationSchema);
