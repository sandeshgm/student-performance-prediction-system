export const performanceFromAverage = (averageMarks) => {
  if (averageMarks >= 80) {
    return "Excellent";
  }
  if (averageMarks >= 65) {
    return "Good";
  }
  if (averageMarks >= 50) {
    return "Average";
  }
  return "Poor";
};

export const applyStudentCalculations = (student) => {
  const subjects = student.currentSubjects;

  if (!subjects || subjects.length === 0) {
    student.averageMarks = Number(student.averageMarks || 0);
    student.overallPerformance = performanceFromAverage(student.averageMarks);
    return student;
  }

  let total = 0;

  subjects.forEach((subject) => {
    const internal = Number(subject.internalMarks || 0);
    const assignment = Number(subject.assignmentMarks || 0);
    const terminal = Number(subject.terminalExamMarks || 0);

    subject.totalMarks = internal + assignment + terminal;

    let grade = "F";
    if (subject.totalMarks >= 90) {
      grade = "A";
    } else if (subject.totalMarks >= 80) {
      grade = "B";
    } else if (subject.totalMarks >= 70) {
      grade = "C";
    } else if (subject.totalMarks >= 60) {
      grade = "D";
    }

    subject.grade = grade;
    total += subject.totalMarks;
  });

  student.averageMarks = total / subjects.length;
  student.overallPerformance = performanceFromAverage(student.averageMarks);
  return student;
};
