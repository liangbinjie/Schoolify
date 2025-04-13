import mongoose from 'mongoose';

const evaluationResultSchema = new mongoose.Schema({
  evaluation: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [Number],
  score: Number,
  submittedAt: { type: Date, default: Date.now }
});

evaluationResultSchema.index({ evaluation: 1, student: 1 }, { unique: true });

export default mongoose.model("EvaluationResult", evaluationResultSchema);

