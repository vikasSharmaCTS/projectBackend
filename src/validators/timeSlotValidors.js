const { checkSchema } = require("express-validator");


const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; 


function isValidISODate(date) {
  return isoDateRegex.test(date);
}

function isValidTimeFormat(time) {
  return timeRegex.test(time);
}

function isFutureTime(date, time) {
  const now = new Date();
  const slotDateTime = new Date(`${date}T${time}:00`);
  return slotDateTime > now;
}

function isStartBeforeEnd(date, startTime, endTime) {
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);
  return start < end;
}


const createSlotSchema = checkSchema({
  calendar: {
    in: ['body'],
    custom: {
      options: (value) => {
        if (!Array.isArray(value)) {
          throw new Error('calendar must be an array');
        }

        for (const entry of value) {
          const { date, availableSlots } = entry;

          if (!date || !isValidISODate(date)) {
            throw new Error(`Invalid or missing date (YYYY-MM-DD): ${date}`);
          }

          if (!Array.isArray(availableSlots)) {
            throw new Error(`availableSlots for ${date} must be an array`);
          }

          for (const slot of availableSlots) {
            const { startTime, endTime } = slot;

            if (!startTime || !endTime) {
              throw new Error(`Each slot must have startTime and endTime for ${date}`);
            }

            if (!isValidTimeFormat(startTime)) {
              throw new Error(`Invalid startTime format (HH:MM) in ${date}: ${startTime}`);
            }

            if (!isValidTimeFormat(endTime)) {
              throw new Error(`Invalid endTime format (HH:MM) in ${date}: ${endTime}`);
            }

            if (!isStartBeforeEnd(date, startTime, endTime)) {
              throw new Error(`startTime must be earlier than endTime in ${date}`);
            }

            if (!isFutureTime(date, startTime) || !isFutureTime(date, endTime)) {
              throw new Error(`Both startTime and endTime must be in the future for ${date}`);
            }
          }
        }

        return true;
      },
    },
  },
});


const deleteSlotSchema = checkSchema({
  date: {
    in: ["body"],
    notEmpty: { errorMessage: "Date is required" },
    custom: {
      options: (value) => {
        if (!isValidISODate(value)) {
          throw new Error("Date must be in ISO format (YYYY-MM-DD)");
        }
        return true;
      },
    },
  },

  startTime: {
    in: ["body"],
    notEmpty: { errorMessage: "Start time is required" },
    custom: {
      options: (value) => {
        if (!isValidTimeFormat(value)) {
          throw new Error("Start time must be in HH:MM format");
        }
        return true;
      },
    },
  },

  endTime: {
    in: ["body"],
    notEmpty: { errorMessage: "End time is required" },
    custom: {
      options: (value, { req }) => {
        if (!isValidTimeFormat(value)) {
          throw new Error("End time must be in HH:MM format");
        }

        const start = req.body.startTime;
        const date = req.body.date;

        if (!start || !date) {
          throw new Error(
            "Date and start time must be provided before comparing"
          );
        }

        if (!isStartBeforeEnd(date, start, value)) {
          throw new Error("Start time must be earlier than end time");
        }

        if (!isFutureTime(date, start) || !isFutureTime(date, value)) {
          throw new Error("Both startTime and endTime must be in the future");
        }

        return true;
      },
    },
  },
});

module.exports = {
  createSlotSchema,
  deleteSlotSchema,
};
