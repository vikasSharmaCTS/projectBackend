const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointmentById } = require('../controllers/appointmentController');
const validateBooking = require('../validators/bookingValidator');
const bookingSchema = require('../validators/bookingSchema');
const { validationResult } = require('express-validator');

router.post('/:specialty/:id/appointment', bookingSchema, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  bookAppointment(req, res);
});

router.get('/:appointmentId', getAppointmentById);

module.exports = router;
