const { checkSchema } = require('express-validator');

const consultationSchema = checkSchema({

  prescription: {
    in: ['body'],
    notEmpty: { errorMessage: 'Prescription is required' },
    isString: { errorMessage: 'Prescription must be a string' },
    trim: true
  },
  notes: {
    in: ['body'],
    notEmpty: { errorMessage: 'Notes are required' },
    isString: { errorMessage: 'Notes must be a string' },
    trim: true
  },
  appointmentId: {
    in: ['body'],
    notEmpty: { errorMessage: 'Appointment ID is required' },
    isString: { errorMessage: 'Appointment must be string' },
    toInt: true
  }
});

module.exports = consultationSchema;
