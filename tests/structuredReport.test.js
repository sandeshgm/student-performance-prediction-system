import assert from "node:assert/strict";
import test from "node:test";

import { getStructuredReport } from "../utils/mlPredictor.js";

const student = {
  firstName: "Ada",
  lastName: "Lovelace",
  rollNo: "CS-01",
  department: "CS",
  semester: 2,
  attendance: 70,
  averageMarks: 64,
  predictedPerformance: "Average",
  confidence: 0.8,
  riskLevel: "Medium",
  behaviour: {
    discipline: 3,
    communication: 3,
    teamwork: 3,
    participation: 3,
    homeworkCompletion: 3,
    punctuality: 3,
  },
  currentSubjects: [
    {
      subjectName: "Mathematics",
      totalMarks: 58,
      grade: "F",
      predictedPerformance: "Poor",
    },
  ],
};

test("report improvements are objects, not mixed strings", () => {
  const report = getStructuredReport(student);

  assert.ok(Array.isArray(report.improvements));
  assert.ok(report.improvements.length > 0);
  for (const item of report.improvements) {
    assert.equal(typeof item, "object");
    assert.equal(typeof item.area, "string");
    assert.ok(Array.isArray(item.suggestions));
  }
});

test("report maps identity fields", () => {
  const report = getStructuredReport(student);
  assert.equal(report.student.rollNo, "CS-01");
  assert.equal(report.student.name, "Ada Lovelace");
  assert.equal(report.finalDecision.status, "Pass");
});
