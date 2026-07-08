export const applyStudentCalculations = (student) => {
  let total = 0;

  student.currentSubjects.forEach((subject) => {
    subject.totalMarks =
      (subject.internalMarks || 0) +
      (subject.assignmentMarks || 0) +
      (subject.terminalExamMarks || 0);

    // Automatically calculate subject grade based on total marks
    let grade = "F";
    const totalMarks = subject.totalMarks;
    if (totalMarks >= 90) grade = "A";
    else if (totalMarks >= 80) grade = "B";
    else if (totalMarks >= 70) grade = "C";
    else if (totalMarks >= 60) grade = "D";
    else grade = "F";
    
    subject.grade = grade;

    total += subject.totalMarks;
  });

  student.averageMarks = total / student.currentSubjects.length;

  return student;
};