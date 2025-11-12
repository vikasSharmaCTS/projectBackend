const express = require("express");
const router = express.Router();
const consultation = require("../controllers/consultationController");
const consultationSchema = require("../validators/consultationSchema");
 

router.get("/appointment", consultation.getAppointmentsByDoctorOnly); // ?registrationNumber=&appointmentId=
router.get("/getAppointments", consultation.getAppointmentsByDoctor); // ?registrationNumber=
 
router.post("/createConsultation", consultationSchema, consultation.createConsultation); // for doctor
 

router.put("/updateConsultation", consultation.updateConsultation);

router.get("/consultationHistory", consultation.getConsultationHistory); // ?patientId=
//for doctor
 
module.exports = router;    