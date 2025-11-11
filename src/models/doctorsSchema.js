const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[A-Z0-9]{6,12}$/,
        "Registration number must be 6-12 characters, alphanumeric uppercase",
      ],
    },

    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@doctor\.com$/,
        "Email must be in the format name@doctor.com",
      ],
    },

    specialty: {
      type: String,
      required: true,
      enum: [
        "Cardiology",
        "Dermatology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "General Medicine",
      ],
    },

    registrationValidUpto: {
      type: Date,
      required: true,
    },

    calendar: [
      {
        _id: false, // ✅ Disable _id for calendar entries
        date: { type: Date, required: true },
        availableSlots: [
          {
            _id: false, // ✅ Disable _id for slots
            startTime: { type: String, required: true },
            endTime: {
              type: String,
              required: true,
              validate: {
                validator: function (value) {
                  return this.startTime && value > this.startTime;
                },
                message: "End time must be greater than start time",
              },
            },
            isBooked: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
