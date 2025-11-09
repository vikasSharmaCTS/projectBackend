const mongoose = require("mongoose");
const Appointment = require("../models/appointmentSchema");
const Doctor = require("../models/doctorsSchema");

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointmentId format" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (appointment.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Only confirmed appointments can be cancelled." });
    }

    let doctor = null;
    if (appointment.registrationNumber) {
      doctor = await Doctor.findOne({
        registrationNumber: appointment.registrationNumber,
      });
    }
    if (!doctor && appointment.doctorId) {
      doctor = await Doctor.findById(appointment.doctorId);
    }

    if (doctor) {
      const calendarEntry = doctor.calendar.find(
        (entry) =>
          entry.date.toISOString().split("T")[0] ===
          appointment.date.toISOString().split("T")[0]
      );

      if (calendarEntry) {
        const slot = calendarEntry.availableSlots.find(
          (slot) =>
            slot.startTime === appointment.startTime &&
            slot.endTime === appointment.endTime
        );

        if (slot) {
          slot.isBooked = false;
          await doctor.save();
        }
      }
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully.", appointment });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updateTimeSlot = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, startTime, endTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointmentId format" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: `Cannot update ${appointment.status} appointments` });
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor availability not found" });
    }

    const oldEntry = doctor.calendar.find(
      (entry) =>
        entry.date.toISOString().split("T")[0] ===
        appointment.date.toISOString().split("T")[0]
    );
    if (oldEntry) {
      const oldSlot = oldEntry.availableSlots.find(
        (slot) =>
          slot.startTime.getTime() === appointment.startTime.getTime() &&
          slot.endTime.getTime() === appointment.endTime.getTime()
      );
      if (oldSlot) oldSlot.isBooked = false;
    }

    const newEntry = doctor.calendar.find(
      (entry) =>
        entry.date.toISOString().split("T")[0] ===
        new Date(date).toISOString().split("T")[0]
    );
    if (!newEntry) {
      return res
        .status(400)
        .json({ message: "No available slots for this date" });
    }

    const newSlot = newEntry.availableSlots.find(
      (slot) =>
        slot.startTime.getTime() === new Date(startTime).getTime() &&
        slot.endTime.getTime() === new Date(endTime).getTime() &&
        !slot.isBooked
    );
    if (!newSlot) {
      return res
        .status(400)
        .json({ message: "Requested time slot is not available" });
    }

    newSlot.isBooked = true;
    await doctor.save();

    appointment.date = new Date(date);
    appointment.startTime = new Date(startTime);
    appointment.endTime = new Date(endTime);
    await appointment.save();

    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
