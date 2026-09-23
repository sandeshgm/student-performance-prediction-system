export const validateStudentInput = (body = {}, { partial = false } = {}) => {
  const errors = [];
  const shouldCheck = (field) => !partial || Object.hasOwn(body, field);

  if (shouldCheck("rollNo") && !body.rollNo) {
    errors.push("Roll number is required.");
  }
  if (shouldCheck("firstName") && !body.firstName) {
    errors.push("First name is required.");
  }
  if (shouldCheck("department") && !body.department) {
    errors.push("Department is required.");
  }
  if (shouldCheck("semester") && (body.semester === undefined || body.semester === null || body.semester === "")) {
    errors.push("Semester is required.");
  }
  if (shouldCheck("currentSubjects")) {
    if (!body.currentSubjects || body.currentSubjects.length === 0) {
      errors.push("At least one subject is required.");
    }
  }

  if (shouldCheck("previousSemester")) {
    const previous = body.previousSemester || {};
    const gpa = previous.gpa;
    const previousSemester = previous.semester;
    const percentage = previous.percentage;

    if (
      previousSemester === undefined ||
      previousSemester === null ||
      previousSemester === "" ||
      Number.isNaN(Number(previousSemester))
    ) {
      errors.push("Previous semester is required.");
    }
    if (gpa === undefined || gpa === null || gpa === "" || Number.isNaN(Number(gpa))) {
      errors.push("Previous semester GPA is required.");
    }
    if (
      percentage === undefined ||
      percentage === null ||
      percentage === "" ||
      Number.isNaN(Number(percentage))
    ) {
      errors.push("Previous semester percentage is required.");
    }
  }

  return errors;
};
