const express = require('express');
const router = express.Router();
const controller = require('../controllers/editAppController');
const {getPreviousAppointments, getPreviousConsultationById, getUpcomingAppointments,downloadConsultation}=require('../controllers/previousApptController')
const passport = require('../config/passport');
const { authorize } = require("../middleware/authorize");
 
const validateRequest = require('../middleware/validateRequest');
 
 
router.put('/cancel', controller.cancelAppointment);
router.put('/update/:appointmentId', controller.updateTimeSlot);
router.get('/previous',
      passport.authenticate('jwt', { session: false }), authorize(["Patient"]), getPreviousAppointments)
router.get('/previousConsultation', authorize(["Patient"]), getPreviousConsultationById )
router.get('/downloadConsultation', authorize(["Patient"]), downloadConsultation ) // send speciality and change file name to patientname
router.get('/upcomingAppointments', authorize(["Patient"]), getUpcomingAppointments);// for patient only // if empty dont show error give blank array
 // should not have completed in upcoming
 
module.exports = router;
 
 