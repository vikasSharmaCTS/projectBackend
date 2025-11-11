

module.exports = {
  validAppointment: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '10:30'
  },

  invalidPatientId: {
    registrationNumber: 'DOC123',
    patientId: 'invalid-id',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '10:30'
  },

  missingDoctor: {
    registrationNumber: 'DOC999',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '10:30'
  },

  expiredDoctor: {
    registrationNumber: 'DOCEXPIRED',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '10:30'
  },

  unavailableSlot: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '12:00',
    endTime: '12:30'
  },

  invalidDateFormat: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '15-11-2025',
    startTime: '10:00',
    endTime: '10:30'
  },

  pastDate: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2020-01-01',
    startTime: '10:00',
    endTime: '10:30'
  },

  invalidStartTime: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '10',
    endTime: '10:30'
  },

  invalidEndTime: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '10:00',
    endTime: '1030'
  },

  endTimeBeforeStartTime: {
    registrationNumber: 'DOC123',
    patientId: '64f1c2a9b2d3f9a1c4e5d678',
    date: '2025-11-15',
    startTime: '10:30',
    endTime: '10:00'
  }
};
