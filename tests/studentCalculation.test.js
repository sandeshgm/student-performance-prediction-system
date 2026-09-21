import assert from "node:assert/strict";
import test from "node:test";

import {
  applyStudentCalculations,
  performanceFromAverage,
} from "../utils/studentCalculation.js";

test("performance bands match dashboard labels", () => {
  assert.equal(performanceFromAverage(92), "Excellent");
  assert.equal(performanceFromAverage(70), "Good");
  assert.equal(performanceFromAverage(55), "Average");
  assert.equal(performanceFromAverage(40), "Poor");
});

test("applyStudentCalculations totals marks, grades, and overallPerformance", () => {
  const student = applyStudentCalculations({
    currentSubjects: [
      { internalMarks: 18, assignmentMarks: 16, terminalExamMarks: 50 },
      { internalMarks: 12, assignmentMarks: 10, terminalExamMarks: 30 },
    ],
  });

  assert.equal(student.currentSubjects[0].totalMarks, 84);
  assert.equal(student.currentSubjects[0].grade, "B");
  assert.equal(student.currentSubjects[1].totalMarks, 52);
  assert.equal(student.currentSubjects[1].grade, "F");
  assert.equal(student.averageMarks, 68);
  assert.equal(student.overallPerformance, "Good");
});

test("applyStudentCalculations handles missing subjects", () => {
  const student = applyStudentCalculations({ averageMarks: 49 });
  assert.equal(student.overallPerformance, "Poor");
});
