import logger from '../configs/logger.js';
import config from '../configs/config.js';

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error(`Error ${err.message}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        stack: err.stack,
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message,
            value: val.value
        }));
        error = { 
            message: 'Validation failed', 
            statusCode: 400,
            errors 
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please log in again.';
        error = { message, statusCode: 401 };
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size too large';
        error = { message, statusCode: 400 };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file field';
        error = { message, statusCode: 400 };
    }

    // Database connection errors
    if (err.name === 'MongoNetworkError') {
        const message = 'Database connection failed';
        error = { message, statusCode: 503 };
    }

    const response = {
        success: false,
        message: error.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };

    // Include errors array if validation failed
    if (error.errors) {
        response.errors = error.errors;
    }

    // Include stack trace in development
    if (config.env === 'development') {
        response.stack = err.stack;
    }

    res.status(error.statusCode || 500).json(response);
};

// 404 handler
export const notFound = (req, res, next) => {
    const message = `Route ${req.originalUrl} not found`;
    
    logger.warn(`404 - ${message}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    });
    
    res.status(404).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    });
};
