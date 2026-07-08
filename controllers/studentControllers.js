import mongoose from "mongoose";
import Student from "../models/Student.js";
import {
  applyStudentCalculations,
  buildStudentFilter,
  handleStudentError,
  validateStudentInput,
} from "../utils/studentHelpers.js";
import { getStructuredReport } from "../utils/mlPredictor.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
CREATE STUDENT
POST /api/students
*/
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
      data: student,
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
