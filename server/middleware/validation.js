import { body, validationResult } from 'express-validator';

// Handle validation results
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase and number'),
    handleValidationErrors
];

// User login validation
export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Car validation
export const validateCar = [
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('seating_capacity').isInt({ min: 1, max: 50 }).withMessage('Invalid seating capacity'),
    body('fuel_type').trim().notEmpty().withMessage('Fuel type is required'),
    body('transmission').trim().notEmpty().withMessage('Transmission is required'),
    body('pricePerDay').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    handleValidationErrors
];
