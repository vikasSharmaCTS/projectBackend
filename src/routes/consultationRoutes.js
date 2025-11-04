const express = require("express");
const router = express.Router();
const consultation = require("../controllers/consultationController");
const consultationSchema = require("../validators/consultationSchema");

router.get("/", consultation.getAllAppointments);
router.get("/:doctorId/:appointmentId", consultation.getAppointmentsByDoctorAndAppointmentId);
router.get("/:doctorId", consultation.getAppointmentsByDoctor);

router.post("/:doctorId/:appointmentId/consultation", consultationSchema, consultation.createConsultation);
router.put("/:doctorId/:appointmentId/consultation", consultation.updateConsultation);

module.exports = router;
