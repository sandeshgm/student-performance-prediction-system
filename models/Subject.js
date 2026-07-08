import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    trim: true,
  },

  subjectName: {
    type: String,
    required: true,
    trim: true,
  },

  internalMarks: {
    type: Number,
    min: 0,
    max: 20,
    default: 0,
  },
  assignmentMarks: {
    type: Number,
    min: 0,
    max: 20,
    default: 0,
  },
  terminalExamMarks: {
    type: Number,
    min: 0,
    max: 60,
    default: 0,
  },

  totalMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },

  grade: {
    type: String,
    default: "",
  },

  predictedPerformance: {
    type: String,
    enum: ["Excellent", "Good", "Average", "Poor"],
  },
});

export default SubjectSchema;
