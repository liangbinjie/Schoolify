//Temas y subtemas del curso

import mongoose from 'mongoose'; 

const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['text', 'document', 'video', 'image'], required: true },
  value: { type: String, required: true } // URL o texto plano
});

const sectionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  contents: [contentSchema]
});

export default mongoose.model("Section", sectionSchema);