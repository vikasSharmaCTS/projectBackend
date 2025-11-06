const mongoose = require('mongoose');
const Doctor = require('../models/doctorsSchema');
const Patient = require('../models/patientSchema');
const Appointment = require('../models/appointmentSchema');
const { get } = require('http');

const bookAppointment = async (req, res) => {
  try {
    console.log('Booking appointment with data:', req.body);

    const { doctorId, patientId, date, startTime, endTime } = req.body;

    //const patientId = "690b42a7e62b149a1e02a29a";

    
    if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid doctorId or patientId format' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const calendarEntry = doctor.calendar.find(
      entry => entry.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    if (!calendarEntry) {
      return res.status(404).json({ message: 'No slots available on this date' });
    }

    // const slot = calendarEntry.availableSlots.find(
    //   s =>
    //     s.startTime.getTime() === new Date(startTime).getTime() &&
    //     s.endTime.getTime() === new Date(endTime).getTime() &&
    //     !s.isBooked
    // );
    const slot = calendarEntry.availableSlots.find(s => {
  const slotStart = s.startTime.toISOString().slice(11, 16); // HH:mm
  const slotEnd = s.endTime.toISOString().slice(11, 16);
  const reqStart = new Date(startTime).toISOString().slice(11, 16);
  const reqEnd = new Date(endTime).toISOString().slice(11, 16);
  return slotStart === reqStart && slotEnd === reqEnd && !s.isBooked;
});
    if (!slot) {
      return res.status(400).json({ message: 'Requested slot is not available' });
    }

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

module.exports = { bookAppointment };