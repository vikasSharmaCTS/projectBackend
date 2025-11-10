const express = require("express");
const router = express.Router();
const consultation = require("../controllers/consultationController");
const consultationSchema = require("../validators/consultationSchema");
 
// GET routes using query params
//router.get("/", consultation.getAllAppointments);
//router.get("/appointment", consultation.getAppointmentsByDoctorOnly); // ?registrationNumber=&appointmentId=
router.get("/getAppointments", consultation.getAppointmentsByDoctor); // ?registrationNumber=
 
// POST route using request body
router.post("/createConsultation", consultationSchema, consultation.createConsultation);
 
// PUT route using request body
router.put("/updateConsultation", consultation.updateConsultation);

router.get("/consultationHistory", consultation.getConsultationHistory); // ?patientId=
 
module.exports = router;    