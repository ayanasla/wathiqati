const logger = require('./logger');

/**
 * Standardized API Response Wrapper
 * Ensures all API responses follow a consistent format:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any,
 *   error: string (if failed),
 *   statusCode: number,
 *   timestamp: ISO timestamp
 * }
 */
class ApiResponse {
  /**
   * Success response
   */
  static success(data, message = 'Operation successful', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Error response
   */
  static error(message = 'An error occurred', statusCode = 500, error = null) {
    const response = {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      response.error = error instanceof Error ? error.message : error;
      if (process.env.NODE_ENV === 'development') {
        response.stack = error instanceof Error ? error.stack : null;
      }
    }

    return response;
  }

  /**
   * Validation error response
   */
  static validation(errors, message = 'Validation failed') {
    return {
      success: false,
      message,
      statusCode: 422,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Paginated response
   */
  static paginated(data, pagination, message = 'Data retrieved successfully', statusCode = 200) {
    return {
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total,
        count: pagination.count || data.length,
        limit: pagination.limit,
        offset: pagination.offset,
        pages: pagination.pages,
        currentPage: pagination.currentPage || Math.floor(pagination.offset / pagination.limit) + 1,
      },
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Not found response
   */
  static notFound(message = 'Resource not found') {
    return {
      success: false,
      message,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Unauthorized response
   */
  static unauthorized(message = 'Unauthorized access') {
    return {
      success: false,
      message,
      statusCode: 401,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Forbidden response
   */
  static forbidden(message = 'Access forbidden') {
    return {
      success: false,
      message,
      statusCode: 403,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Helper middleware for standardized response handling
 * Usage: app.use(apiResponseMiddleware)
 */
const apiResponseMiddleware = (req, res, next) => {
  res.sendSuccess = (data, message = 'OK', statusCode = 200) => {
    return res.status(statusCode).json(ApiResponse.success(data, message, statusCode));
  };

  res.sendError = (message = 'Error', statusCode = 500, error = null) => {
    return res.status(statusCode).json(ApiResponse.error(message, statusCode, error));
  };

  res.sendValidation = (errors, message = 'Validation failed') => {
    return res.status(422).json(ApiResponse.validation(errors, message));
  };

  res.sendPaginated = (data, pagination, message = 'OK', statusCode = 200) => {
    return res.status(statusCode).json(ApiResponse.paginated(data, pagination, message, statusCode));
  };

  res.sendNotFound = (message = 'Not found') => {
    return res.status(404).json(ApiResponse.notFound(message));
  };

  res.sendUnauthorized = (message = 'Unauthorized') => {
    return res.status(401).json(ApiResponse.unauthorized(message));
  };

  res.sendForbidden = (message = 'Forbidden') => {
    return res.status(403).json(ApiResponse.forbidden(message));
  };

  next();
};

module.exports = { ApiResponse, apiResponseMiddleware };
