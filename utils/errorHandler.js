export const handleStudentError = (error, res) => {
  return res.status(500).json({
    success: false,
    message: error.message,
  });
};