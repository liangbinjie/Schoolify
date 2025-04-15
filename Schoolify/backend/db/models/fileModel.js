import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename: {type: String, required: true},
    originalName: {type: String, required: true},
    path: {type: String, required: true},
    fileType: {type: String, required: true},
    mimeType: {type: String, required: true},
    size: {type: Number, required: true},
    courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
    uploadedBy: {type: String, required: true},
}, { timestamps: true });

const File = mongoose.model("files", fileSchema);
export default File;