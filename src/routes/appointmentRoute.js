const express = require('express');
const router = express.Router();
const { bookAppointment } = require('../controllers/appointmentController');
const bookingSchema = require('../validators/bookingSchema');
const { validationResult } = require('express-validator');
const { authenticate } = require('../middleware/authenticate')
const passport = require('../config/passport');
const { authorize } = require("../middleware/authorize");
 
router.post('/bookAppointment', authorize(["Patient"]),bookingSchema, bookAppointment);
 
module.exports = router;
 
 