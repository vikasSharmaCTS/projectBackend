const fs = require("fs");
const path = require("path");
const doctors = require("../data/doctors.json");
const doctorsFile = path.join(__dirname, "../data/doctors.json");
const { validationResult } = require("express-validator");

const getFilteredDoctors = (req, res) => {
  const { specialty, id } = req.query;
  let filteredDoctors = doctors;

  if (specialty) {
    filteredDoctors = filteredDoctors.filter(
      (doc) => doc.specialty.toLowerCase() === specialty.toLowerCase()
    );
  }

  if (id) {
    filteredDoctors = filteredDoctors.filter(
      (doc) => doc.doctorId === parseInt(id)
    );
  }

  if ((specialty || id) && filteredDoctors.length === 0) {
    return res.status(404).json({ message: "No matching doctors found" });
  }

  res.json(filteredDoctors);
};

const updateDoctor = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const doctorId = parseInt(req.params.id);
  const { name, specialty } = req.body;

  const doctor = doctors.find((doc) => doc.doctorId === doctorId);
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  if (name) {
    doctor.name = name;
  }
  if (specialty) {
    doctor.specialty = specialty;
  }

  try {
    fs.writeFileSync(doctorsFile, JSON.stringify(doctors, null, 2));
    res.json({ message: "Doctor updated successfully", doctor });
  } catch (err) {
    console.error("Error writing to doctors file:", err);
    res.status(500).json({ message: "Failed to update doctor" });
  }
};

// const createTimeSlot = (req, res) => {
//   const doctorId = parseInt(req.params.doctorId);
//   const { availableSlots } = req.body;

//   const doctor = doctors.find(d => d.doctorId === doctorId);
//   if (!doctor) {
//     return res.status(404).json({ message: 'Doctor not found' });
//   }

//   for (const date in availableSlots) {
//     if (!doctor.availableSlots[date]) {
//       doctor.availableSlots[date] = availableSlots[date];
//     } else {
//       doctor.availableSlots[date] = [
//         ...doctor.availableSlots[date],
//         ...availableSlots[date]
//       ];
//     }
//   }

//   fs.writeFileSync(doctorsFile, JSON.stringify(doctors, null, 2), 'utf-8');

//   return res.status(200).json({ message: 'Time slots updated successfully', doctor });
// };

// const deleteTimeSlot = (req, res) => {
//   const doctorId = parseInt(req.params.doctorId);
//   const { date, startTime, endTime } = req.body;

//   const doctor = doctors.find(d => d.doctorId === doctorId);
//   if (!doctor) {
//     return res.status(404).json({ message: 'Doctor not found' });
//   }

//   const slotsOnDate = doctor.availableSlots[date];
//   if (!slotsOnDate || slotsOnDate.length === 0) {
//     return res.status(404).json({ message: `No slots found for date ${date}` });
//   }

//   const updatedSlots = slotsOnDate.filter(slot =>
//     !(slot.startTime === startTime && slot.endTime === endTime)
//   );

//   if (updatedSlots.length === slotsOnDate.length) {
//     return res.status(404).json({
//       message: `No matching slot found on ${date} for ${startTime} - ${endTime}`
//     });
//   }

//   if (updatedSlots.length === 0) {
//     delete doctor.availableSlots[date];
//   } else {
//     doctor.availableSlots[date] = updatedSlots;
//   }

//   fs.writeFileSync(doctorsFile, JSON.stringify(doctors, null, 2), 'utf-8');

//   return res.status(200).json({ message: 'Time slot deleted successfully', doctor });
// };

// const createTimeSlot = (req, res) => {
//   const doctorId = parseInt(req.params.doctorId);
//   const { calendar } = req.body;

//   if (!Array.isArray(calendar)) {
//     return res.status(400).json({ message: 'Calendar must be an array' });
//   }

//   const doctors = JSON.parse(fs.readFileSync(doctorsFile, 'utf-8'));
//   const doctor = doctors.find(d => d.doctorId === doctorId);

//   if (!doctor) {
//     return res.status(404).json({ message: 'Doctor not found' });
//   }

//   if (!doctor.calendar) doctor.calendar = [];

//   for (const entry of calendar) {
//     const { date, availableSlots } = entry;
//     const existing = doctor.calendar.find(d => d.date === date);

//     if (existing) {
//       existing.availableSlots = [...existing.availableSlots, ...availableSlots];
//     } else {
//       doctor.calendar.push({ date, availableSlots });
//     }
//   }

//   fs.writeFileSync(doctorsFile, JSON.stringify(doctors, null, 2), 'utf-8');
//   return res.status(200).json({ message: 'Slots updated', doctor });
// };

// const deleteTimeSlot = (req, res) => {
//   const doctorId = parseInt(req.params.doctorId);
//   const { date, startTime, endTime } = req.body;

//   // Load doctors
//   const doctors = JSON.parse(fs.readFileSync(doctorsFile, 'utf-8'));
//   const doctor = doctors.find(d => d.doctorId === doctorId);

//   if (!doctor) {
//     return res.status(404).json({ message: 'Doctor not found' });
//   }

//   if (!doctor.calendar || doctor.calendar.length === 0) {
//     return res.status(404).json({ message: 'No calendar found for this doctor' });
//   }

//   // Find the date entry
//   const dateEntry = doctor.calendar.find(entry => entry.date === date);
//   if (!dateEntry) {
//     return res.status(404).json({ message: `No slots found for date ${date}` });
//   }

//   // Filter out the matching slot
//   const updatedSlots = dateEntry.availableSlots.filter(slot =>
//     !(slot.startTime === startTime && slot.endTime === endTime)
//   );

//   if (updatedSlots.length === dateEntry.availableSlots.length) {
//     return res.status(404).json({
//       message: `No matching slot found on ${date} for ${startTime} - ${endTime}`
//     });
//   }

//   // Update or remove the date entry
//   if (updatedSlots.length === 0) {
//     doctor.calendar = doctor.calendar.filter(entry => entry.date !== date);
//   } else {
//     dateEntry.availableSlots = updatedSlots;
//   }

//   fs.writeFileSync(doctorsFile, JSON.stringify(doctors, null, 2), 'utf-8');

//   return res.status(200).json({ message: 'Time slot deleted successfully', doctor });
// };

const Doctor = require("../models/doctorsSchema"); // Import your schema

// Create or update time slots
const createTimeSlot = async (req, res) => {
  try {
    const doctorId = req.params.doctorId; // This should be MongoDB _id
    const { calendar } = req.body;

    if (!Array.isArray(calendar)) {
      return res.status(400).json({ message: "Calendar must be an array" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    for (const entry of calendar) {
      const { date, availableSlots } = entry;

      // Check if date already exists in doctor's calendar
      const existingDate = doctor.calendar.find(
        (d) => d.date.toISOString() === new Date(date).toISOString()
      );

      if (existingDate) {
        existingDate.availableSlots.push(...availableSlots);
      } else {
        doctor.calendar.push({ date, availableSlots });
      }
    }

    await doctor.save();
    return res.status(200).json({ message: "Slots updated",doctor});
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
