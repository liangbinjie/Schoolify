import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["text", "image", "document", "video", "link", "file"], // Agregar "file" aquí
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    content: { type: String, required: true }, // Texto o URL del archivo/enlace
    fileType: { type: String, default: "" }, // Tipo de archivo (pdf, doc, jpg, etc.)
    order: { type: Number, default: 0 }, // Orden dentro del tab
}, { timestamps: true });

const tabSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, required: true }, // Orden del tab
    contents: [contentSchema], // Contenidos del tab
    parentTab: { type: mongoose.Schema.Types.ObjectId, ref: "Tab", default: null }, // Referencia al tab padre (para subtabs)
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Referencia al curso
}, { timestamps: true });

const Tab = mongoose.model("Tab", tabSchema);
export default Tab;