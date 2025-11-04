const { checkSchema } = require('express-validator');

const bookingSchema = checkSchema({
  
  specialty: {
    in: ['params'],
    trim: true,
    notEmpty: { errorMessage: 'Specialty is required' },
    isString: { errorMessage: 'Specialty must be a string' }
  },

  id: {
    in: ['params'],
    notEmpty: { errorMessage: 'ID is required' },
    isInt: { errorMessage: 'ID must be a number' },
    toInt: true
  },


  patientId: {
    in: ['body'],
    notEmpty: { errorMessage: 'Patient ID is required' },
    isInt: { options: { min: 1 }, errorMessage: 'Patient ID must be a positive integer' },
    toInt: true
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
}
,

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

      const start = req.body.startTime;
      if (value <= start) {
        throw new Error('End time must be after start time');
      }

      return true;
    }
  }
}

});

module.exports = bookingSchema;
