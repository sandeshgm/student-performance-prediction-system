export const buildStudentFilter = (query) => {
  const filter = {};
  const errors = [];

  if (query.semester) {
    const semester = Number(query.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      errors.push("Semester must be an integer between 1 and 8.");
    } else {
      filter.semester = semester;
    }
  }

  if (query.department) {
    filter.department = {
      $regex: String(query.department).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  return {
    filter,
    errors,
  };
};

export const parsePagination = (query, { defaultLimit = 50, maxLimit = 200 } = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requestedLimit = Number.parseInt(query.limit, 10);
  const limit = Math.min(
    maxLimit,
    Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : defaultLimit),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};
