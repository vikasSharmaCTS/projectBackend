const fs = require('fs');
const path = require('path');
 
const filePath = path.join(__dirname, '../data/appointments.json');
 
const consultationsPath = path.join(__dirname, '../data/consultations.json');
 
exports.getPreviousAppointments = (req, res) => {
  const appointments = JSON.parse(fs.readFileSync(filePath));
  const today = new Date().toISOString().split('T')[0];
 
  const previous = appointments.filter(appt => appt.date < today)
  res.json(previous);
};
exports.getPreviousAppointmentById = (req, res) => {
  const appointments = JSON.parse(fs.readFileSync(filePath));
  const consultations = JSON.parse(fs.readFileSync(consultationsPath));
  const today = new Date().toISOString().split('T')[0];
  const { appointmentId } = req.params;
 
  const appointment = appointments.find(appt => appt.appointmentId === appointmentId && appt.date < today);
 
  if (!appointment) {
    return res.status(404).json({ error: 'Previous appointment not found' });
  }
 
  if (appointment.consultationId) {
    const consultation = consultations.find(c => c.id === appointment.consultationId);
    if (consultation) {
      appointment.consultation = consultation;
    }
  }
 
  res.json(appointment);
};
 