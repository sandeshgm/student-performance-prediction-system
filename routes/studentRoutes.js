import express from "express";
import mongoose from "mongoose";
import {
  addStudent,
  deleteStudent,
  getDashboardAnalytics,
  getStudentById,
  getStudents,
  updateStudent,
  getStudentReport,
  getTopPerformers,
  getFeatureImportance,
  updateFeatureImportance,
  getModelAccuracy,
} from "../controllers/studentControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const requireStudentObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({
      success: false,
      message:
        "Route not found. Use GET /api/students/model-accuracy for model accuracy.",
    });
  }
  next();
};

router.use(protect);

router.get("/dashboard", getDashboardAnalytics);

// Report routes FIRST
router.get("/feature-importance", getFeatureImportance);
router.put("/feature-importance", updateFeatureImportance);
router.get("/model-accuracy", getModelAccuracy);
router.get("/report/top-performers", getTopPerformers);
router.get("/report/:id", requireStudentObjectId, getStudentReport);

// CRUD routes
router.post("/", addStudent);
router.get("/", getStudents);
router.get("/:id", requireStudentObjectId, getStudentById);
router.put("/:id", requireStudentObjectId, updateStudent);
router.delete("/:id", requireStudentObjectId, deleteStudent);

export default router;
