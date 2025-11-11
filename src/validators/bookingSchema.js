
const { checkSchema } = require('express-validator');

const bookingSchema = checkSchema({
  doctorId: {
    in: ['body'],
    notEmpty: { errorMessage: 'Doctor ID is required' },
    isMongoId: { errorMessage: 'Invalid doctorId format' }
  },
  patientId: {
    in: ['body'],
    notEmpty: { errorMessage: 'Patient ID is required' },
    isMongoId: { errorMessage: 'Invalid patientId format' }
  },
  date: {
    in: ['body'],
    custom: {
      options: value => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(value)) {
          throw new Error('Date must be in YYYY-MM-DD format');
        }
        return true;
      }
    }
  },
  startTime: {
    in: ['body'],
    custom: {
      options: value => {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(value)) {
          throw new Error('Start time must be in HH:mm format');
        }
        return true;
      }
    }
  },
  endTime: {
    in: ['body'],
    custom: {
      options: (value, { req }) => {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(value)) {
          throw new Error('End time must be in HH:mm format');
        }
        const [startH, startM] = req.body.startTime.split(':').map(Number);
        const [endH, endM] = value.split(':').map(Number);
        if (endH < startH || (endH === startH && endM <= startM)) {
          throw new Error('End time must be after start time');
        }
        return true;
      }
    }
  }
});

module.exports = bookingSchema;