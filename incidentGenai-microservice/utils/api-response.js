export const apiResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

export const successResponse = (res, message, data = null) => {
  return apiResponse(res, 200, true, message, data);
};
export const errorResponse = (res, statusCode, message) => {
  return apiResponse(res, statusCode, false, message);
};
export const createdResponse = (res, message, data = null) => {
  return apiResponse(res, 201, true, message, data);
};
export const badRequestResponse = (res, message) => {
  return errorResponse(res, 400, message);
};
export const unauthorizedResponse = (res, message) => {
  return errorResponse(res, 401, message);
};
export const forbiddenResponse = (res, message) => {
  return errorResponse(res, 403, message);
};
export const notFoundResponse = (res, message) => {
  return errorResponse(res, 404, message);
};
export const internalServerErrorResponse = (res, message) => {
  return errorResponse(res, 500, message);
};
