import Student from "../models/Student.js";

// ML PREDICTION PLACEHOLDER
// (Replace with Random Forest later)

const predictPerformance = async (studentData) => {
  try {
    const inputFeatures = {
      attendance: studentData.attendance,
      age: studentData.age,
      subjects: studentData.subjects,
    };

    // TODO:
    // const prediction = model.predict(inputFeatures)

    // TEMP LOGIC (only placeholder, NOT final ML)
    return {
      subjectPredictions: studentData.subjects.map((subject) => ({
        subjectName: subject.subjectName,
        predictedPerformance: "Medium",
      })),

      overallPerformance: "Medium",

      confidence: 0.5, // ML will replace this
    };
  } catch (error) {
    throw new Error("Prediction failed");
  }
};

//
// ===============================
// ADD STUDENT (WITH ML HOOK)
// ===============================
//
export const addStudent = async (req, res) => {
  try {
    const studentData = req.body;

    const subjects = Array.isArray(studentData.subjects)
      ? studentData.subjects
      : [];

    if (!subjects.length) {
      return res.status(400).json({
        message: "At least one subject is required",
      });
    }

    // ML Prediction
    const prediction = await predictPerformance(studentData);

    // Attach subject predictions
    studentData.subjects = subjects.map((subject) => {
      const predicted = prediction.subjectPredictions.find(
        (p) => p.subjectName === subject.subjectName,
      );

      return {
        ...subject,
        predictedPerformance: predicted?.predictedPerformance || null,
      };
    });

    studentData.overallPerformance = prediction.overallPerformance;

    // 🚨 Risk Level Feature
    studentData.riskLevel =
      prediction.overallPerformance === "Low"
        ? "High"
        : prediction.overallPerformance === "Medium"
          ? "Medium"
          : "Low";

    const student = await Student.create(studentData);

    return res.status(201).json({
      message: "Student created successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//
// ===============================
// GET ALL STUDENTS
//
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// -----------------DASHBOARD ANALYTICS (IMPORTANT) -----------------//
// --------------------Faculty + Semester filtering --------------------//

export const getDashboardData = async (req, res) => {
  try {
    const { faculty, semester } = req.query;

    const students = await Student.find({
      faculty,
      semester,
    });

    const high = [];
    const medium = [];
    const low = [];
    const atRisk = [];

    students.forEach((student) => {
      if (student.overallPerformance === "High") {
        high.push(student);
      } else if (student.overallPerformance === "Medium") {
        medium.push(student);
      } else {
        low.push(student);
        atRisk.push(student);
      }
    });

    return res.status(200).json({
      faculty,
      semester,
      totalStudents: students.length,

      highPerformance: {
        count: high.length,
        students: high,
      },

      mediumPerformance: {
        count: medium.length,
        students: medium,
      },

      lowPerformance: {
        count: low.length,
        students: low,
      },

      atRiskStudents: atRisk,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ---------------GET SINGLE STUDENT --------------------- //
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student fetched successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ---------------UPDATE STUDENT --------------------- //

export const updateStudent = async (req, res) => {
  try {
    const studentData = req.body;

    if (studentData.subjects) {
      const prediction = await predictPerformance(studentData);

      studentData.subjects = studentData.subjects.map((subject) => {
        const predicted = prediction.subjectPredictions.find(
          (p) => p.subjectName === subject.subjectName,
        );

        return {
          ...subject,
          predictedPerformance: predicted?.predictedPerformance || null,
        };
      });

      studentData.overallPerformance = prediction.overallPerformance;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      studentData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ---------------DELETE STUDENT --------------------- //
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
