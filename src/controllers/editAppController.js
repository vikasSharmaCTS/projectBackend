const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
 
const filePath = path.join(__dirname, '../data/appointments.json');
const availabilityPath = path.join(__dirname, '../data/doctors.json');
 
 
exports.cancelAppointment = (req, res) => {
  const appointments = JSON.parse(fs.readFileSync(filePath));
  const appointmentId = req.params.appointmentId;
 
  const appt = appointments.find(a => a.appointmentId === appointmentId);
 
  if (!appt) {
    return res.status(404).json({ message: 'Appointment not found.' });
  }
 
  if (appt.status !== 'confirmed') {
    return res.status(400).json({ message: 'Only confirmed appointments can be cancelled.' });
  }
 
  appt.status = 'cancelled';
 
  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));
  res.json({ message: 'Appointment cancelled successfully.', appointment: appt });
}
 
 
exports.updateTimeSlot = (req, res) => {
  
  const  appointmentId  = parseInt(req.params.appointmentId);
  const { date, startTime, endTime } = req.body;
 
  const appointments = JSON.parse(fs.readFileSync(filePath));
  const availability = JSON.parse(fs.readFileSync(availabilityPath));
 
  const index = appointments.findIndex(a => a.appointmentId === appointmentId);
  if (index === -1) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
 
  const appointment = appointments[index];
  if (appointment.status !== 'confirmed') {
    return res.status(400).json({ message: `Cannot update ${appointment.status} appointments` });
  }
 
  const doctor = availability.find(d => d.doctorId === appointment.doctorId);
  if (!doctor) {
    return res.status(404).json({ message: 'Doctor availability not found' });
  }
 
  const slotsForDate = doctor.availableSlots[date];
  if (!slotsForDate || slotsForDate.length === 0) {
    return res.status(400).json({ message: 'No available slots for this date' });
  }
 
  const isSlotAvailable = slotsForDate.some(slot =>
    slot.startTime === startTime && slot.endTime === endTime
  );
 
  if (!isSlotAvailable) {
    return res.status(400).json({ message: 'Requested time slot is not available for this doctor on that date' });
  }
 
  appointment.date = date;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
 
  fs.writeFileSync(filePath, JSON.stringify(appointments, null, 2));
  res.json({ message: 'Appointment updated successfully', appointment });
};