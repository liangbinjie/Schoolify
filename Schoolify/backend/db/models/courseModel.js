import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: undefined },
    image: {
        data: Buffer,
        contentType: String,
    },
    studentList: [{ type: String }],
    teacher: { type: String, required: true },
    state: { type: String, enum: ["active", "inactive", "in edition", "published"], default: "in edition", required: true },
    tabs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tab" }], // Referencia a los tabs
});

const Course = mongoose.model("Course", courseSchema);
export default Course;