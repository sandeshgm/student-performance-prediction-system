import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createStudent, getStudent, updateStudent } from "../api";
import CsvUpload from "../components/CsvUpload";
import { Banner } from "../components/Status";

const emptySubject = () => ({
  subjectCode: "",
  subjectName: "",
  internalMarks: 0,
  assignmentMarks: 0,
  terminalExamMarks: 0,
});

const emptyForm = {
  rollNo: "",
  firstName: "",
  lastName: "",
  gender: "Male",
  department: "",
  semester: 1,
  section: "",
  email: "",
  attendance: 0,
  previousSemester: {
    semester: 1,
    gpa: 2.5,
    percentage: 0,
  },
  currentSubjects: [emptySubject()],
  behaviour: {
    discipline: 3,
    communication: 3,
    teamwork: 3,
    participation: 3,
    homeworkCompletion: 3,
    punctuality: 3,
  },
};

const behaviourFields = [
  ["discipline", "Discipline"],
  ["communication", "Communication"],
  ["teamwork", "Teamwork"],
  ["participation", "Participation"],
  ["homeworkCompletion", "Homework"],
  ["punctuality", "Punctuality"],
];

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    getStudent(id)
      .then((result) => {
        if (cancelled) {
          return;
        }
        const student = result.data;
        setForm({
          ...emptyForm,
          ...student,
          previousSemester: {
            ...emptyForm.previousSemester,
            ...(student.previousSemester || {}),
          },
          currentSubjects:
            student.currentSubjects?.length > 0
              ? student.currentSubjects.map((subject) => ({
                  subjectCode: subject.subjectCode || "",
                  subjectName: subject.subjectName || "",
                  internalMarks: subject.internalMarks || 0,
                  assignmentMarks: subject.assignmentMarks || 0,
                  terminalExamMarks: subject.terminalExamMarks || 0,
                }))
              : [emptySubject()],
          behaviour: {
            ...emptyForm.behaviour,
            ...(student.behaviour || {}),
          },
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function patch(path, value) {
    setForm((current) => {
      const next = structuredClone(current);
      const keys = path.split(".");
      let cursor = next;
      keys.slice(0, -1).forEach((key) => {
        cursor = cursor[key];
      });
      cursor[keys.at(-1)] = value;
      return next;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    const payload = {
      rollNo: form.rollNo,
      firstName: form.firstName,
      lastName: form.lastName,
      gender: form.gender,
      department: form.department,
      semester: Number(form.semester),
      section: form.section,
      email: form.email,
      attendance: Number(form.attendance),
      previousSemester: {
        semester: Number(form.previousSemester.semester),
        gpa: Number(form.previousSemester.gpa),
        percentage: Number(form.previousSemester.percentage),
      },
      currentSubjects: form.currentSubjects.map((subject) => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        internalMarks: Number(subject.internalMarks),
        assignmentMarks: Number(subject.assignmentMarks),
        terminalExamMarks: Number(subject.terminalExamMarks),
      })),
      behaviour: Object.fromEntries(
        Object.entries(form.behaviour).map(([key, value]) => [key, Number(value)]),
      ),
    };

    try {
      if (id) {
        await updateStudent(id, payload);
        navigate(`/students/${id}/report`);
      } else {
        const created = await createStudent(payload);
        navigate(`/students/${created.data.id}/report`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <p className="muted">Loading student…</p>;
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="eyebrow">{id ? "Update" : "New record"}</div>
          <h1>{id ? "Edit student" : "Add student"}</h1>
          <p>Marks and behaviour are scored on save. Prediction is not typed in.</p>
        </div>
        <Link className="btn secondary" to="/students">
          Back
        </Link>
      </div>

      <Banner>{error}</Banner>

      {id ? null : <CsvUpload />}

      <form onSubmit={onSubmit}>
      <section className="card">
        <h2>Identity</h2>
        <div className="row">
          <div className="field">
            <label>Roll number</label>
            <input
              required
              value={form.rollNo}
              onChange={(event) => patch("rollNo", event.target.value)}
            />
          </div>
          <div className="field">
            <label>First name</label>
            <input
              required
              value={form.firstName}
              onChange={(event) => patch("firstName", event.target.value)}
            />
          </div>
          <div className="field">
            <label>Last name</label>
            <input
              value={form.lastName}
              onChange={(event) => patch("lastName", event.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>Gender</label>
            <select
              value={form.gender}
              onChange={(event) => patch("gender", event.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="field">
            <label>Department</label>
            <input
              required
              value={form.department}
              onChange={(event) => patch("department", event.target.value)}
            />
          </div>
          <div className="field">
            <label>Semester</label>
            <select
              value={form.semester}
              onChange={(event) => patch("semester", event.target.value)}
            >
              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Section</label>
            <input
              value={form.section}
              onChange={(event) => patch("section", event.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => patch("email", event.target.value)}
            />
          </div>
          <div className="field">
            <label>Attendance (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.attendance}
              onChange={(event) => patch("attendance", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card section">
        <h2>Previous semester</h2>
        <div className="row">
          <div className="field">
            <label>Semester</label>
            <input
              type="number"
              min="1"
              max="8"
              value={form.previousSemester.semester}
              onChange={(event) =>
                patch("previousSemester.semester", event.target.value)
              }
            />
          </div>
          <div className="field">
            <label>GPA (0–4)</label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.01"
              value={form.previousSemester.gpa}
              onChange={(event) => patch("previousSemester.gpa", event.target.value)}
            />
          </div>
          <div className="field">
            <label>Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.previousSemester.percentage}
              onChange={(event) =>
                patch("previousSemester.percentage", event.target.value)
              }
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-head">
          <h2>Current subjects</h2>
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setForm((current) => ({
                ...current,
                currentSubjects: [...current.currentSubjects, emptySubject()],
              }))
            }
          >
            Add subject
          </button>
        </div>
        {form.currentSubjects.map((subject, index) => (
          <div className="card subject-card" key={index}>
            <div className="row">
              <div className="field">
                <label>Code</label>
                <input
                  required
                  value={subject.subjectCode}
                  onChange={(event) =>
                    patch(`currentSubjects.${index}.subjectCode`, event.target.value)
                  }
                />
              </div>
              <div className="field">
                <label>Name</label>
                <input
                  required
                  value={subject.subjectName}
                  onChange={(event) =>
                    patch(`currentSubjects.${index}.subjectName`, event.target.value)
                  }
                />
              </div>
            </div>
            <div className="row">
              <div className="field">
                <label>Internal /20</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={subject.internalMarks}
                  onChange={(event) =>
                    patch(`currentSubjects.${index}.internalMarks`, event.target.value)
                  }
                />
              </div>
              <div className="field">
                <label>Assignment /20</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={subject.assignmentMarks}
                  onChange={(event) =>
                    patch(
                      `currentSubjects.${index}.assignmentMarks`,
                      event.target.value,
                    )
                  }
                />
              </div>
              <div className="field">
                <label>Terminal /60</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={subject.terminalExamMarks}
                  onChange={(event) =>
                    patch(
                      `currentSubjects.${index}.terminalExamMarks`,
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
            {form.currentSubjects.length > 1 ? (
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    currentSubjects: current.currentSubjects.filter(
                      (_, subjectIndex) => subjectIndex !== index,
                    ),
                  }))
                }
              >
                Remove subject
              </button>
            ) : null}
          </div>
        ))}
      </section>

      <section className="card section">
        <h2>Behaviour (1–5)</h2>
        {behaviourFields.map(([key, label]) => (
          <div className="slider-row" key={key}>
            <label>{label}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={form.behaviour[key]}
              onChange={(event) => patch(`behaviour.${key}`, event.target.value)}
            />
            <strong>{form.behaviour[key]}</strong>
          </div>
        ))}
      </section>

      <div className="actions" style={{ marginTop: 20 }}>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Saving and predicting…" : "Save student"}
        </button>
      </div>
    </form>
    </div>
  );
}
