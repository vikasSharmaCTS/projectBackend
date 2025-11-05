const mongoose = require('mongoose');
const Doctor = require('../models/doctorsSchema');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');

const bookAppointment = async (req, res) => {
  try {
    console.log('Booking appointment with data:', req.body, 'and query:', req.query);
    const { specialty } = req.query;
    // const { doctorId, date, startTime, endTime } = req.body;
    const { doctorId, date, startTime, endTime } = req.body;

    // Hardcoded patientId
    const patientId = "690b42a7e62b149a1e02a29a";

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid doctorId or patientId format' });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists with given specialty
    const doctor = await Doctor.findOne({ _id: doctorId, specialty });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found in this specialty' });
    }

    // Find calendar entry for the given date
    const calendarEntry = doctor.calendar.find(
      entry => entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    if (!calendarEntry) {
      return res.status(404).json({ message: 'No slots available on this date' });
    }

    // Find slot matching startTime and endTime
    const slot = calendarEntry.availableSlots.find(
      s =>
        s.startTime.getTime() === new Date(startTime).getTime() &&
        s.endTime.getTime() === new Date(endTime).getTime() &&
        !s.isBooked
    );
    if (!slot) {
      return res.status(400).json({ message: 'Requested slot is not available' });
    }

    // Check if patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      patientId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: { $ne: 'canceled' }
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Patient already has an appointment at this time' });
    }

    // Check if slot is already taken by another patient
    const slotTaken = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: { $ne: 'canceled' }
    });
    if (slotTaken) {
      return res.status(400).json({ message: 'Requested slot is already booked' });
    }

    // Create new appointment
    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'confirmed'
    });

    // Mark slot as booked
    slot.isBooked = true;
    await doctor.save();

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('patientId', 'name emailId')
      .populate('doctorId', 'name specialty');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

module.exports = { bookAppointment, getAppointmentById };