const fs = require('fs');
const path = require('path');
const doctors = require('../data/doctors.json');
const patients = require('../data/patient.json');

const appointmentsFile = path.join(__dirname, '../data/appointments.json');

const bookAppointment = (req, res) => {
  
  const { specialty, id } = req.params;
  const { patientId, date, startTime, endTime } = req.body;
  const doctorId = parseInt(id, 10); 

  const patientExists = patients.some(p => p.patientId === patientId);
  if (!patientExists) {
    return res.status(404).json({ 
      status: '404',
      message: 'Patient not found'
    });
  }

  const doctor = doctors.find(
    doc =>
      doc.specialty.toLowerCase() === specialty.toLowerCase() &&
      doc.doctorId === doctorId
  );

  if (!doctor) {
    return res.status(404).json({
      status: '404',
      message: 'Doctor not found in this specialty'
    });
  }

  const slots = doctor.availableSlots[date];
  if (!slots) {
    return res.status(404).json({
      status: '404',
      message: 'No slots available on this date'
    });
  }

  const slot = slots.find(s => s.startTime === startTime && s.endTime === endTime);

  if (!slot) {
    return res.status(400).json({
      status: '400',
      message: 'Requested slot is not available'
    });
  }

  let appointments = [];
  try {
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    appointments = JSON.parse(data);
  } catch (err) {
    console.error('Error reading appointments file:', err);

  }

  const alreadyBooked = appointments.find(
    a =>
      a.patientId === patientId &&
      a.date === date &&
      a.startTime === startTime &&
      a.endTime === endTime &&
      a.status !== 'cancelled'
  );
  if (alreadyBooked) {
    return res.status(400).json({
      status: '400',
      message: 'Patient already has an appointment at this time'
    });
  }

  const slotTaken = appointments.some(
    a =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.startTime === startTime &&
      a.endTime === endTime &&
      a.status !== 'cancelled'
  );
  if (slotTaken) {
    return res.status(400).json({
      status: '400',
      message: 'Requested slot is already booked'
    });
  }

  const appointmentId = appointments.length + 1;

  const newAppointment = {
    appointmentId,
    patientId,
    doctorId,
    date,
    startTime,
    endTime,
    status: 'confirmed'
  };

  appointments.push(newAppointment);

  try {
    fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
  } catch (err) {
    console.error('Error writing to appointments file:', err);
    return res.status(500).json({ message: 'Failed to save appointment' });
  }

  
res.status(201).json({
  message: 'Appointment booked successfully',
  appointment: newAppointment
});

};

const getAppointmentById = (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10); 

  let appointments = [];
  try {
    const data = fs.readFileSync(appointmentsFile, 'utf8');
    appointments = JSON.parse(data);
  } catch (err) {
    console.error('Error reading appointments file:', err);
    return res.status(500).json({ message: 'Failed to read appointments' });
  }

  const appointment = appointments.find(app => app.appointmentId === appointmentId);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  res.json(appointment);
};

module.exports = { bookAppointment, getAppointmentById };