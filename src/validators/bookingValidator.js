const { param, body } = require('express-validator');

const validateBooking = [

  param('specialty')
    .notEmpty().withMessage('Specialty is required')
    .isString().withMessage('Specialty must be a string'),

  param('id')
    .notEmpty().withMessage('ID is required')
    .isInt().withMessage('ID must be a number'),

  body('patientId')
    .notEmpty().withMessage('Patient ID is required')
    .isInt().withMessage('Patient ID must be a number'),

  body('date')
    .custom(value => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(value)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      return true;
    }),

  body('startTime')
    .custom(value => {
      const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!regex.test(value)) {
        throw new Error('Start time must be in HH:mm format');
      }
      return true;
    }),

  body('endTime')
    .custom((value, { req }) => {
      const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!regex.test(value)) {
        throw new Error('End time must be in HH:mm format');
      }
      if (value <= req.body.startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    })

];

module.exports = validateBooking;
