const mongoose = require('mongoose');
const Doctor = require('../models/doctorsSchema');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');

const bookAppointment = async (req, res) => {
  try {
    console.log('Booking appointment with data:', req.body);

    const { patientId, registrationNumber, date, startTime, endTime } = req.body;

    // Validate patientId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patientId format' });
    }

    // Check patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    // Check doctor exists by registrationNumber
    const doctor = await Doctor.findOne({ registrationNumber });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Check if doctor's registration is still valid
    if (doctor.registrationValidUpto < new Date()) {
      return res.status(400).json({ message: 'Doctor registration has expired' });
    }

    // Find calendar entry for the given date
    const calendarEntry = doctor.calendar.find(
      entry => entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    if (!calendarEntry) return res.status(404).json({ message: 'No slots available on this date' });

    // Find slot using HH:mm format
    const slot = calendarEntry.availableSlots.find(s =>
      s.startTime === startTime && s.endTime === endTime && !s.isBooked
    );
    if (!slot) return res.status(400).json({ message: 'Requested slot is not available' });

    // Combine date + time for DB storage
    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // Check if patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      patientId,
      date: new Date(date),
      startTime,
      endTime,
      status: { $ne: 'canceled' }
    });
    if (existingAppointment) return res.status(400).json({ message: 'Patient already has an appointment at this time' });

    // Check if slot is already taken by another appointment
    const slotTaken = await Appointment.findOne({
      registrationNumber,
      date: new Date(date),
      startTime,
      endTime,
      status: { $ne: 'canceled' }
    });
    if (slotTaken) return res.status(400).json({ message: 'Requested slot is already booked' });

    // Create new appointment
    const newAppointment = await Appointment.create({
      patientId,
      registrationNumber,
      date: new Date(date),
      startTime,
      endTime,
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

module.exports = { bookAppointment };