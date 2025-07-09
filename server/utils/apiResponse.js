/**
 * Standardized API response utility
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Async wrapper for controllers to handle errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Response helper methods
 */
const sendResponse = {
  success: (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message));
  },
  
  error: (res, message = "Something went wrong", statusCode = 500, errors = []) => {
    return res.status(statusCode).json(new ApiError(statusCode, message, errors));
  },
  
  created: (res, data, message = "Created successfully") => {
    return res.status(201).json(new ApiResponse(201, data, message));
  },
  
  notFound: (res, message = "Resource not found") => {
    return res.status(404).json(new ApiError(404, message));
  },
  
  unauthorized: (res, message = "Unauthorized access") => {
    return res.status(401).json(new ApiError(401, message));
  },
  
  forbidden: (res, message = "Access forbidden") => {
    return res.status(403).json(new ApiError(403, message));
  },
  
  badRequest: (res, message = "Bad request", errors = []) => {
    return res.status(400).json(new ApiError(400, message, errors));
  }
};

export { ApiResponse, ApiError, asyncHandler, sendResponse };
