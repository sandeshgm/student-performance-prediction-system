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

  return errors;
};
