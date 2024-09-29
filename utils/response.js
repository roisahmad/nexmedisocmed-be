exports.successResponse = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    status: "success",
    message: message,
    data: data,
  });
};
exports.errorResponse = (res, statusCode, message) => {
  res.status(statusCode).json({
    status: "error",
    message: message,
  });
};
