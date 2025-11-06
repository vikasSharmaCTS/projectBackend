const mongoose = require('mongoose');
const Appointment = require('../models/appointmentSchema');
const Consultation = require('../models/consultationSchema');


exports.getPreviousAppointments = async (req, res) => {
  try {
    const today = new Date();
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patientId format' });
    }

    const previousAppointments = await Appointment.find({
      patientId,
      date: { $lt: today }
    })
      .populate('patientId', 'name emailId')
      .populate('doctorId', 'name specialty');

    res.json(previousAppointments);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request', error: error.message });
  }
};

exports.getPreviousAppointmentById = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const today = new Date();

    if (
      !mongoose.Types.ObjectId.isValid(patientId) ||
      !mongoose.Types.ObjectId.isValid(appointmentId)
    ) {
      return res.status(400).json({ message: 'Invalid patientId or appointmentId format' });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
      date: { $lt: today }
    })
      .populate('patientId', 'name emailId')
      .populate('doctorId', 'name specialty');

    if (!appointment) {
      return res.status(404).json({ error: 'Previous appointment not found' });
    }

    if (appointment.consultationId) {
      const consultation = await Consultation.findById(appointment.consultationId);
      if (consultation) {
        appointment._doc.consultation = consultation;
      }
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: 'Not Found', error: error.message });
  }
};