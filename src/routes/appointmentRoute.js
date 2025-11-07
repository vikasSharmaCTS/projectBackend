const express = require('express');
const router = express.Router();
const { bookAppointment } = require('../controllers/appointmentController');
const bookingSchema = require('../validators/bookingSchema');
const { validationResult } = require('express-validator');

router.post('/bookAppointment', bookingSchema, bookAppointment);

module.exports = router;
