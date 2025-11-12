const express = require("express");
const router = express.Router();
const consultation = require("../controllers/consultationController");
const consultationSchema = require("../validators/consultationSchema");
const { authorize } = require("../middleware/authorize");
 
 
router.get("/appointment", consultation.getAppointmentsByDoctorOnly); // ?registrationNumber=&appointmentId=
router.get("/getAppointments", consultation.getAppointmentsByDoctor); // ?registrationNumber=
 
// POST route using request body
router.post("/createConsultation",  authorize(["Doctor"]), consultationSchema, consultation.createConsultation); // for doctor
 
// PUT route using request body
router.put("/updateConsultation", authorize(["Doctor"]), consultation.updateConsultation);
 
router.get("/consultationHistory", authorize(["Doctor"]),consultation.getConsultationHistory); // ?patientId=
//for doctor
 
module.exports = router;    
 