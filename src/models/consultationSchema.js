const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      index: true 
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointments",
      required: true,
      unique: true 
    },
    notes: {
      type: String,
      default: ""
    },
    prescription: {
      type: String,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Consultation", consultationSchema);