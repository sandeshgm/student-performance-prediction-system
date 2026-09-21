import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import { getPythonBin } from "./pythonBin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_GPA = 2.5;

const parsePredictions = (stdout) => {
  const parsed = JSON.parse(stdout.trim());

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("predict.py returned no predictions.");
  }

  return parsed.map((row) => {
    const prediction = Array.isArray(row) ? row[0] : row?.prediction;
    const confidenceValue = Array.isArray(row) ? row[1] : row?.confidence;
    const confidence = Number(confidenceValue);

    return {
      prediction: prediction || "Average",
      confidence: Number.isFinite(confidence) ? confidence : 1,
    };
  });
};

export const predictPerformanceBatch = (featureRows) => {
  if (!featureRows.length) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../ml/predict.py");
    const pythonProcess = spawn(getPythonBin(), [scriptPath]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(error);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Python predict.py exited with code ${code}. ${stderr.trim()}`.trim(),
          ),
        );
        return;
      }

      try {
        resolve(parsePredictions(stdout));
      } catch (error) {
        reject(
          new Error(`Failed to parse predict.py output: ${error.message}`),
        );
      }
    });

    pythonProcess.stdin.write(JSON.stringify(featureRows));
    pythonProcess.stdin.end();
  });
};

export const predictPerformanceRaw = async (features) => {
  const [result] = await predictPerformanceBatch([features]);
  return result;
};

export const getScaledBehaviour = (behaviourData) => {
  if (!behaviourData) {
    return 60;
  }

  const keys = [
    "discipline",
    "communication",
    "teamwork",
    "participation",
    "homeworkCompletion",
    "punctuality",
  ];

  const sum = keys.reduce((total, key) => {
    const value = behaviourData[key];
    return total + (value !== undefined ? Number(value) : 3);
  }, 0);

  return (sum / 30) * 100;
};

const getGpa = (student) => {
  const gpa = student.previousSemester?.gpa;
  if (gpa === undefined || gpa === null || Number.isNaN(Number(gpa))) {
    return DEFAULT_GPA;
  }
  return Number(gpa);
};

export const subjectFeatures = (student, subject) => [
  student.attendance !== undefined ? Number(student.attendance) : 0,
  getGpa(student),
  (subject.internalMarks || 0) * (100 / 20),
  (subject.assignmentMarks || 0) * (100 / 20),
  (subject.terminalExamMarks || 0) * (100 / 60),
  getScaledBehaviour(student.behaviour),
];

export const overallFeatures = (student) => {
  const subjects = student.currentSubjects || [];
  const count = subjects.length || 1;
  let totalInternal = 0;
  let totalAssignment = 0;
  let totalTerminal = 0;

  for (const subject of subjects) {
    totalInternal += subject.internalMarks || 0;
    totalAssignment += subject.assignmentMarks || 0;
    totalTerminal += subject.terminalExamMarks || 0;
  }

  return [
    student.attendance !== undefined ? Number(student.attendance) : 0,
    getGpa(student),
    (totalInternal / count) * (100 / 20),
    (totalAssignment / count) * (100 / 20),
    (totalTerminal / count) * (100 / 60),
    getScaledBehaviour(student.behaviour),
  ];
};

export const riskFromPrediction = (prediction) => {
  if (prediction === "Poor") {
    return "High";
  }
  if (prediction === "Average") {
    return "Medium";
  }
  return "Low";
};

export const applyMlPredictions = async (student, results) => {
  const subjects = student.currentSubjects || [];

  subjects.forEach((subject, index) => {
    if (results[index]) {
      subject.predictedPerformance = results[index].prediction;
    }
  });

  const overall = results[results.length - 1] || {
    prediction: "Average",
    confidence: 1,
  };

  student.predictedPerformance = overall.prediction;
  student.confidence = overall.confidence;
  student.riskLevel = riskFromPrediction(overall.prediction);
  return student;
};

export const predictStudentPerformance = async (student) => {
  const subjects = student.currentSubjects || [];
  const rows = subjects.map((subject) => subjectFeatures(student, subject));
  rows.push(overallFeatures(student));
  const results = await predictPerformanceBatch(rows);
  return applyMlPredictions(student, results);
};

export const predictSubjectPerformance = async (student, subject) => {
  const { prediction } = await predictPerformanceRaw(
    subjectFeatures(student, subject),
  );
  return prediction;
};

export const predictOverallPerformance = async (student) =>
  predictPerformanceRaw(overallFeatures(student));

const getBehaviourText = (behaviourData) => {
  const pct = getScaledBehaviour(behaviourData);
  if (pct >= 90) {
    return "Excellent";
  }
  if (pct >= 75) {
    return "Good";
  }
  if (pct >= 50) {
    return "Average";
  }
  return "Poor";
};

const getGradeFromPercentage = (pct) => {
  if (pct >= 90) {
    return "A";
  }
  if (pct >= 80) {
    return "B";
  }
  if (pct >= 70) {
    return "C";
  }
  if (pct >= 60) {
    return "D";
  }
  return "F";
};

const getSubjectImprovement = (prediction) => {
  switch (prediction) {
    case "Poor":
      return {
        level: "Poor",
        suggestions: [
          "Requires immediate academic attention.",
          "Revise the subject daily and strengthen basic concepts.",
          "Solve additional practice questions and attend extra support classes.",
        ],
      };
    case "Average":
      return {
        level: "Average",
        suggestions: [
          "Focus on weak topics through regular revision.",
          "Practice more numerical and theoretical questions.",
          "Improve consistency in assignments and class participation.",
        ],
      };
    case "Good":
      return {
        level: "Good",
        suggestions: [
          "Maintain the current level of performance.",
          "Practice advanced questions to improve further.",
          "Continue regular revision and active classroom participation.",
        ],
      };
    case "Excellent":
      return {
        level: "Excellent",
        suggestions: [
          "Excellent performance. Keep up the good work.",
          "Explore advanced concepts related to this subject.",
          "Maintain consistency and continue helping classmates through discussions.",
        ],
      };
    default:
      return {
        level: "Average",
        suggestions: ["Continue studying regularly."],
      };
  }
};

export const getStructuredReport = (student) => {
  const name = `${student.firstName} ${student.lastName || ""}`.trim();
  const rollNo = student.rollNo || "N/A";
  const department = student.department || "N/A";
  const semester = student.semester || "N/A";
  const attendance = student.attendance !== undefined ? student.attendance : 0;
  const behaviorText = getBehaviourText(student.behaviour);
  const overallPercentage =
    student.averageMarks !== undefined ? student.averageMarks : 0;
  const overallGrade = getGradeFromPercentage(overallPercentage);
  const predictedResult = student.predictedPerformance || "Average";
  const riskLevel = student.riskLevel || "Medium";
  const confidencePercent =
    student.confidence !== undefined
      ? Math.round(student.confidence * 100)
      : 80;

  const improvements = [];
  const subjects = student.currentSubjects || [];

  subjects.forEach((subject) => {
    const recommendation = getSubjectImprovement(subject.predictedPerformance);
    improvements.push({
      area: subject.subjectName,
      performance: recommendation.level,
      suggestions: recommendation.suggestions,
    });
  });

  if (attendance < 85) {
    improvements.push({
      area: "Attendance",
      suggestions: ["Focus on improving classroom attendance."],
    });
  }

  if (getScaledBehaviour(student.behaviour) < 75) {
    improvements.push({
      area: "Classroom behaviour",
      suggestions: ["Improve classroom behavior and participation."],
    });
  }

  if (improvements.length === 0) {
    improvements.push({
      area: "Study routine",
      suggestions: [
        "Keep up the current study routine.",
        "Maintain current performance standards.",
      ],
    });
  }

  const strengths = [];

  subjects.forEach((subject) => {
    if (
      subject.predictedPerformance === "Excellent" ||
      subject.predictedPerformance === "Good"
    ) {
      strengths.push(`Strong ${subject.subjectName} performance.`);
    }
  });

  if (attendance >= 90) {
    strengths.push("Consistent attendance.");
  }

  if (getScaledBehaviour(student.behaviour) >= 75) {
    strengths.push("Good classroom behavior.");
  }

  if (strengths.length === 0) {
    strengths.push("Active participation in class.");
  }

  const passOrFail = predictedResult === "Poor" ? "FAIL" : "PASS";

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
      overallPercentage: parseFloat(Number(overallPercentage).toFixed(1)),
      overallGrade,
      predictedResult,
      riskLevel,
    },
    subjects: subjects.map((subject) => ({
      subjectName: subject.subjectName,
      percentage: subject.totalMarks,
      grade: subject.grade || getGradeFromPercentage(subject.totalMarks),
      prediction: subject.predictedPerformance || "Average",
    })),
    futurePrediction: {
      expectedPerformance: predictedResult,
      confidence: confidencePercent,
    },
    improvements,
    strengths: strengths.slice(0, 3),
    finalDecision: {
      status: predictedResult === "Poor" ? "Fail" : "Pass",
      message: `Student is expected to ${passOrFail} the upcoming examination if their academic performance remains at the current ${predictedResult.toUpperCase()} level.`,
    },
    updatedAt: student.updatedAt || student.createdAt || null,
  };
};
