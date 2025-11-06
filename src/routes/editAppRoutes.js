const express = require('express');
const router = express.Router();
const controller = require('../controllers/editAppController');
const {getPreviousAppointments, getPreviousAppointmentById}=require('../controllers/previousApptController')

//const  updateTimeSlotsSchema = require('../validators/editAppSchemaValidation')
const validateRequest = require('../middleware/validateRequest');
 
 
router.put('/cancel/:appointmentId', controller.cancelAppointment);
router.put('/update/:appointmentId', controller.updateTimeSlot);
router.get('/previous/:patientId', getPreviousAppointments)
router.get('/previous/:patientId/:appointmentId', getPreviousAppointmentById )
 
 
 
module.exports = router;
 