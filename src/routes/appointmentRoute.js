const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointmentById } = require('../controllers/appointmentController');
const bookingSchema = require('../validators/bookingSchema');
const { validationResult } = require('express-validator');

router.post('/appointment', bookingSchema, (req, res) => {

  bookAppointment(req, res);
});

router.get('/:appointmentId', getAppointmentById);

module.exports = router;