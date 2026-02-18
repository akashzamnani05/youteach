"use strict";
// src/middleware/validation.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateWebinar = exports.validateCreateWebinar = exports.validateStudentSignup = exports.validateTeacherSignup = exports.validateLogin = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.type === 'field' ? err.path : 'unknown',
                message: err.msg,
            })),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Login validation
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
];
// Teacher signup validation
exports.validateTeacherSignup = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
    (0, express_validator_1.body)('full_name')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Invalid phone number format'),
    (0, express_validator_1.body)('bio')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Bio must not exceed 5000 characters'),
    (0, express_validator_1.body)('headline')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Headline must not exceed 500 characters'),
    (0, express_validator_1.body)('specializations')
        .optional()
        .isArray()
        .withMessage('Specializations must be an array'),
    (0, express_validator_1.body)('experience_years')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Experience years must be between 0 and 100'),
    (0, express_validator_1.body)('hourly_rate')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Hourly rate must be a positive number'),
];
// Student signup validation
exports.validateStudentSignup = [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
    (0, express_validator_1.body)('full_name')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Invalid phone number format'),
    (0, express_validator_1.body)('date_of_birth')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format. Use YYYY-MM-DD'),
    (0, express_validator_1.body)('interests')
        .optional()
        .isArray()
        .withMessage('Interests must be an array'),
    (0, express_validator_1.body)('education_level')
        .optional()
        .trim()
        .isIn(['Elementary', 'High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'])
        .withMessage('Invalid education level'),
];
// Webinar validation
exports.validateCreateWebinar = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),
    (0, express_validator_1.body)('scheduled_at')
        .isISO8601()
        .withMessage('Valid scheduled date is required'),
    (0, express_validator_1.body)('duration_minutes')
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 minute'),
    (0, express_validator_1.body)('meeting_link')
        .trim()
        .notEmpty()
        .withMessage('Meeting link is required')
        .isURL()
        .withMessage('Meeting link must be a valid URL'),
    (0, express_validator_1.body)('meeting_password')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Password must be less than 50 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim(),
    (0, express_validator_1.body)('max_participants')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max participants must be at least 1'),
    (0, express_validator_1.body)('is_recorded')
        .optional()
        .isBoolean()
        .withMessage('is_recorded must be a boolean'),
    (0, express_validator_1.body)('course_id')
        .optional()
        .trim(),
];
exports.validateUpdateWebinar = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),
    (0, express_validator_1.body)('scheduled_at')
        .optional()
        .isISO8601()
        .withMessage('Valid scheduled date is required'),
    (0, express_validator_1.body)('duration_minutes')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 minute'),
    (0, express_validator_1.body)('meeting_link')
        .optional()
        .trim()
        .isURL()
        .withMessage('Meeting link must be a valid URL'),
    (0, express_validator_1.body)('meeting_password')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Password must be less than 50 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim(),
    (0, express_validator_1.body)('max_participants')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max participants must be at least 1'),
    (0, express_validator_1.body)('is_recorded')
        .optional()
        .isBoolean()
        .withMessage('is_recorded must be a boolean'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['scheduled', 'live', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
];
//# sourceMappingURL=validation.middleware.js.map