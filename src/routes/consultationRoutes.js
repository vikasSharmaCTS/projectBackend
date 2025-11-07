const express = require("express");
const router = express.Router();
const consultation = require("../controllers/consultationController");
const consultationSchema = require("../validators/consultationSchema");

// GET routes using query params
router.get("/", consultation.getAllAppointments);
router.get("/appointment", consultation.getAppointmentsByDoctorAndAppointmentId); // ?registrationNumber=&appointmentId=
router.get("/doctor", consultation.getAppointmentsByDoctor); // ?registrationNumber=

// POST route using request body
router.post("/createConsultation", consultationSchema, consultation.createConsultation);

// PUT route using request body
router.put("/updateConsultation", consultation.updateConsultation);

module.exports = router;