export const handleStudentError = (error, res) => {
  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A student with this roll number already exists.",
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Something went wrong.",
  });
};
