import mongoose from "mongoose";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Student from "../models/Student.js";
import {
  applyStudentCalculations,
  buildStudentFilter,
  handleStudentError,
  parsePagination,
  validateStudentInput,
} from "../utils/studentHelpers.js";
import {
  applyMlPredictions,
  getStructuredReport,
  overallFeatures,
  predictPerformanceBatch,
  subjectFeatures,
} from "../utils/mlPredictor.js";

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toPublicStudent = (student) => {
  const data = typeof student.toObject === "function" ? student.toObject() : { ...student };
  const rollNo = data.rollNo;
  return {
    ...data,
    studentId: rollNo,
    name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
  };
};

export const addStudent = async (req, res) => {
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

export const getStudents = async (req, res) => {
  try {
    const { filter, errors } = buildStudentFilter(req.query);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors.join(" "),
      });
    }

    const { page, limit, skip } = parsePagination(req.query);
    const [students, total] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page,
      limit,
      data: students,
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

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

    res.status(200).json({
      success: true,
      report: getStructuredReport(student),
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

export const getTopPerformers = async (req, res) => {
  try {
    const { limit } = parsePagination(
      { limit: req.query.limit || 5 },
      { defaultLimit: 5, maxLimit: 50 },
    );

    const [topStudents, totalStudents] = await Promise.all([
      Student.aggregate([
        {
          $addFields: {
            _rank: {
              $switch: {
                branches: [
                  { case: { $eq: ["$predictedPerformance", "Excellent"] }, then: 4 },
                  { case: { $eq: ["$predictedPerformance", "Good"] }, then: 3 },
                  { case: { $eq: ["$predictedPerformance", "Average"] }, then: 2 },
                  { case: { $eq: ["$predictedPerformance", "Poor"] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { _rank: -1, averageMarks: -1 } },
        { $limit: limit },
      ]),
      Student.countDocuments(),
    ]);

    const students = topStudents.map((student, index) => {
      const publicStudent = toPublicStudent(student);
      return {
        rank: index + 1,
        _id: publicStudent._id,
        studentId: publicStudent.rollNo,
        rollNo: publicStudent.rollNo,
        name: publicStudent.name,
        firstName: publicStudent.firstName,
        lastName: publicStudent.lastName,
        gender: publicStudent.gender,
        department: publicStudent.department,
        semester: publicStudent.semester,
        attendance: publicStudent.attendance,
        averageMarks: publicStudent.averageMarks,
        predictedPerformance: publicStudent.predictedPerformance,
        confidence: publicStudent.confidence,
        riskLevel: publicStudent.riskLevel,
      };
    });

    res.status(200).json({
      success: true,
      generatedAt: new Date(),
      totalStudents,
      count: students.length,
      students,
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

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
    handleStudentError(error, res);
  }
};

const buildPredictionRows = (students) => {
  const rows = [];
  const indexMap = [];

  students.forEach((student, studentIndex) => {
    const subjects = student.currentSubjects || [];
    subjects.forEach((subject, subjectIndex) => {
      indexMap.push({ studentIndex, subjectIndex });
      rows.push(subjectFeatures(student, subject));
    });
    indexMap.push({ studentIndex, subjectIndex: null });
    rows.push(overallFeatures(student));
  });

  return { rows, indexMap };
};

const applyBatchPredictions = (students, results, indexMap) => {
  const grouped = new Map();

  results.forEach((result, index) => {
    const mapping = indexMap[index];
    if (!mapping) {
      return;
    }
    if (!grouped.has(mapping.studentIndex)) {
      grouped.set(mapping.studentIndex, []);
    }
    grouped.get(mapping.studentIndex).push(result);
  });

  grouped.forEach((studentResults, studentIndex) => {
    applyMlPredictions(students[studentIndex], studentResults);
  });
};

export const updateFeatureImportance = async (req, res) => {
  try {
    const { attendance, gpa, internal, assignment, terminal, behaviour } = req.body;
    const weights = { attendance, gpa, internal, assignment, terminal, behaviour };
    const missingOrInvalid = [];

    for (const [key, val] of Object.entries(weights)) {
      if (val === undefined || typeof val !== "number" || !Number.isFinite(val) || val < 0) {
        missingOrInvalid.push(key);
      }
    }

    if (missingOrInvalid.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or invalid weights for: ${missingOrInvalid.join(", ")}. Values must be non-negative numbers.`,
      });
    }

    if (Object.values(weights).every((value) => value === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one feature weight must be greater than 0.",
      });
    }

    const filePath = path.join(__dirname, "../ml/importance.json");
    await fs.writeFile(filePath, JSON.stringify(weights, null, 4), "utf-8");

    try {
      await execPromise("npm run ml:setup", {
        cwd: projectRoot,
        timeout: 10 * 60 * 1000,
      });
    } catch (trainError) {
      console.error("Model retraining failed:", trainError);
      return res.status(500).json({
        success: false,
        message: "Failed to retrain model after updating percentages.",
      });
    }

    const students = await Student.find();
    if (students.length) {
      const { rows, indexMap } = buildPredictionRows(students);
      const results = await predictPerformanceBatch(rows);
      applyBatchPredictions(students, results, indexMap);

      await Student.bulkWrite(
        students.map((student) => {
          applyStudentCalculations(student);
          return {
            updateOne: {
              filter: { _id: student._id },
              update: {
                $set: {
                  currentSubjects: student.currentSubjects,
                  overallPerformance: student.overallPerformance,
                  predictedPerformance: student.predictedPerformance,
                  averageMarks: student.averageMarks,
                  confidence: student.confidence,
                  riskLevel: student.riskLevel,
                },
              },
            },
          };
        }),
      );
    }

    res.status(200).json({
      success: true,
      message:
        "Feature importances updated, model retrained, and all student predictions recalculated.",
      data: weights,
    });
  } catch (error) {
    handleStudentError(error, res);
  }
};

export const getModelAccuracy = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../ml/accuracy_report.json");
    const data = await fs.readFile(filePath, "utf-8");
    const report = JSON.parse(data);
    const accuracyPercent = Number(report.test_accuracy_percent);

    res.status(200).json({
      success: true,
      message: `Held-out test accuracy is ${accuracyPercent}% on a synthetic dataset.`,
      data: {
        modelAccuracyPercent: accuracyPercent,
        modelAccuracy: `${accuracyPercent}%`,
        datasetType: report.dataset_type || "synthetic",
        labeling: report.labeling,
        algorithm: report.algorithm,
        maxDepth: report.max_depth,
        totalSamples: report.total_samples,
        trainSamples: report.train_samples,
        validationSamples: report.validation_samples,
        testSamples: report.test_samples,
        validationAccuracyPercent: report.validation_accuracy_percent,
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
          "Model accuracy report not found. Run 'npm run ml:train' first to generate it.",
      });
    }

    handleStudentError(error, res);
  }
};
