const Consultation = require("../models/consultationSchema");
const Appointment = require("../models/appointmentSchema");

exports.getAllAppointments = async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate("patientId")
      .populate("appointmentId");
    return res.status(200).json({ consultations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAppointmentsByDoctorAndAppointmentId = async (req, res) => {
  try {
    const { registrationNumber, appointmentId } = req.query;
    if (!registrationNumber || !appointmentId) {
      return res.status(400).json({ message: "registrationNumber and appointmentId are required" });
    }

    const consultations = await Consultation.find({
      registrationNumber,
      appointmentId
    }).populate("patientId").populate("appointmentId");

    return res.status(200).json({ consultations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { registrationNumber } = req.query;
    if (!registrationNumber) {
      return res.status(400).json({ message: "registrationNumber is required" });
    }

    const consultations = await Consultation.find({ registrationNumber })
      .populate("patientId")
      .populate("appointmentId");

    return res.status(200).json({ consultations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createConsultation = async (req, res) => {
  try {
    const { registrationNumber, patientId, appointmentId, notes, prescription } = req.body;

    if (!registrationNumber || !patientId || !appointmentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (appointment.status !== "confirmed") {
      return res.status(400).json({ message: "Consultation can only be created for confirmed appointments" });
    }

    const consultation = new Consultation({
      registrationNumber,
      patientId,
      appointmentId,
      notes: notes || "",
      prescription: prescription || ""
    });

    await consultation.save();

    appointment.consultationId = consultation._id;
    appointment.status = "completed";
    await appointment.save();

    return res.status(201).json({ message: "Consultation created successfully", consultation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateConsultation = async (req, res) => {
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

    return res.status(200).json({ message: "Consultation updated successfully", consultation });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};