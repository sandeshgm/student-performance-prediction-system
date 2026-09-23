import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createStudent } from "../api";
import { csvToStudents } from "../csvStudents";
import { Banner } from "./Status";

export default function CsvUpload() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);

  function readFile(file) {
    setError("");
    setNotice("");
    setProgress(null);
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Upload a .csv file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = csvToStudents(String(reader.result || ""));
        setStudents(parsed);
        setFileName(file.name);
      } catch (err) {
        setStudents([]);
        setFileName("");
        setError(err.message);
      }
    };
    reader.readAsText(file);
  }

  async function onImport() {
    setImporting(true);
    setError("");
    setNotice("");
    const failed = [];
    let imported = 0;

    for (const [index, student] of students.entries()) {
      setProgress({ current: index + 1, total: students.length });
      try {
        await createStudent(student);
        imported += 1;
      } catch (err) {
        failed.push(`${student.rollNo}: ${err.message}`);
      }
    }

    setImporting(false);
    setProgress(null);

    if (imported && !failed.length) {
      navigate("/students");
      return;
    }

    setNotice(
      `Imported ${imported} of ${students.length} student${students.length === 1 ? "" : "s"}.`,
    );
    if (failed.length) {
      setError(failed.join(" "));
    }
  }

  return (
    <>
    {/* <section className="card csv-card">
      <div className="card-title">
        <h2>Import CSV</h2>
        <a className="chip-btn" href="/student-template.csv" download>
          Download template
        </a>
      </div>
      <p className="muted">
        One row per subject. Repeat the same roll number for extra subjects.
        Required: rollNo, firstName, department, semester, subjectCode,
        subjectName.
      </p>
      <Banner>{error}</Banner>
      {notice ? <p className="notice">{notice}</p> : null}

      <label
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          readFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => readFile(event.target.files?.[0])}
        />
        <strong>{fileName || "Choose a CSV file"}</strong>
        <span>or drop it here</span>
      </label>

      {students.length ? (
        <>
          <div className="table-wrap quiet" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>Dept</th>
                  <th>Subjects</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.rollNo}>
                    <td>{student.rollNo}</td>
                    <td>
                      {student.firstName} {student.lastName}
                    </td>
                    <td>{student.department}</td>
                    <td>{student.currentSubjects.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="actions" style={{ marginTop: 14 }}>
            <button
              className="btn"
              type="button"
              disabled={importing}
              onClick={onImport}
            >
              {importing
                ? `Importing ${progress?.current || 0}/${progress?.total || students.length}…`
                : `Import ${students.length} student${students.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      ) : null}
    </section> */}
    </>
  );
}
