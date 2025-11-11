const { checkSchema } = require('express-validator');

const consultationSchema = checkSchema({
  registrationNumber: {
    in: ['body'],
    notEmpty: { errorMessage: 'registrationNumber is required' },
    matches: {
      options: [/^[A-Za-z0-9\-]+$/],
      errorMessage: 'Invalid registrationNumber format'
    },
    trim: true
  },

  patientId: {
    in: ['body'],
    notEmpty: { errorMessage: 'patientId is required' },
    isMongoId: { errorMessage: 'Invalid patientId format' }
  },

  appointmentId: {
    in: ['body'],
    notEmpty: { errorMessage: 'appointmentId is required' },
    isMongoId: { errorMessage: 'Invalid appointmentId format' }
  },

  notes: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Notes must be a string' },
    trim: true,
    isLength: {
      options: { max: 2000 },
      errorMessage: 'Notes too long (max 2000 chars)'
    }
  },

  prescription: {
    in: ['body'],
    optional: true,
    isString: { errorMessage: 'Prescription must be a string' },
    trim: true,
    isLength: {
      options: { max: 2000 },
      errorMessage: 'Prescription too long (max 2000 chars)'
    }
  }
});

module.exports = consultationSchema;