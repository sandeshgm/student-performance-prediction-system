import assert from "node:assert/strict";
import test from "node:test";

import { validateStudentInput } from "../utils/studentValidation.js";

const validBody = {
  rollNo: "CS-01",
  firstName: "Ada",
  department: "CS",
  semester: 3,
  currentSubjects: [{ subjectCode: "CS101", subjectName: "Programming" }],
};

test("create validation requires identity and subjects", () => {
  const errors = validateStudentInput({});
  assert.ok(errors.some((error) => error.includes("Roll number")));
  assert.ok(errors.some((error) => error.includes("subject")));
});

test("create validation accepts a complete payload", () => {
  assert.deepEqual(validateStudentInput(validBody), []);
});

test("partial validation ignores omitted fields", () => {
  assert.deepEqual(validateStudentInput({ attendance: 90 }, { partial: true }), []);
});

test("partial validation still rejects blank provided fields", () => {
  const errors = validateStudentInput({ firstName: "" }, { partial: true });
  assert.ok(errors.some((error) => error.includes("First name")));
});

test("partial validation rejects an empty subject list when provided", () => {
  const errors = validateStudentInput({ currentSubjects: [] }, { partial: true });
  assert.ok(errors.some((error) => error.includes("subject")));
});
