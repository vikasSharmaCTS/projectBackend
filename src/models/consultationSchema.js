const mongoose = require('mongoose');
 
const consultationSchema = new mongoose.Schema({
 
  //consultaion id  will be the object id
 
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  notes: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  prescription: {
    type: String, // stores file path or URL
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  }
}, { timestamps: true });
 
module.exports = mongoose.model('Consultation', consultationSchema, 'Consultations');
 
 