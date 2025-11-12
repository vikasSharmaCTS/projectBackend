const mongoose = require("mongoose");
const Consultation = require("../models/consultationSchema");
const Appointment = require("../models/appointmentSchema");
require("../models/patientSchema");

exports.getAllAppointments = async (req, res, next) => {
  try {
    const consultations = await Consultation.find()
      .populate("patientId")
      .populate("appointmentId");
    return res.status(200).json({ consultations });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
      //.json({ message: "Server error", error: error.message });
  }
};

exports.getAppointmentsByDoctorAndAppointmentId = async (req, res, next) => {
  try {
    const { registrationNumber, appointmentId } = req.query;
    if (!registrationNumber || !appointmentId) {
      return res
        .status(400)
        .json({ message: "registrationNumber and appointmentId are required" });
    }

    const consultations = await Consultation.find({
      registrationNumber,
      appointmentId,
    })
      .populate("patientId")
      .populate("appointmentId");

    return res.status(200).json({ consultations });
  } catch (err) {
    // console.error(error);
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.getAppointmentsByDoctor = async (req, res, next) => {
  try {
    const registrationNumber =
      req.params.registrationNumber || req.query.registrationNumber;
    if (!registrationNumber) {
      return res
        .status(400)
        .json({ message: "registrationNumber is required" });
    }

    const appointments = await Appointment.find({
      registrationNumber,
      status: "confirmed",
    })
      .populate("patientId", "name age gender")
      .sort({ date: 1, startTime: 1 });

    const filteredAppointments = appointments.map((app) => ({
      appointmentId: app._id,
      patentId: app.patientId._id,
      name: app.patientId.name,
      age: app.patientId.age,
      gender: app.patientId.gender,
      date: app.date,
    }));

    return res.status(200).json(filteredAppointments);
  } catch (err) {
   console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.getAppointmentsByDoctorOnly = async (req, res, next) => {
  try {
    const { registrationNumber } = req.query;
    if (!registrationNumber) {
      return res
        .status(400)
        .json({ message: "registrationNumber is required" });
    }

    const appointments = await Appointment.find({ registrationNumber })
      .populate("patientId")
      .populate("consultationId");

    return res.status(200).json({ appointments });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.createConsultation = async (req, res, next) => {
  try {
    const {
      registrationNumber,
      patientId,
      appointmentId,
      notes,
      prescription,
    } = req.body;

    if (!registrationNumber || !patientId || !appointmentId) {
      return res.status(400).json({
        message:
          "registrationNumber, patientId and appointmentId are required in request body",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(patientId) ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid patientId or appointmentId format" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "confirmed") {
      return res.status(400).json({
        message: "Consultation can only be created for confirmed appointments",
      });
    }

    // ensure appointment belongs to the patient
    if (appointment.patientId.toString() !== patientId) {
      return res.status(400).json({
        message: "Appointment does not belong to the provided patientId",
      });
    }

    // optional: ensure registrationNumber matches appointment (if stored)
    if (
      appointment.registrationNumber &&
      appointment.registrationNumber !== registrationNumber
    ) {
      return res.status(400).json({
        message:
          "registrationNumber does not match appointment's registrationNumber",
      });
    }

    const consultation = new Consultation({
      registrationNumber,
      patientId,
      appointmentId,
      notes: notes || "",
      prescription: prescription || "",
    });

    await consultation.save();

    appointment.consultationId = consultation._id;
    appointment.status = "completed";
    await appointment.save();

    return res
      .status(201)
      .json({ message: "Consultation created successfully", consultation });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.updateConsultation = async (req, res, next) => {
  try {
    const { consultationId, notes, prescription } = req.body;

    if (!consultationId) {
      return res.status(400).json({ message: "consultationId is required" });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (notes) consultation.notes = notes;
    if (prescription) consultation.prescription = prescription;
    consultation.updatedAt = Date.now();

    await consultation.save();

    return res
      .status(200)
      .json({ message: "Consultation updated successfully", consultation });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

exports.getConsultationHistory = async (req, res, next) => {
  try {
    const { registrationNumber } = req.query;
    if (registrationNumber) {
      const consultations = await Consultation.find({ registrationNumber })
        .populate("patientId")
        .populate("appointmentId")
        .sort({ createdAt: -1 });
 
      const simplifiedConsultations = consultations.map((consultation) => ({
        patientName: consultation.patientId?.name || "Unknown",
        date: consultation.appointmentId?.date || null,
        notes: consultation.notes,
        prescription: consultation.prescription,
      }));
 
      return res.status(200).json({ consultations: simplifiedConsultations });
    }
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
