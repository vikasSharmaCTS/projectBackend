const Doctor = require("../models/doctorsSchema");
const { validationResult } = require("express-validator");
const Appointments = require("../models/appointmentSchema");

// GET /doctors?specialty=Cardiology&id=123
const getFilteredDoctors = async (req, res, next) => {
  try {
    const { specialty, registrationNumber } = req.query;

    let query = {};

    if (specialty) {
      query.specialty = specialty;
    }
    if (registrationNumber) {
      query.registrationNumber = registrationNumber;
    }

    const doctors = await Doctor.find(Object.keys(query).length ? query : {});

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found" });
    }

    res.json(doctors);
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

// PUT /doctors/:id
const updateDoctor = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

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

const timeSlots = async (req, res, next) => {
  try {
    const registrationNumber = req.query.registrationNumber;
    const { calendar } = req.body;

    if (!Array.isArray(calendar)) {
      return res.status(400).json({ message: "Calendar must be an array" });
    }

    const rejectedSlots = [];

    for (const entry of calendar) {
      const { date, availableSlots } = entry;
      const dateObj = new Date(date);

      const doctor = await Doctor.findOne({ registrationNumber });

      let calendarEntry = doctor?.calendar.find(
        (c) => c.date.getTime() === dateObj.getTime()
      );
      let existingSlots = calendarEntry ? calendarEntry.availableSlots : [];

      const uniqueSlots = [];
      const seen = new Set();
      for (const slot of availableSlots) {
        const key = `${slot.startTime}-${slot.endTime}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueSlots.push(slot);
        }
      }

      for (const slot of uniqueSlots) {
        const { startTime, endTime } = slot;

        if (startTime >= endTime) {
          rejectedSlots.push({
            date,
            startTime,
            endTime,
            reason: "Invalid slot: startTime must be less than endTime",
          });
          continue;
        }

        const isOverlapping = existingSlots.some(
          (existing) =>
            startTime < existing.endTime && endTime > existing.startTime
        );

        if (isOverlapping) {
          rejectedSlots.push({
            date,
            startTime,
            endTime,
            reason: "Overlaps with an existing slot",
          });
          continue;
        }

        if (!calendarEntry) {
          await Doctor.updateOne(
            { registrationNumber },
            {
              $push: {
                calendar: {
                  date: dateObj,
                  availableSlots: [slot],
                },
              },
            }
          );
          calendarEntry = { date: dateObj, availableSlots: [slot] };
          existingSlots = calendarEntry.availableSlots;
        } else {
          await Doctor.updateOne(
            { registrationNumber, "calendar.date": dateObj },
            {
              $addToSet: { "calendar.$.availableSlots": slot },
            }
          );
          existingSlots.push(slot);
        }
      }
    }

    return res.status(200).json({ message: "Slots processed successfully", rejectedSlots });
  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

const editSlots = async (req, res, next) => {
  try {
    const { registrationNumber } = req.query;
    const { previousSlot, newSlot } = req.body;

    if (!registrationNumber || !previousSlot || !newSlot) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prevDate = new Date(previousSlot.date);
    const newDate = new Date(newSlot.date);

    // Step 1: Remove previous slot from its date
    await Doctor.updateOne(
      { registrationNumber, "calendar.date": prevDate },
      {
        $pull: {
          "calendar.$.availableSlots": {
            startTime: previousSlot.startTime,
            endTime: previousSlot.endTime,
          },
        },
      }
    );

    // Step 2: Update appointments linked to previous slot
    const appointmentUpdate = await Appointments.updateMany(
      {
        registrationNumber,
        date: prevDate,
        startTime: previousSlot.startTime,
        endTime: previousSlot.endTime,
        status: { $ne: "cancelled" },
      },
      {
        $set: {
          date: newDate,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        },
      }
    );

    // Step 3: Add new slot to doctor's calendar
    if (previousSlot.date === newSlot.date) {
      // Same date: just add new time slot
      await Doctor.updateOne(
        { registrationNumber, "calendar.date": newDate },
        {
          $addToSet: {
            "calendar.$.availableSlots": {
              startTime: newSlot.startTime,
              endTime: newSlot.endTime,
            },
          },
        }
      );
    } else {
      // Date changed: check if new date exists
      const existingDate = await Doctor.findOne({
        registrationNumber,
        "calendar.date": newDate,
      });

      if (existingDate) {
        // Add new slot to existing date
        await Doctor.updateOne(
          { registrationNumber, "calendar.date": newDate },
          {
            $addToSet: {
              "calendar.$.availableSlots": {
                startTime: newSlot.startTime,
                endTime: newSlot.endTime,
              },
            },
          }
        );
      } else {
        // Create new date with slot
        await Doctor.updateOne(
          { registrationNumber },
          {
            $push: {
              calendar: {
                date: newDate,
                availableSlots: [
                  { startTime: newSlot.startTime, endTime: newSlot.endTime },
                ],
              },
            },
          }
        );
      }
    }

    return res.status(200).json({ message: "Slot updated successfully" });
  } catch (err) {
     console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

const deleteTimeSlot = async (req, res, next) => {
  try {
    const { registrationNumber } = req.query;
    const { date, startTime, endTime } = req.body;

    if (!registrationNumber || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const targetDate = new Date(date);

    // Step 1: Remove the slot from the doctor's calendar
    const result = await Doctor.updateOne(
      { registrationNumber, "calendar.date": targetDate },
      {
        $pull: {
          "calendar.$.availableSlots": { startTime, endTime },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: `No matching slot found on ${date}` });
    }

    return res.status(200).json({ message: "Slot deleted successfully" });
  } catch (err) {
     console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

const getTimeSlot = async (req, res, next) => {
  try {
    const { registrationNumber } = req.query; 

    if (!registrationNumber) {
      return res
        .status(400)
        .json({ message: "registrationNumber is required" });
    }

    // Find doctor by registrationNumber
    const doctor = await Doctor.findOne({ registrationNumber }).select(
      "calendar name specialty"
    );

    // Step 3: Remove the date if no slots remain
    await Doctor.updateOne(
      { registrationNumber },
      {
        $pull: {
          calendar: {
            date: targetDate,
            availableSlots: { $size: 0 }, // Remove if slots array is empty
          },
        },
      }
    );

    return res.status(200).json({ slots });
  } catch (err) {
 console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};

module.exports = {
  getFilteredDoctors,
  updateDoctor,
  timeSlots,
  deleteTimeSlot,
  getTimeSlot,
  editSlots,
};
