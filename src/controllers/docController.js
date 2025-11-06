const Doctor = require("../models/doctorsSchema");
const { validationResult } = require("express-validator");

// GET /doctors?specialty=Cardiology&id=123
const getFilteredDoctors = async (req, res) => {
  const { specialty, id, date } = req.query;

  try {
    if (id) {
      // Fetch doctor by MongoDB _id or custom doctorId
      const doctor = await Doctor.findById(id); // or { doctorId: parseInt(id) }
      if (!doctor) return res.status(404).json({ message: "Doctor not found" });

      // Filter slots by date if provided
      let slots = doctor.calendar.flatMap(entry => {
        if (date && entry.date.toISOString().split("T")[0] !== date) return [];
        return entry.availableSlots.filter(slot => !slot.isBooked);
      });

      // return res.json({ doctorId: doctor._id, name: doctor.name, slots });
      return res.json(doctor);
    }

    // Specialty filter
    const query = specialty ? { specialty } : {};
    const doctors = await Doctor.find(query).select("name specialty email");
    if (!doctors.length) return res.status(404).json({ message: "No matching doctors found" });

    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /doctors/:id
const updateDoctor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const { name, specialty } = req.body;
    if (name) doctor.name = name;
    if (specialty) doctor.specialty = specialty;

    await doctor.save();
    res.json({ message: "Doctor updated successfully", doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update doctor" });
  }
};





//const Doctor = require("../models/doctorsSchema"); // Import your schema

// Create or update time slots
// const createTimeSlot = async (req, res) => {
//   try {
//     const doctorId = req.params.doctorId; // This should be MongoDB _id
//     const { calendar } = req.body;

//     if (!Array.isArray(calendar)) {
//       return res.status(400).json({ message: "Calendar must be an array" });
//     }

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     for (const entry of calendar) {
//       const { date, availableSlots } = entry;

//       // Check if date already exists in doctor's calendar
//       const existingDate = doctor.calendar.find(
//         (d) => d.date.toISOString() === new Date(date).toISOString()
//       );

//       if (existingDate) {
//         existingDate.availableSlots.push(...availableSlots);
//       } else {
//         doctor.calendar.push({ date, availableSlots });
//       }
//     }

//     await doctor.save();
//     return res.status(200).json({ message: "Slots updated",doctor});
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const createTimeSlot = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { calendar } = req.body;

    if (!Array.isArray(calendar)) {
      return res.status(400).json({ message: "Calendar must be an array" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const rejectedSlots = [];

    for (const entry of calendar) {
      const { date, availableSlots } = entry;
      const normalizedDate = new Date(date);

      const existingDate = doctor.calendar.find(
        (d) => d.date.toISOString() === normalizedDate.toISOString()
      );

      const normalizeSlot = (slot) => ({
        ...slot,
        start: new Date(slot.startTime).getTime(),
        end: new Date(slot.endTime).getTime(),
      });

      if (existingDate) {
        for (const slot of availableSlots) {
          const { startTime, endTime } = slot;
          const normalizedSlot = normalizeSlot(slot);

          // Duplicate check
          const isDuplicate = existingDate.availableSlots.some((s) => {
            return (
              new Date(s.startTime).getTime() === normalizedSlot.start &&
              new Date(s.endTime).getTime() === normalizedSlot.end
            );
          });
          if (isDuplicate) {
            rejectedSlots.push({ date, ...slot, reason: "Duplicate slot" });
            continue;
          }

          // Overlap check
          const isOverlapping = existingDate.availableSlots.some((s) => {
            const sStart = new Date(s.startTime).getTime();
            const sEnd = new Date(s.endTime).getTime();
            return (
              (normalizedSlot.start >= sStart && normalizedSlot.start < sEnd) ||
              (normalizedSlot.end > sStart && normalizedSlot.end <= sEnd) ||
              (normalizedSlot.start <= sStart && normalizedSlot.end >= sEnd)
            );
          });
          if (isOverlapping) {
            rejectedSlots.push({ date, ...slot, reason: "Overlapping slot" });
            continue;
          }

          existingDate.availableSlots.push(slot);
        }
      } else {
        const uniqueSlots = [];
        for (const slot of availableSlots) {
          const normalizedSlot = normalizeSlot(slot);

          const isDuplicate = uniqueSlots.some((s) => {
            return (
              new Date(s.startTime).getTime() === normalizedSlot.start &&
              new Date(s.endTime).getTime() === normalizedSlot.end
            );
          });
          if (isDuplicate) {
            rejectedSlots.push({ date, ...slot, reason: "Duplicate slot" });
            continue;
          }

          const isOverlapping = uniqueSlots.some((s) => {
            const sStart = new Date(s.startTime).getTime();
            const sEnd = new Date(s.endTime).getTime();
            return (
              (normalizedSlot.start >= sStart && normalizedSlot.start < sEnd) ||
              (normalizedSlot.end > sStart && normalizedSlot.end <= sEnd) ||
              (normalizedSlot.start <= sStart && normalizedSlot.end >= sEnd)
            );
          });
          if (isOverlapping) {
            rejectedSlots.push({ date, ...slot, reason: "Overlapping slot" });
            continue;
          }

          uniqueSlots.push(slot);
        }

        doctor.calendar.push({ date: normalizedDate, availableSlots: uniqueSlots });
      }
    }

    await doctor.save();
    return res.status(200).json({
      message: "Slots processed",
      doctor,
      rejectedSlots,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
// Delete a specific time slot
const deleteTimeSlot = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const { date, startTime, endTime } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const dateEntry = doctor.calendar.find(
      (entry) => entry.date.toISOString() === new Date(date).toISOString()
    );

    if (!dateEntry) {
      return res
        .status(404)
        .json({ message: `No slots found for date ${date}` });
    }

    const updatedSlots = dateEntry.availableSlots.filter(
      (slot) =>
        !(
          new Date(slot.startTime).toISOString() ===
            new Date(startTime).toISOString() &&
          new Date(slot.endTime).toISOString() ===
            new Date(endTime).toISOString()
        )
    );

    if (updatedSlots.length === dateEntry.availableSlots.length) {
      return res.status(404).json({
        message: `No matching slot found on ${date} for ${startTime} - ${endTime}`,
      });
    }

    if (updatedSlots.length === 0) {
      doctor.calendar = doctor.calendar.filter(
        (entry) => entry.date.toISOString() !== new Date(date).toISOString()
      );
    } else {
      dateEntry.availableSlots = updatedSlots;
    }

    await doctor.save();
    return res
      .status(200)
      .json({ message: "Time slot deleted successfully", doctor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getTimeSlot = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    // Find doctor by ID
    const doctor = await Doctor.findById(doctorId).select("calendar name specialty");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Flatten all available slots into a single array
    const slots = doctor.calendar.flatMap(entry =>
      entry.availableSlots.map(slot => ({
        date: entry.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: slot.isBooked
      }))
    );

    return res.status(200).json({
      slots
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  getFilteredDoctors,
  updateDoctor,
  createTimeSlot,
  deleteTimeSlot,
  getTimeSlot
};
