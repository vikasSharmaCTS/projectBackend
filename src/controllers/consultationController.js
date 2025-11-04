const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Appointment = require("../models/appointmentSchema");
const Consultation = require("../models/consultationSchema");

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch appointments" });
  }
};

exports.getAppointmentsByDoctor = async (req, res) => {
  const doctorId = req.params.doctorId;
  try {
    const appointments = await Appointment.find({ doctorId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch appointments for doctor" });
  }
};

exports.getAppointmentsByDoctorAndAppointmentId = async (req, res) => {
  const doctorId = req.params.doctorId;
  const appointmentId = req.params.appointmentId;

  try {
    const appointment = await Appointment.findOne({
      doctorId,
      _id: appointmentId
    });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Unable to fetch appointment" });
  }
};

exports.createConsultation = async (req, res) => {
  const doctorId = req.params.doctorId;
  const appointmentId = req.params.appointmentId;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { notes, prescription } = req.body;

  try {
    const appointment = await Appointment.findOne({
      doctorId,
      _id: appointmentId
    });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const existing = await Consultation.findOne({ appointmentId });
    if (existing) {
      return res.status(409).json({ error: "Consultation already exists" });
    }

    const newConsultation = new Consultation({
      doctorId,
      patientId: appointment.patientId,
      appointmentId,
      notes,
      prescription
    });

    await newConsultation.save();
    res.status(201).json({
      message: "Consultation saved successfully",
      consultation: newConsultation
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to save consultation" });
  }
};

exports.updateConsultation = async (req, res) => {
  const doctorId = req.params.doctorId;
  const appointmentId = req.params.appointmentId;
  const { notes, prescription } = req.body;

  try {
    const consultation = await Consultation.findOne({ doctorId, appointmentId });
    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (notes !== undefined) consultation.notes = notes;
    if (prescription !== undefined) consultation.prescription = prescription;

    await consultation.save();
    res.json({ message: "Consultation updated successfully", consultation });
  } catch (err) {
    res.status(500).json({ error: "Failed to update consultation" });
  }
};
