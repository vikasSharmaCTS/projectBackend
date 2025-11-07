const mongoose = require('mongoose');
const Appointment = require('../models/appointmentSchema');
const Consultation = require('../models/consultationSchema');

exports.getPreviousAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patientId format' });
    }

    const previousAppointments = await Appointment.find({
      patientId: new mongoose.Types.ObjectId(patientId),
      date: { $lt: new Date() } // Only past appointments
    }).sort({ date: -1 });

    if (!previousAppointments.length) {
      return res.status(404).json({ message: 'No previous appointments found' });
    }

    const formatted = previousAppointments.map(app => ({
      id: app._id.toString(),
      patientId: app.patientId.toString(),
      registrationNumber: app.registrationNumber,
      date: app.date.toISOString().split('T')[0],
      startTime: app.startTime,
      endTime: app.endTime,
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// ✅ Get a specific previous appointment by ID
exports.getPreviousAppointmentById = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(patientId) ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      return res.status(400).json({ message: 'Invalid patientId or appointmentId format' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: new mongoose.Types.ObjectId(patientId),
      date: { $lt: new Date() }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Previous appointment not found' });
    }

    // If consultation exists, attach it
    let consultation = null;
    if (appointment.consultationId) {
      consultation = await Consultation.findById(appointment.consultationId);
    }

    const formatted = {
      id: appointment._id.toString(),
      patientId: appointment.patientId.toString(),
      registrationNumber: appointment.registrationNumber,
      date: appointment.date.toISOString().split('T')[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      consultation: consultation || null,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};