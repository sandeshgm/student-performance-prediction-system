const HEADER_ALIASES = {
  rollno: "rollNo",
  roll_no: "rollNo",
  roll: "rollNo",
  firstname: "firstName",
  first_name: "firstName",
  lastname: "lastName",
  last_name: "lastName",
  gender: "gender",
  department: "department",
  dept: "department",
  semester: "semester",
  section: "section",
  email: "email",
  attendance: "attendance",
  prevsemester: "prevSemester",
  prev_semester: "prevSemester",
  previoussemester: "prevSemester",
  gpa: "gpa",
  prevgpa: "gpa",
  prev_gpa: "gpa",
  prevpercentage: "prevPercentage",
  prev_percentage: "prevPercentage",
  percentage: "prevPercentage",
  discipline: "discipline",
  communication: "communication",
  teamwork: "teamwork",
  participation: "participation",
  homework: "homeworkCompletion",
  homeworkcompletion: "homeworkCompletion",
  homework_completion: "homeworkCompletion",
  punctuality: "punctuality",
  subjectcode: "subjectCode",
  subject_code: "subjectCode",
  subjectname: "subjectName",
  subject_name: "subjectName",
  subject: "subjectName",
  internalmarks: "internalMarks",
  internal: "internalMarks",
  assignmentmarks: "assignmentMarks",
  assignment: "assignmentMarks",
  terminalexammarks: "terminalExamMarks",
  terminal: "terminalExamMarks",
  subjects: "subjects",
};

export function parseCsv(text) {
  const source = String(text || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field.trim());
      field = "";
    } else if (char === "\n") {
      row.push(field.trim());
      field = "";
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field.trim());
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeHeader(value) {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return HEADER_ALIASES[key.replaceAll("_", "")] || HEADER_ALIASES[key] || key;
}

function toNumber(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parsePackedSubjects(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [subjectCode, subjectName, internalMarks, assignmentMarks, terminalExamMarks] =
        part.split(":").map((item) => item.trim());
      return {
        subjectCode,
        subjectName,
        internalMarks: clamp(toNumber(internalMarks, 0), 0, 20),
        assignmentMarks: clamp(toNumber(assignmentMarks, 0), 0, 20),
        terminalExamMarks: clamp(toNumber(terminalExamMarks, 0), 0, 60),
      };
    })
    .filter((subject) => subject.subjectCode && subject.subjectName);
}

export function csvToStudents(text) {
  const table = parseCsv(text);
  if (table.length < 2) {
    throw new Error("CSV needs a header row and at least one student row.");
  }

  const headers = table[0].map(normalizeHeader);
  const grouped = new Map();

  table.slice(1).forEach((cells, rowIndex) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });

    const rollNo = row.rollNo;
    if (!rollNo) {
      throw new Error(`Row ${rowIndex + 2} is missing a roll number.`);
    }

    if (!grouped.has(rollNo)) {
      const genderRaw = String(row.gender || "Male");
      const gender = ["Male", "Female", "Other"].includes(genderRaw)
        ? genderRaw
        : "Other";

      grouped.set(rollNo, {
        rollNo,
        firstName: row.firstName,
        lastName: row.lastName || "",
        gender,
        department: row.department,
        semester: clamp(toNumber(row.semester, 1), 1, 8),
        section: row.section || "",
        email: row.email || "",
        attendance: clamp(toNumber(row.attendance, 0), 0, 100),
        previousSemester: {
          semester: clamp(toNumber(row.prevSemester, 1), 1, 8),
          gpa: clamp(toNumber(row.gpa, 2.5), 0, 4),
          percentage: clamp(toNumber(row.prevPercentage, 0), 0, 100),
        },
        behaviour: {
          discipline: clamp(toNumber(row.discipline, 3), 1, 5),
          communication: clamp(toNumber(row.communication, 3), 1, 5),
          teamwork: clamp(toNumber(row.teamwork, 3), 1, 5),
          participation: clamp(toNumber(row.participation, 3), 1, 5),
          homeworkCompletion: clamp(toNumber(row.homeworkCompletion, 3), 1, 5),
          punctuality: clamp(toNumber(row.punctuality, 3), 1, 5),
        },
        currentSubjects: [],
      });
    }

    const student = grouped.get(rollNo);
    const packed = parsePackedSubjects(row.subjects);
    if (packed.length) {
      student.currentSubjects.push(...packed);
    }

    if (row.subjectCode && row.subjectName) {
      student.currentSubjects.push({
        subjectCode: row.subjectCode,
        subjectName: row.subjectName,
        internalMarks: clamp(toNumber(row.internalMarks, 0), 0, 20),
        assignmentMarks: clamp(toNumber(row.assignmentMarks, 0), 0, 20),
        terminalExamMarks: clamp(toNumber(row.terminalExamMarks, 0), 0, 60),
      });
    }
  });

  const students = [...grouped.values()];
  students.forEach((student) => {
    if (!student.firstName || !student.department) {
      throw new Error(
        `Student ${student.rollNo} needs firstName and department.`,
      );
    }
    if (!student.currentSubjects.length) {
      throw new Error(`Student ${student.rollNo} needs at least one subject.`);
    }
  });

  return students;
}
