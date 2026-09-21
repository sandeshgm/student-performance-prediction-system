import dotenv from "dotenv";
import mongoose from "mongoose";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import connectDB from "../config/db.js";
import Student from "../models/Student.js";
import { applyStudentCalculations } from "../utils/studentHelpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const backfill = async () => {
  await connectDB();
  const students = await Student.find();

  if (!students.length) {
    console.log("No students to backfill.");
    await mongoose.disconnect();
    return;
  }

  await Student.bulkWrite(
    students.map((student) => {
      applyStudentCalculations(student);
      return {
        updateOne: {
          filter: { _id: student._id },
          update: {
            $set: {
              currentSubjects: student.currentSubjects,
              averageMarks: student.averageMarks,
              overallPerformance: student.overallPerformance,
            },
          },
        },
      };
    }),
  );

  console.log(`Updated overallPerformance for ${students.length} students.`);
  await mongoose.disconnect();
};

backfill().catch(async (error) => {
  console.error("Backfill failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
