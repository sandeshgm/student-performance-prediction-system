export const validateStudentInput = (body) => {
  const errors = [];

  if (!body.rollNo) errors.push("Roll number is required.");
  if (!body.firstName) errors.push("First name is required.");
  if (!body.department) errors.push("Department is required.");
  if (!body.semester) errors.push("Semester is required.");
  if (!body.currentSubjects || body.currentSubjects.length === 0) {
    errors.push("At least one subject is required.");
  }

  return errors;
};
