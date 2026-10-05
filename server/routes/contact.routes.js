const express    = require('express');
const rateLimit  = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { submitContact } = require('../controllers/contact.controller');

const router = express.Router();

// Strict rate limiter for the contact endpoint — 5 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs:    60 * 60 * 1000,  // 1 hour
  max:         5,
  message:     { success: false, message: 'Too many messages sent. Please wait an hour before trying again.' },
  standardHeaders: true,
  legacyHeaders:   false,
  skipSuccessfulRequests: false,
});

// express-validator sanitisation middleware
const validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name is too long.')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail()
    .isLength({ max: 254 }),
  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Subject is too long.')
    .escape(),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required.')
    .isLength({ max: 5000 }).withMessage('Message must be under 5000 characters.')
    .escape(),
  // Return first validation error immediately
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors:  errors.array().map(e => e.msg),
      });
    }
    next();
  },
];

// POST /api/contact
router.post('/', contactLimiter, validateContact, submitContact);

module.exports = router;
