


const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

// const validCreateSlot = {
//   availableSlots: {
//     '2025-10-28': [
//       {
//         startTime: '09:00',
//         endTime: '10:00',
//         isBooked: false
//       }
//     ]
//   }
// };

// const invalidCreateSlot = {
//   availableSlots: {
//     '2025-10-28': [
//       {
//         startTime: '10:00',
//         endTime: '09:00',
//         isBooked: false
//       }
//     ]
//   }
// };

// const validDeleteSlot = {
//   date: '2025-10-28',
//   startTime: '09:00',
//   endTime: '10:00'
// };

// const invalidDeleteSlot = {
//   date: '28-10-2025',
//   startTime: '09:00',
//   endTime: '08:00'
// };

// describe('Doctor Slot Management', () => {
//   describe('Create Slot', () => {
//     it('should create slot with valid data', async () => {
//       const res = await request(app)
//         .put('/doctors/createSlot/1')
//         .send(validCreateSlot)
//         .expect(200);
//       expect(res.body).to.have.property('message');
//     });

//     it('should reject slot creation with invalid time', async () => {
//       const res = await request(app)
//         .put('/doctors/createSlot/1')
//         .send(invalidCreateSlot)
//         .expect(400);
//       expect(res.body).to.have.property('errors');
//     });
//   });

//   describe('Delete Slot', () => {
//     it('should delete slot with valid data', async () => {
//       const res = await request(app)
//         .delete('/doctors/deleteSlot/1')
//         .send(validDeleteSlot)
//         .expect(200);
//       expect(res.body).to.have.property('message');
//     });

//     it('should reject slot deletion with invalid date format', async () => {
//       const res = await request(app)
//         .delete('/doctors/deleteSlot/1')
//         .send(invalidDeleteSlot)
//         .expect(400);
//       expect(res.body).to.have.property('errors');
//     });
//   });
// });


const validCreateSlot = {
  calendar: [
    {
      date: '2025-10-28',
      availableSlots: [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:30', endTime: '11:30' }
      ]
    }
  ]
};

const invalidCreateSlot = {
  calendar: [
    {
      date: '2025-10-28',
      availableSlots: [
        { startTime: '10:00', endTime: '09:00' } // Invalid: startTime > endTime
      ]
    }
  ]
};

// ✅ Delete slot format remains same
const validDeleteSlot = {
  date: '2025-10-28',
  startTime: '09:00',
  endTime: '10:00'
};

const invalidDeleteSlot = {
  date: '28-10-2025', // Invalid date format
  startTime: '09:00',
  endTime: '08:00' // Invalid time order
};

describe('Doctor Slot Management', () => {
  describe('Create Slot', () => {
    it('should create slot with valid data', async () => {
      const res = await request(app)
        .put('/doctors/createSlot/1')
        .send(validCreateSlot)
        .expect(200);
      expect(res.body).to.have.property('message');
      expect(res.body.doctor).to.have.property('calendar');
      expect(res.body.doctor.calendar[0].date).to.equal('2025-10-28');
    });

    it('should reject slot creation with invalid time', async () => {
      const res = await request(app)
        .put('/doctors/createSlot/1')
        .send(invalidCreateSlot)
        .expect(400);
      expect(res.body).to.have.property('errors');
      expect(res.body.errors[0].msg).to.include('startTime must be earlier than endTime');
    });
  });

  describe('Delete Slot', () => {
    it('should delete slot with valid data', async () => {
      const res = await request(app)
        .delete('/doctors/deleteSlot/1')
        .send(validDeleteSlot)
        .expect(200);
      expect(res.body).to.have.property('message');
    });

    it('should reject slot deletion with invalid date format', async () => {
      const res = await request(app)
        .delete('/doctors/deleteSlot/1')
        .send(invalidDeleteSlot)
        .expect(400);
      expect(res.body).to.have.property('errors');
      expect(res.body.errors[0].msg).to.include('Date must be in YYYY-MM-DD format');
    });
  });
});