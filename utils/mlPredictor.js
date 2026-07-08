import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Spawns the Python predict.py process with the given 6-feature array
 * Features: [attendance, gpa, internal, assignment, terminal, behaviour]
 * Returns { prediction, confidence }
 */
export const predictPerformanceRaw = (features) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../ml/predict.py");
    
    // Spawn python process
    const pythonProcess = spawn("python", [
      scriptPath,
      ...features.map(String),
    ]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python predict.py exited with code ${code}. Error: ${stderr.trim()}`));
      } else {
        const parts = stdout.trim().split(",");
        const prediction = parts[0] || "Average";
        const confidence = parseFloat(parts[1]) !== undefined && !isNaN(parseFloat(parts[1]))
          ? parseFloat(parts[1])
          : 1.0;
        resolve({ prediction, confidence });
      }
    });
  });
};

/**
 * Calculates a scaled behavior rating from the behaviour subdocument
 * Sum of 6 attributes (discipline, communication, teamwork, participation, homeworkCompletion, punctuality)
 * maps from range [6, 30] to [20, 100]
 */
const getScaledBehaviour = (behaviourData) => {
  if (!behaviourData) return 60; // Default fallback to medium behavior (e.g., all 3s -> sum 18 -> 60%)
  
  const discipline = behaviourData.discipline !== undefined ? behaviourData.discipline : 3;
  const communication = behaviourData.communication !== undefined ? behaviourData.communication : 3;
  const teamwork = behaviourData.teamwork !== undefined ? behaviourData.teamwork : 3;
  const participation = behaviourData.participation !== undefined ? behaviourData.participation : 3;
  const homeworkCompletion = behaviourData.homeworkCompletion !== undefined ? behaviourData.homeworkCompletion : 3;
  const punctuality = behaviourData.punctuality !== undefined ? behaviourData.punctuality : 3;

  const sum = discipline + communication + teamwork + participation + homeworkCompletion + punctuality;
  return (sum / 30) * 100;
};

/**
 * Translates behaviour percentage score into a text label
 */
const getBehaviourText = (behaviourData) => {
  const pct = getScaledBehaviour(behaviourData);
  if (pct >= 90) return "Excellent";
  if (pct >= 75) return "Good";
  if (pct >= 50) return "Average";
  return "Poor";
};

/**
 * Gets letter grade from percentage
 */
const getGradeFromPercentage = (pct) => {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
};

/**
 * Predicts performance for an individual subject
 */
export const predictSubjectPerformance = async (student, subject) => {
  const attendance = student.attendance !== undefined ? student.attendance : 0;
  const gpa = (student.previousSemester && student.previousSemester.gpa !== undefined) 
    ? student.previousSemester.gpa 
    : 0;
  
  // Scale marks out of 100 as expected by the ML model (max internal=20, assignment=20, terminal=60)
  const internal = (subject.internalMarks || 0) * (100 / 20);
  const assignment = (subject.assignmentMarks || 0) * (100 / 20);
  const terminal = (subject.terminalExamMarks || 0) * (100 / 60);
  
  const behaviour = getScaledBehaviour(student.behaviour);

  const features = [attendance, gpa, internal, assignment, terminal, behaviour];
  
  const { prediction } = await predictPerformanceRaw(features);
  return prediction;
};

/**
 * Predicts overall performance by averaging marks across all subjects
 */
export const predictOverallPerformance = async (student) => {
  const attendance = student.attendance !== undefined ? student.attendance : 0;
  const gpa = (student.previousSemester && student.previousSemester.gpa !== undefined) 
    ? student.previousSemester.gpa 
    : 0;
  
  let totalInternal = 0;
  let totalAssignment = 0;
  let totalTerminal = 0;
  const count = student.currentSubjects && student.currentSubjects.length > 0 
    ? student.currentSubjects.length 
    : 1;

  if (student.currentSubjects && student.currentSubjects.length > 0) {
    student.currentSubjects.forEach((sub) => {
      totalInternal += sub.internalMarks || 0;
      totalAssignment += sub.assignmentMarks || 0;
      totalTerminal += sub.terminalExamMarks || 0;
    });
  }

  // Calculate averages and scale to 100 as expected by the ML model
  const internal = (totalInternal / count) * (100 / 20);
  const assignment = (totalAssignment / count) * (100 / 20);
  const terminal = (totalTerminal / count) * (100 / 60);

  const behaviour = getScaledBehaviour(student.behaviour);

  const features = [attendance, gpa, internal, assignment, terminal, behaviour];
  
  return await predictPerformanceRaw(features);
};

/**
 * Generates a structured JSON performance report for a student
 * Exposes strengths, areas needing improvement, grades, overall percentage, and pass/fail prediction.
 */
export const getStructuredReport = (student) => {
  const name = `${student.firstName} ${student.lastName || ""}`.trim();
  const rollNo = student.rollNo || "N/A";
  const department = student.department || "N/A";
  const semester = student.semester || "N/A";
  const attendance = student.attendance !== undefined ? student.attendance : 0;
  const behaviorText = getBehaviourText(student.behaviour);
  
  const overallPercentage = student.averageMarks !== undefined ? student.averageMarks : 0;
  const overallGrade = getGradeFromPercentage(overallPercentage);
  const predictedResult = student.predictedPerformance || "Average";
  const riskLevel = student.riskLevel || "Medium";
  const confidencePercent = student.confidence !== undefined ? Math.round(student.confidence * 100) : 80;

  // Determine areas needing improvement
  const improvements = [];
  if (student.currentSubjects && student.currentSubjects.length > 0) {
    student.currentSubjects.forEach((sub) => {
      if (sub.predictedPerformance === "Poor" || sub.predictedPerformance === "Average") {
        improvements.push(`Improve ${sub.subjectName} practical skills.`);
      }
    });
  }
  if (attendance < 85) {
    improvements.push(`Focus on improving classroom attendance.`);
  } else if (attendance < 95) {
    improvements.push(`Continue maintaining excellent attendance.`);
  }
  if (getScaledBehaviour(student.behaviour) < 75) {
    improvements.push(`Improve classroom behavior and participation.`);
  }
  if (improvements.length === 0) {
    improvements.push("Keep up the excellent study routine.");
    improvements.push("Maintain current performance standards.");
  } else if (improvements.length < 3) {
    improvements.push("Practice more programming exercises.");
  }

  // Determine strengths
  const strengths = [];
  if (student.currentSubjects && student.currentSubjects.length > 0) {
    student.currentSubjects.forEach((sub) => {
      if (sub.predictedPerformance === "Excellent" || sub.predictedPerformance === "Good") {
        strengths.push(`Excellent ${sub.subjectName.replace("Advanced ", "")} performance.`);
      }
    });
  }
  if (attendance >= 90) {
    strengths.push("Consistent attendance.");
  }
  if (getScaledBehaviour(student.behaviour) >= 75) {
    strengths.push("Good classroom behavior.");
  }
  if (strengths.length === 0) {
    strengths.push("Active participation in class.");
  }

  const passOrFail = (predictedResult === "Poor") ? "FAIL" : "PASS";
  const finalDecisionText = `Student is expected to ${passOrFail} the upcoming examination if their academic performance remains at the current ${predictedResult.toUpperCase()} level.`;

  return {
    student: {
      name,
      rollNo,
      department,
      semester,
    },
    currentPerformance: {
      attendance,
      behavior: behaviorText,
      overallPercentage: parseFloat(overallPercentage.toFixed(1)),
      overallGrade,
      predictedResult,
      riskLevel,
    },
    subjects: (student.currentSubjects || []).map((sub) => ({
      subjectName: sub.subjectName,
      percentage: sub.totalMarks,
      grade: sub.grade || getGradeFromPercentage(sub.totalMarks),
      prediction: sub.predictedPerformance || "Average",
    })),
    futurePrediction: {
      expectedPerformance: predictedResult,
      confidence: confidencePercent,
    },
    improvements,
    strengths: strengths.slice(0, 3),
    finalDecision: {
      status: predictedResult === "Poor" ? "Fail" : "Pass",
      message: finalDecisionText,
    },
  };
};

/**
 * Prints a beautiful ASCII Student Performance Report to the console
 */
export const printPerformanceReport = (student) => {
  const report = getStructuredReport(student);

  console.log("STUDENT PERFORMANCE REPORT");
  console.log("");
  console.log(`Student Name      : ${report.student.name}`);
  console.log(`Roll No           : ${report.student.rollNo}`);
  console.log(`Department        : ${report.student.department}`);
  console.log(`Semester          : ${report.student.semester}`);
  console.log("");
  console.log("CURRENT PERFORMANCE");
  console.log(`Attendance         : ${report.currentPerformance.attendance}%`);
  console.log(`Behavior           : ${report.currentPerformance.behavior}`);
  console.log(`Overall Percentage : ${report.currentPerformance.overallPercentage.toFixed(2)}%`);
  console.log(`Overall Grade      : ${report.currentPerformance.overallGrade}`);
  console.log(`Predicted Result   : ${report.currentPerformance.predictedResult}`);
  console.log(`Risk Level         : ${report.currentPerformance.riskLevel}`);
  console.log("");
  console.log("SUBJECT-WISE PERFORMANCE");

  if (report.subjects && report.subjects.length > 0) {
    report.subjects.forEach((sub) => {
      console.log("");
      console.log(`Subject: ${sub.subjectName}`);
      console.log(`Percentage          : ${sub.percentage.toFixed(2)}%`);
      console.log(`Grade               : ${sub.grade}`);
      console.log(`Prediction          : ${sub.prediction}`);
    });
  } else {
    console.log("No current subjects registered.");
  }

  console.log("");
  console.log("FUTURE PERFORMANCE PREDICTION");
  console.log(`Expected Performance : ${report.futurePrediction.expectedPerformance}`);
  console.log(`Confidence           : ${report.futurePrediction.confidence}%`);
  console.log("");
  console.log("");
  console.log("AREAS NEEDING IMPROVEMENT");
  report.improvements.forEach((imp) => {
    console.log(imp);
  });
  console.log("");
  console.log("");
  console.log("STRENGTHS");
  report.strengths.forEach((str) => {
    console.log(str);
  });
  console.log("");
  console.log("");
  console.log("FINAL DECISION");
  console.log("");
  console.log(report.finalDecision.message);
  console.log("");
};
