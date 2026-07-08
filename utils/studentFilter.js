export const buildStudentFilter = (query) => {
  const filter = {};
  const errors = [];

  if (query.semester) {
    filter.semester = Number(query.semester);
  }

  if (query.department) {
    filter.department = {
      $regex: query.department,
      $options: "i",
    };
  }

  return {
    filter,
    errors,
  };
};