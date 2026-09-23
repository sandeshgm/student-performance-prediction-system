import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createStudent, getStudent, updateStudent } from "../api";
import CsvUpload from "../components/CsvUpload";
import { Banner } from "../components/Status";
import { PiLessThan } from "react-icons/pi";
import {toast} from "react-toastify";

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
    semester: "",
    gpa: "",
    percentage: "",
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

const isFilledNumber = (value) =>
  value !== "" && value !== undefined && value !== null && !Number.isNaN(Number(value));

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
            semester: student.previousSemester?.semester ?? "",
            gpa: student.previousSemester?.gpa ?? "",
            percentage: student.previousSemester?.percentage ?? "",
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

      if (path === "semester") {
        const previous = Math.max(1, Number(value) - 1);
        if (
          next.previousSemester.semester === "" ||
          Number(next.previousSemester.semester) >= Number(value)
        ) {
          next.previousSemester.semester = previous;
        }
      }

      return next;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");

    const prev = form.previousSemester;
    if (
      !isFilledNumber(prev.semester) ||
      !isFilledNumber(prev.gpa) ||
      !isFilledNumber(prev.percentage)
    ) {
      setError("Previous semester, GPA, and percentage are required.");
      return;
    }

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
        Object.entries(form.behaviour).map(([key, value]) => [
          key,
          Number(value),
        ]),
      ),
    };

    try {
      if (id) {
        await updateStudent(id, payload);
        toast.success("Student record updated successfully!");
        navigate(`/students/${id}/report`);
      } else {
        const created = await createStudent(payload);
        toast.success("Student record created successfully!");
        navigate(`/students/${created.data.id}/report`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <p className="text-[#6b7a90]">Loading student…</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 uppercase tracking-[0.12em] text-[0.72rem] font-bold text-[#]">
            {id ? "Update" : "New record"}
          </div>

          <h1 className="m-0 text-3xl font-bold tracking-[-0.03em] text-[#12203a]">
            {id ? "Edit student" : "Add student"}
          </h1>

          <p className="mt-2 text-[#6b7a90]">
            Marks and behaviour are scored on save. Prediction is not typed in.
          </p>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 font-normal  text-slate-600 no-underline hover:bg-[#f7f9fc]"
          to="/"
        >
          <PiLessThan/>
          Back
        </Link>
      </div>

      <Banner className="text-red-500">{error}</Banner>

      {/* {!id ? <CsvUpload /> : null} */}

      <form onSubmit={onSubmit}>
        <section className="mb-4 rounded border border-slate-300 bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h2 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
            Identity
          </h2>

          <div className="mb-4 grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Roll number
              </label>
              <input
                required
                value={form.rollNo}
                onChange={(event) => patch("rollNo", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                First name
              </label>
              <input
                required
                value={form.firstName}
                onChange={(event) => patch("firstName", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Last name
              </label>
              <input
                value={form.lastName}
                onChange={(event) => patch("lastName", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 min-[901px]:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(event) => patch("gender", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Department
              </label>
              <input
                required
                value={form.department}
                onChange={(event) => patch("department", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Semester
              </label>
              <select
                value={form.semester}
                onChange={(event) => patch("semester", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              >
                {Array.from({ length: 8 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Section
              </label>
              <input
                value={form.section}
                onChange={(event) => patch("section", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => patch("email", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Attendance (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.attendance}
                onChange={(event) => patch("attendance", event.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>
          </div>
        </section>

        <section className="mb-4 rounded border border-slate-300 bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h2 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
            Previous semester
          </h2>

          <p className="mb-3 text-[#6b7a90]">
            Required. Previous GPA is used in the performance prediction.
          </p>

          <div className="grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Semester
              </label>
              <input
                required
                type="number"
                min="1"
                max="8"
                value={form.previousSemester.semester}
                onChange={(event) =>
                  patch("previousSemester.semester", event.target.value)
                }
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                GPA (0–4)
              </label>
              <input
                required
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={form.previousSemester.gpa}
                onChange={(event) =>
                  patch("previousSemester.gpa", event.target.value)
                }
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                Percentage
              </label>
              <input
                required
                type="number"
                min="0"
                max="100"
                value={form.previousSemester.percentage}
                onChange={(event) =>
                  patch("previousSemester.percentage", event.target.value)
                }
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
              />
            </div>
          </div>
        </section>

        {/* Current Subjects */}
        <section className="mb-4">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <h2 className="m-0 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
              Current subjects
            </h2>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded border border-slate-300 bg-white px-4 py-2.5 font-normal text-lg text-[#12203a] hover:bg-[#f7f9fc]"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  currentSubjects: [
                    ...current.currentSubjects,
                    emptySubject(),
                  ],
                }))
              }
            >
              Add subject
            </button>
          </div>

          {form.currentSubjects.map((subject, index) => (
            <div
              className="mb-4 rounded border border-slate-300 bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]"
              key={index}
            >
              <div className="mb-4 grid grid-cols-1 gap-4 min-[901px]:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                    Code
                  </label>
                  <input
                    required
                    value={subject.subjectCode}
                    onChange={(event) =>
                      patch(
                        `currentSubjects.${index}.subjectCode`,
                        event.target.value,
                      )
                    }
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                    Name
                  </label>
                  <input
                    required
                    value={subject.subjectName}
                    onChange={(event) =>
                      patch(
                        `currentSubjects.${index}.subjectName`,
                        event.target.value,
                      )
                    }
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
                  />
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 min-[901px]:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                    Internal /20
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={subject.internalMarks}
                    onChange={(event) =>
                      patch(
                        `currentSubjects.${index}.internalMarks`,
                        event.target.value,
                      )
                    }
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                    Assignment /20
                  </label>
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
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                    Terminal /60
                  </label>
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
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-2.25 text-[#12203a] outline-none focus:border-[#2f6bff] focus:ring-2 focus:ring-[#2f6bff]/10"
                  />
                </div>
              </div>

              {form.currentSubjects.length > 1 ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded border-0 bg-transparent px-0 py-2 font-normal text-lg text-[#f43f7c] hover:underline"
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

        <section className="mb-4 rounded border border-slate-300 bg-white px-5 py-4.5 shadow-[0_8px_28px_rgba(15,36,68,0.06)]">
          <h2 className="mb-3 text-xl font-bold tracking-[-0.03em] text-[#12203a]">
            Behaviour (1–5)
          </h2>

          {behaviourFields.map(([key, label]) => (
            <div
              className="grid grid-cols-[120px_1fr_32px] items-center gap-3 border-b border-slate-300 py-3 last:border-b-0"
              key={key}
            >
              <label className="text-[0.8rem] font-normal text-lg text-[#6b7a90]">
                {label}
              </label>

              <input
                type="range"
                min="1"
                max="5"
                value={form.behaviour[key]}
                onChange={(event) =>
                  patch(`behaviour.${key}`, event.target.value)
                }
                className="w-full accent-[#2f6bff]"
              />

              <strong className="text-center text-[#12203a]">
                {form.behaviour[key]}
              </strong>
            </div>
          ))}
        </section>

        <div className="mt-5 flex items-center gap-2">
          <button
            className="rounded border-0 bg-[#125887] hover:bg-[#0e476d] px-4 py-2.5 font-normal text-lg text-white disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={pending}
          >
            {pending ? "Saving and predicting…" : "Save student"}
          </button>
        </div>
      </form>
    </div>
  );
}