import express from "express";
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
} from "../controllers/studentControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboardAnalytics);

// Report routes FIRST
router.get("/feature-importance", getFeatureImportance);
router.put("/feature-importance", updateFeatureImportance);
router.get("/report/top-performers", getTopPerformers);
router.get("/report/:id", getStudentReport);

// CRUD routes
router.post("/", addStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
