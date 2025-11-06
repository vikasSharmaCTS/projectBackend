const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Appointment = require("../models/appointmentSchema");
const Consultation = require("../models/consultationSchema");

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch appointments" });
  }
};

// Get appointments by doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  const doctorId = req.params.doctorId;
  try {
    const appointments = await Appointment.find({ doctorId });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch appointments for doctor" });
  }
};

// Get appointment by doctor and appointment ID
exports.getAppointmentsByDoctorAndAppointmentId = async (req, res) => {
  const doctorId = req.params.doctorId;
  const appointmentId = req.params.appointmentId;

  try {
    const appointment = await Appointment.findOne({ doctorId, _id: appointmentId });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to fetch appointment" });
  }
};

// Create consultation and link to appointment
exports.createConsultation = async (req, res) => {
  const doctorId = req.params.doctorId;
  const appointmentId = req.params.appointmentId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { notes, prescription } = req.body;

  try {
    // Find appointment
    const appointment = await Appointment.findOne({ doctorId, _id: appointmentId });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if consultation already exists
    const existing = await Consultation.findOne({ appointmentId });
    if (existing) {
      return res.status(409).json({ error: "Consultation already exists" });
    }

    // Create new consultation
    const newConsultation = await Consultation.create({
      doctorId,
      patientId: appointment.patientId,
      appointmentId,
      notes,
      prescription
    });

    // ✅ Attach consultationId to appointment and update status
    appointment.consultationId = newConsultation._id;
    appointment.status = "completed";
    await appointment.save();

    res.status(201).json({
      message: "Consultation saved successfully",
      consultation: newConsultation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save consultation" });
  }
};

// Update consultation
exports.updateConsultation = async (req, res) => {
  const doctorId = req.params.doctorId;
  const appointmentId = req.params.appointmentId;
  const { notes, prescription } = req.body;

  try {
    const consultation = await Consultation.findOne({
      doctorId: mongoose.Types.ObjectId(doctorId),
      appointmentId: mongoose.Types.ObjectId(appointmentId)
    });

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (notes !== undefined) consultation.notes = notes;
    if (prescription !== undefined) consultation.prescription = prescription;

    await consultation.save();
    res.json({ message: "Consultation updated successfully", consultation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update consultation" });
  }
};