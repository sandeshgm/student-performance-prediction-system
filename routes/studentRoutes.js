import express from "express";
import {
  addStudent,
  deleteStudent,
  getDashboardAnalytics,
  getStudentById,
  getStudents,
  updateStudent,
  getStudentReport,
} from "../controllers/studentControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", getDashboardAnalytics);
router.post("/", addStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.get("/report/:id", getStudentReport);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
