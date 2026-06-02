import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
      default: "",
    },
    faculty: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    age: {
      type: Number,
      required: true,
      min: 15,
      max: 40,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    attendance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    subjects: [
      {
        subjectName: {
          type: String,
          required: true,
          trim: true,
        },
        assignmentMarks: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        terminalMarks: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        predictedPerformance: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Low",
        },
        remarks: {
          type: String,
          enum: ["Pass", "Fail"],
          default: "Fail",
          trim: true,
        },
      },
    ],
    facultyRemarks: {
      type: String,
      trim: true,
      default: "",
    },
    overallPerformance: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    predictedPerformance: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
