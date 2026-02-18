// src/middleware/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
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

// Login validation
export const validateLogin: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

// Teacher signup validation
export const validateTeacherSignup: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
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
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Bio must not exceed 5000 characters'),
  body('headline')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Headline must not exceed 500 characters'),
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Experience years must be between 0 and 100'),
];

// Student signup validation
export const validateStudentSignup: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
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
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format. Use YYYY-MM-DD'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('education_level')
    .optional()
    .trim()
    .isIn(['Elementary', 'High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Other'])
    .withMessage('Invalid education level'),
];

// Webinar validation
export const validateCreateWebinar: ValidationChain[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('scheduled_at')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('duration_minutes')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('meeting_link')
    .trim()
    .notEmpty()
    .withMessage('Meeting link is required')
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  body('meeting_password')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Password must be less than 50 characters'),
  body('description')
    .optional()
    .trim(),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),
  body('is_recorded')
    .optional()
    .isBoolean()
    .withMessage('is_recorded must be a boolean'),
  body('course_id')
    .optional()
    .trim(),
];

export const validateUpdateWebinar: ValidationChain[] = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('scheduled_at')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('duration_minutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('meeting_link')
    .optional()
    .trim()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
  body('meeting_password')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Password must be less than 50 characters'),
  body('description')
    .optional()
    .trim(),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),
  body('is_recorded')
    .optional()
    .isBoolean()
    .withMessage('is_recorded must be a boolean'),
  body('status')
    .optional()
    .isIn(['scheduled', 'live', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];