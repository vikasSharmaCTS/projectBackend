const express = require('express');
const router = express.Router();
const controller = require('../controllers/editAppController');
const {getPreviousAppointments, getPreviousConsultationById, getUpcomingAppointments,downloadConsultation}=require('../controllers/previousApptController')
 
const validateRequest = require('../middleware/validateRequest');
 
 
router.put('/cancel', controller.cancelAppointment);
router.put('/update/:appointmentId', controller.updateTimeSlot);
router.get('/previous', getPreviousAppointments)
router.get('/previousConsultation', getPreviousConsultationById )
router.get('/downloadConsultation', downloadConsultation ) // send speciality and change file name to patientname
router.get('/upcomingAppointments', getUpcomingAppointments);// for patient only // if empty dont show error give blank array
 // should not have completed in upcoming
 
module.exports = router;
 