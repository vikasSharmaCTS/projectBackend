const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

const validAppointment = {
  patientId: 104,
  date: '2025-10-20',
  startTime: '05:00',
  endTime: '06:00'
};

const invalidDateFormat = {
  patientId: 110,
  date: '25-10-2025',
  startTime: '10:00',
  endTime: '10:30'
};

describe('Appointment Booking', () => {
  it('should book an appointment with valid data', (done) => {
    request(app)
      .post('/appointments/Psychiatry/1/appointment')
      .send(validAppointment)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('appointment');
        expect(res.body.appointment).to.have.property('appointmentId');
        expect(res.body.appointment.status).to.equal('confirmed');
        done();
      });
  });

  it('should reject booking with invalid date format', (done) => {
    request(app)
      .post('/appointments/Psychiatry/1/appointment')
      .send(invalidDateFormat)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('errors');
        done();
      });
  });
});
