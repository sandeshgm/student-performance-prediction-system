import mongoose from "mongoose";

const PreviousSemesterSchema = new mongoose.Schema({
  semester: {
    type: Number,
    min: 1,
    max: 8,
  },

  gpa: Number,

  percentage: Number,

  performance: {
    type: String,
    enum: ["Excellent", "Good", "Average", "Poor"],
  },
});

export default PreviousSemesterSchema;