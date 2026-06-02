import express from "express";
import {
  addStudent,
  deleteStudent,
  getDashboardData,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/studentControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", addStudent);
router.get("/", getStudents);
router.get("/", getDashboardData);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
