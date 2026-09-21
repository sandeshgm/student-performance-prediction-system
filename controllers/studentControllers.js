import mongoose from "mongoose";
import Student from "../models/Student.js";
import {
  applyStudentCalculations,
  buildStudentFilter,
  handleStudentError,
  validateStudentInput,
} from "../utils/studentHelpers.js";
import { getStructuredReport } from "../utils/mlPredictor.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
CREATE STUDENT
POST /api/students
*/
export const addStudent = async (req, res) => {
  console.log("========== Incoming Data ==========");
  console.log(JSON.stringify(req.body, null, 2));
  try {
    const validationErrors = validateStudentInput(req.body);

    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(" "),
      });
    }

    const studentData = applyStudentCalculations({ ...req.body });
    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: "Student added successfully.",
      data: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

/*
GET ALL STUDENTS
GET /api/students
*/
export const getStudents = async (req, res) => {
  console.log("===== GET STUDENTS =====");
  console.log(req.headers.authorization);
  try {
    const { filter, errors } = buildStudentFilter(req.query);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
      });
    }

    const students = await Student.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack,
    });
  }
};

/*
GET STUDENT BY ID
GET /api/students/:id
*/
export const getStudentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

/*
UPDATE STUDENT
PUT /api/students/:id
*/
export const updateStudent = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const validationErrors = validateStudentInput(req.body, { partial: true });

    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(" "),
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    Object.assign(student, req.body);
    applyStudentCalculations(student);
    await student.save();

    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      data: student,
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

/*
DELETE STUDENT
DELETE /api/students/:id
*/
export const deleteStudent = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

/*
DASHBOARD ANALYTICS
GET /api/students/dashboard
*/
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { filter, errors } = buildStudentFilter(req.query);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
      });
    }

    const [totalStudents, excellent, good, average, poor, atRisk] =
      await Promise.all([
        Student.countDocuments(filter),
        Student.countDocuments({ ...filter, overallPerformance: "Excellent" }),
        Student.countDocuments({ ...filter, overallPerformance: "Good" }),
        Student.countDocuments({ ...filter, overallPerformance: "Average" }),
        Student.countDocuments({ ...filter, overallPerformance: "Poor" }),
        Student.countDocuments({ ...filter, riskLevel: "High" }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        excellent,
        good,
        average,
        poor,
        atRisk,
      },
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

/*
GET STRUCTURED PERFORMANCE REPORT FOR FRONTEND
GET /api/students/:id/report
*/
export const getStudentReport = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const reportData = getStructuredReport(student);

    res.status(200).json({
      success: true,
      report: reportData,
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

/*
GET Top 5 students performance report
 GET /api/reports/top-performerst
*/
export const getTopPerformers = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    // Fetch all students
    const students = await Student.find();

    // Prepare report data
    const report = students.map((student) => ({
      _id: student._id,
      studentId: student.studentId,
      rollNo: student.rollNo,
      name: `${student.firstName} ${student.lastName}`,
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      department: student.department,
      semester: student.semester,
      attendance: student.attendance,
      averageMarks: student.averageMarks,
      predictedPerformance: student.predictedPerformance,
      confidence: student.confidence,
      riskLevel: student.riskLevel,
    }));

    // Ranking order for predicted performance
    const performanceRank = {
      Excellent: 5,
      "Very Good": 4,
      Good: 3,
      Average: 2,
      Poor: 1,
    };

    // Sort by prediction first, then by average marks
    report.sort((a, b) => {
      const rankA = performanceRank[a.predictedPerformance] || 0;
      const rankB = performanceRank[b.predictedPerformance] || 0;

      if (rankA !== rankB) {
        return rankB - rankA;
      }

      return b.averageMarks - a.averageMarks;
    });

    // Get top N students
    const topStudents = report.slice(0, limit).map((student, index) => ({
      rank: index + 1,
      ...student,
    }));

    res.status(200).json({
      success: true,
      generatedAt: new Date(),
      totalStudents: report.length,
      count: topStudents.length,
      students: topStudents,
    });
  } catch (error) {
    console.error("Top Performers Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate top performers report.",
      error: error.message,
    });
  }
};

/*
GET FEATURE IMPORTANCES
GET /api/students/feature-importance
*/
export const getFeatureImportance = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../ml/importance.json");
    const data = await fs.readFile(filePath, "utf-8");
    const importances = JSON.parse(data);

    res.status(200).json({
      success: true,
      data: importances,
    });
  } catch (error) {
    console.error("Feature Importance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to read feature importances.",
      error: error.message,
    });
  }
};

/*
UPDATE FEATURE IMPORTANCES AND RETRAIN MODEL
PUT /api/students/feature-importance
*/
export const updateFeatureImportance = async (req, res) => {
  try {
    const { attendance, gpa, internal, assignment, terminal, behaviour } = req.body;

    // Validate that all weights are present and are numbers >= 0
    const weights = { attendance, gpa, internal, assignment, terminal, behaviour };
    const missingOrInvalid = [];

    for (const [key, val] of Object.entries(weights)) {
      if (val === undefined || typeof val !== "number" || val < 0) {
        missingOrInvalid.push(key);
      }
    }

    if (missingOrInvalid.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid weights for: ${missingOrInvalid.join(", ")}. Values must be non-negative numbers.`,
      });
    }

    // Save custom weights to importance.json
    const filePath = path.join(__dirname, "../ml/importance.json");
    await fs.writeFile(filePath, JSON.stringify(weights, null, 4), "utf-8");

    // Execute retraining pipeline
    const { exec } = await import("child_process");
    const util = await import("util");
    const execPromise = util.promisify(exec);

    try {
      console.log("Running retraining pipeline...");
      // Run ml:setup script (regenerate dataset and retrain model)
      await execPromise("npm run ml:setup");
      console.log("Retraining completed successfully.");
    } catch (trainError) {
      console.error("Model retraining failed:", trainError);
      return res.status(500).json({
        success: false,
        message: "Failed to retrain model after updating percentages.",
        error: trainError.message,
      });
    }

    // Recalculate predictions for all students in the database
    console.log("Recalculating predictions for all students...");
    const students = await Student.find();
    for (const student of students) {
      // Trigger pre-save hooks to predict and update
      await student.save();
    }
    console.log(`Successfully updated predictions for ${students.length} students.`);

    res.status(200).json({
      success: true,
      message: "Feature importances updated, model retrained, and all student predictions recalculated.",
      data: weights,
    });
  } catch (error) {
    console.error("Update Feature Importance Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feature importances.",
      error: error.message,
    });
  }
};

/*
GET MODEL ACCURACY REPORT
GET /api/students/model-accuracy
*/
export const getModelAccuracy = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../ml/accuracy_report.json");
    const data = await fs.readFile(filePath, "utf-8");
    const report = JSON.parse(data);

    const accuracyPercent = Number(report.test_accuracy_percent);

    res.status(200).json({
      success: true,
      message: `Model accuracy is ${accuracyPercent}%`,
      data: {
        modelAccuracyPercent: accuracyPercent,
        modelAccuracy: `${accuracyPercent}%`,
        algorithm: report.algorithm,
        maxDepth: report.max_depth,
        totalSamples: report.total_samples,
        trainSamples: report.train_samples,
        testSamples: report.test_samples,
        correctPredictions: report.correct_predictions,
        labels: report.labels,
       confusionMatrix: report.confusion_matrix,
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message:
          "Model accuracy report not found. Run 'python ml/train.py' first to generate it.",
      });
    }

    console.error("Model Accuracy Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to read model accuracy report.",
      error: error.message,
    });
  }
};

