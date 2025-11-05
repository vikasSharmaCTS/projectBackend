  const mongoose = require('mongoose');

  const patientSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30
    },

    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other'] 
    },

    age: {
      type: Number,
      required: true,
      min: 0
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Email must be in a valid format like name@gmail.com']
    },

    phoneNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'] 
    }
  }, { timestamps: true });

  module.exports = mongoose.model('Patient', patientSchema);
