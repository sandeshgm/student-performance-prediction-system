import mongoose from "mongoose";

import SubjectSchema from "./Subject.js";
import BehaviourSchema from "./Behaviour.js";
import PreviousSemesterSchema from "./PreviousSemester.js";

import { applyStudentCalculations } from "../utils/studentHelpers.js";
import { predictStudentPerformance } from "../utils/mlPredictor.js";

const StudentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    department: {
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

    section: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    attendance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    previousSemester: PreviousSemesterSchema,

    currentSubjects: {
      type: [SubjectSchema],
      validate: {
        validator(subjects) {
          return subjects.length > 0;
        },
        message: "At least one subject is required.",
      },
    },

    behaviour: {
      type: BehaviourSchema,
      default: () => ({}),
    },

    overallPerformance: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"],
    },

    predictedPerformance: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"],
    },

    averageMarks: {
      type: Number,
      default: 0,
    },

    confidence: {
      type: Number,
      default: 1.0,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.pre("save", async function () {
  applyStudentCalculations(this);

  if (this.$locals?.skipMl) {
    return;
  }

  try {
    await predictStudentPerformance(this);
  } catch (err) {
    console.error("Machine Learning Prediction Error:", err.message);
  }
});

export default mongoose.model("Student", StudentSchema);
