import mongoose from "mongoose";

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["text", "image", "document", "video", "link", "file"],
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    content: { type: String, required: true },
    fileType: { type: String, default: "" },
    order: { type: Number, default: 0 },
}, { timestamps: true });

const tabSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    order: { type: Number, required: true }, 
    contents: [contentSchema], 
    parentTab: { type: mongoose.Schema.Types.ObjectId, ref: "Tab", default: null }, // Referencia al tab padre (para subtabs)
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }, // Referencia al curso
    subtabs: [
        {
            title: { type: String, required: true },
            description: { type: String, default: "" },
            order: { type: Number, required: true },
            contents: [contentSchema],
        },
    ],
}, { timestamps: true });

const Tab = mongoose.model("Tab", tabSchema);
export default Tab;