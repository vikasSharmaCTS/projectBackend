
// const { checkSchema } = require('express-validator');

// const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
// const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// function isValidTimeFormat(time) {
//   return timeRegex.test(time);
// }

// function isStartBeforeEnd(startTime, endTime) {
//   const start = new Date(`1970-01-01T${startTime}:00Z`);
//   const end = new Date(`1970-01-01T${endTime}:00Z`);
//   return start < end;
// }

// const createSlotSchema = checkSchema({
//   'calendar': {
//     in: ['body'],
//     custom: {
//       options: value => {
//         if (!Array.isArray(value)) {
//           throw new Error('calendar must be an array');
//         }

//         for (const entry of value) {
//           const { date, availableSlots } = entry;

//           if (!date || !dateRegex.test(date)) {
//             throw new Error(`Invalid or missing date: ${date}`);
//           }

//           if (!Array.isArray(availableSlots)) {
//             throw new Error(`availableSlots for ${date} must be an array`);
//           }

//           for (const slot of availableSlots) {
//             const { startTime, endTime } = slot;

//             if (!startTime || !endTime) {
//               throw new Error(`Each slot must have startTime and endTime for ${date}`);
//             }

//             if (!isValidTimeFormat(startTime)) {
//               throw new Error(`Invalid startTime format in ${date}: ${startTime}`);
//             }

//             if (!isValidTimeFormat(endTime)) {
//               throw new Error(`Invalid endTime format in ${date}: ${endTime}`);
//             }

//             if (!isStartBeforeEnd(startTime, endTime)) {
//               throw new Error(`startTime must be earlier than endTime in ${date}`);
//             }
//           }
//         }

//         return true;
//       }
//     }
//   }
// });

// const deleteSlotSchema = checkSchema({
//   date: {
//     in: ['body'],
//     notEmpty: { errorMessage: 'Date is required' },
//     custom: {
//       options: value => {
//         if (!dateRegex.test(value)) {
//           throw new Error('Date must be in YYYY-MM-DD format');
//         }
//         return true;
//       }
//     }
//   },

//   startTime: {
//     in: ['body'],
//     notEmpty: { errorMessage: 'Start time is required' },
//     custom: {
//       options: value => {
//         if (!isValidTimeFormat(value)) {
//           throw new Error('Start time must be in HH:mm format');
//         }
//         return true;
//       }
//     }
//   },

//   endTime: {
//     in: ['body'],
//     notEmpty: { errorMessage: 'End time is required' },
//     custom: {
//       options: (value, { req }) => {
//         if (!isValidTimeFormat(value)) {
//           throw new Error('End time must be in HH:mm format');
//         }

//         const start = req.body.startTime;
//         if (!start) {
//           throw new Error('Start time must be provided before comparing');
//         }

//         if (!isStartBeforeEnd(start, value)) {
//           throw new Error('Start time must be earlier than end time');
//         }

//         return true;
//       }
//     }
//   }
// });

// module.exports = {
//   createSlotSchema,
//   deleteSlotSchema
// };


const { checkSchema } = require('express-validator');

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/; // For calendar date
const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;

function isValidISODate(date) {
  return isoDateRegex.test(date);
}

function isValidISODateTime(dateTime) {
  return isoDateTimeRegex.test(dateTime);
}

function isStartBeforeEnd(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return start < end;
}

const createSlotSchema = checkSchema({
  'calendar': {
    in: ['body'],
    custom: {
      options: value => {
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

            if (!isValidISODateTime(startTime)) {
              throw new Error(`Invalid startTime format in ${date}: ${startTime}`);
            }

            if (!isValidISODateTime(endTime)) {
              throw new Error(`Invalid endTime format in ${date}: ${endTime}`);
            }

            if (!isStartBeforeEnd(startTime, endTime)) {
              throw new Error(`startTime must be earlier than endTime in ${date}`);
            }
          }
        }

        return true;
      }
    }
  }
});

const deleteSlotSchema = checkSchema({
  date: {
    in: ['body'],
    notEmpty: { errorMessage: 'Date is required' },
    // custom: {
    //   options: value => {
    //     if (!isValidISODateTime(value)) {
    //       throw new Error('Date must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
    //     }
    //     return true;
    //   }
    // }
  },

  startTime: {
    in: ['body'],
    notEmpty: { errorMessage: 'Start time is required' },
    custom: {
      options: value => {
        if (!isValidISODateTime(value)) {
          throw new Error('Start time must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
        }
        return true;
      }
    }
  },

  endTime: {
    in: ['body'],
    notEmpty: { errorMessage: 'End time is required' },
    custom: {
      options: (value, { req }) => {
        if (!isValidISODateTime(value)) {
          throw new Error('End time must be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
        }

        const start = req.body.startTime;
        if (!start) {
          throw new Error('Start time must be provided before comparing');
        }

        if (!isStartBeforeEnd(start, value)) {
          throw new Error('Start time must be earlier than end time');
        }

        return true;
      }
    }
  }
});

module.exports = {
  createSlotSchema,
  deleteSlotSchema
};