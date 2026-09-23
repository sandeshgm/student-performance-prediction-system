import assert from "node:assert/strict";
import test from "node:test";

import { csvToStudents, parseCsv } from "../frontend/src/csvStudents.js";

test("parseCsv handles quotes and commas", () => {
  const rows = parseCsv('a,b\n"x,y",z\n');
  assert.deepEqual(rows, [
    ["a", "b"],
    ["x,y", "z"],
  ]);
});

test("csvToStudents groups multiple subject rows by roll number", () => {
  const csv = `rollNo,firstName,department,semester,gpa,prevPercentage,subjectCode,subjectName,internal,assignment,terminal
CS1,Ada,BCA,3,3.2,78,MTH,Math,18,16,50
CS1,Ada,BCA,3,3.2,78,CSC,Java,12,14,40
`;
  const students = csvToStudents(csv);
  assert.equal(students.length, 1);
  assert.equal(students[0].firstName, "Ada");
  assert.equal(students[0].currentSubjects.length, 2);
  assert.equal(students[0].currentSubjects[1].subjectName, "Java");
  assert.equal(students[0].previousSemester.gpa, 3.2);
});

test("csvToStudents requires previous GPA after semester 1", () => {
  const csv = `rollNo,firstName,department,semester,subjectCode,subjectName,internal,assignment,terminal
CS1,Ada,BCA,3,MTH,Math,18,16,50
`;
  assert.throws(
    () => csvToStudents(csv),
    /previous semester GPA/,
  );
});

test("csvToStudents reads packed subjects column", () => {
  const csv = `roll_no,first_name,department,semester,gpa,prev_percentage,subjects
CS2,Alan,BCA,5,2.8,65,NET101:Networks:10:11:30|DB101:Database:14:15:41
`;
  const [student] = csvToStudents(csv);
  assert.equal(student.rollNo, "CS2");
  assert.equal(student.currentSubjects.length, 2);
  assert.equal(student.currentSubjects[0].subjectCode, "NET101");
});
