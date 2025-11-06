const express = require("express");
const router = express.Router();
const consultation = require("../controllers/consultationController");
const consultationSchema = require("../validators/consultationSchema");

router.get("/", consultation.getAllAppointments);
router.get("/:doctorId/:appointmentId", consultation.getAppointmentsByDoctorAndAppointmentId);
router.get("/:doctorId", consultation.getAppointmentsByDoctor);

router.post("/:doctorId/:appointmentId/createConsultation", consultationSchema, consultation.createConsultation);
router.put("/:doctorId/:appointmentId/updateConsultation", consultation.updateConsultation);

module.exports = router;
