import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    code: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, default: undefined},
    image: {type: String, required: true},
    studentList: {type: Array, default: []},
    teacher: {type: String, required: true},
    state: {type: String, enum: ["active", "inactive", "in edition", "published"], default: "in edition", required: true},
});

const Course = mongoose.model("courses", courseSchema);
export default Course;