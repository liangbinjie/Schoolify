import mongoose from "mongoose";

// Esquema para manejar diferentes tipos de contenido en los tabs
const contentSchema = new mongoose.Schema({
    type: {
        type: String, 
        enum: ["text", "image", "document", "video", "link"],
        required: true
    },
    title: {type: String, required: true},
    description: {type: String, default: ""},
    content: {type: String, required: true}, // Texto o URL del archivo/enlace
    fileType: {type: String, default: ""}, // Para identificar el tipo de archivo (pdf, doc, jpg, etc.)
    order: {type: Number, default: 0} // Para ordenar el contenido dentro del tab
}, { _id: true, timestamps: true });

// Esquema para los tabs del curso
const tabSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, default: ""},
    order: {type: Number, required: true}, // Para ordenar los tabs
    contents: [contentSchema]
}, { _id: true, timestamps: true });

const courseSchema = new mongoose.Schema({
    code: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    startDate: {type: Date, required: true}, // MM/DD/YYYY
    endDate: {type: Date, default: undefined}, // MM/DD/YYYY
    image: {type: String, required: true},
    studentList: {type: Array, default: []},
    teacher: {type: String, required: true},
    state: {type: String, enum: ["active", "inactive", "in edition", "published"], default: "in edition", required: true},
    tabs: [tabSchema] // Añadimos la propiedad tabs al esquema principal
});

const Course = mongoose.model("courses", courseSchema);
export default Course;