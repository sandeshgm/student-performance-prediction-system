// export const applyStudentCalculations = (student) => {
//   let total = 0;

//   student.currentSubjects.forEach((subject) => {
//     subject.totalMarks =
//       Number(subject.internalMarks || 0) +
//       Number(subject.assignmentMarks || 0) +
//       Number(subject.terminalExamMarks || 0);

//     // Automatically calculate subject grade based on total marks
//     let grade = "F";
//     const totalMarks = subject.totalMarks;
//     if (totalMarks >= 90) grade = "A";
//     else if (totalMarks >= 80) grade = "B";
//     else if (totalMarks >= 70) grade = "C";
//     else if (totalMarks >= 60) grade = "D";
//     else grade = "F";

//     subject.grade = grade;

//     total += subject.totalMarks;
//   });

//   student.averageMarks = total / student.currentSubjects.length;

//   return student;
// };

export const applyStudentCalculations = (student) => {
  let total = 0;

  student.currentSubjects.forEach((subject) => {
    console.log("Before conversion:", subject);

    const internal = Number(subject.internalMarks || 0);
    const assignment = Number(subject.assignmentMarks || 0);
    const terminal = Number(subject.terminalExamMarks || 0);

    console.log({
      internal,
      assignment,
      terminal,
    });

    subject.totalMarks = internal + assignment + terminal;

    console.log("Calculated total:", subject.totalMarks);

    let grade = "F";
    if (subject.totalMarks >= 90) grade = "A";
    else if (subject.totalMarks >= 80) grade = "B";
    else if (subject.totalMarks >= 70) grade = "C";
    else if (subject.totalMarks >= 60) grade = "D";

    subject.grade = grade;

    total += subject.totalMarks;
  });

  student.averageMarks = total / student.currentSubjects.length;

  return student;
};
