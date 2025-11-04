const { body, param } = require('express-validator');

const validateUpdateDoctor = [

  param('id')
    .isInt().withMessage('Doctor ID must be a positive number'),


  body('name')
    .optional()
    .notEmpty().withMessage('Name cannot be empty')
    .isString().withMessage('Name must be a string'),


  body('specialty')
    .optional()
    .notEmpty().withMessage('Specialty cannot be empty')
    .isString().withMessage('Specialty must be a string')
];

module.exports = validateUpdateDoctor;
