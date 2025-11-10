// const mongoose = require("mongoose");
// const Appointment = require("../models/appointmentSchema");
// const Consultation = require("../models/consultationSchema");
// const Doctor = require("../models/doctorsSchema");

// exports.getPreviousAppointments = async (req, res) => {
//   try {
//     const { patientId } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(patientId)) {
//       return res.status(400).json({ message: "Invalid patientId format" });
//     }

//     const previousAppointments = await Appointment.find({
//       patientId: new mongoose.Types.ObjectId(patientId),
//       date: { $lt: new Date() }, // Only past appointments
//     }).sort({ date: -1 });

//     if (!previousAppointments.length) {
//       return res
//         .status(404)
//         .json({ message: "No previous appointments found" });
//     }

//     // Collect unique registrationNumbers and fetch matching doctors
//     const regNumbers = [
//       ...new Set(previousAppointments.map((app) => app.registrationNumber).filter(Boolean)),
//     ];

//     let docsMap = new Map();
//     if (regNumbers.length) {
//       const doctors = await Doctor.find(
//         { registrationNumber: { $in: regNumbers } },
//         "registrationNumber name specialty"
//       );
//       docsMap = new Map(doctors.map((d) => [d.registrationNumber, d]));
//     }

//     const formatted = previousAppointments.map((app) => {
//       const doc = docsMap.get(app.registrationNumber) || null;
//       return {
//         id: app._id.toString(),
//         patientId: app.patientId.toString(),
//         registrationNumber: app.registrationNumber,
//         doctorName: doc ? doc.name : null,
//         specialty: doc ? doc.specialty : null,
//         date: app.date.toISOString().split("T")[0],
//         startTime: app.startTime,
//         endTime: app.endTime,
//         status: app.status,
//         createdAt: app.createdAt,
//         updatedAt: app.updatedAt,
//       };
//     });

//     res.json(formatted);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

// // ✅ Get a specific previous appointment by ID
// exports.getPreviousAppointmentById = async (req, res) => {
//   try {
//     const { patientId, appointmentId } = req.query;

//     if (
//       !mongoose.Types.ObjectId.isValid(patientId) ||
//       !mongoose.Types.ObjectId.isValid(appointmentId)
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Invalid patientId or appointmentId format" });
//     }

//     const appointment = await Appointment.findOne({
//       _id: appointmentId,
//       patientId: new mongoose.Types.ObjectId(patientId),
//       date: { $lt: new Date() },
//     });

//     if (!appointment) {
//       return res
//         .status(404)
//         .json({ message: "Previous appointment not found" });
//     }

//     // If consultation exists, attach it
//     let consultation = null;
//     if (appointment.consultationId) {
//       consultation = await Consultation.findById(appointment.consultationId);
//     }

//     const formatted = {
//       id: appointment._id.toString(),
//       patientId: appointment.patientId.toString(),
//       registrationNumber: appointment.registrationNumber,
//       date: appointment.date.toISOString().split("T")[0],
//       startTime: appointment.startTime,
//       endTime: appointment.endTime,
//       status: appointment.status,
//       consultation: consultation || null,
//       createdAt: appointment.createdAt,
//       updatedAt: appointment.updatedAt,
//     };

//     res.json(formatted);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

const mongoose = require("mongoose");
const Appointment = require("../models/appointmentSchema");
const Consultation = require("../models/consultationSchema");
const Doctor = require("../models/doctorsSchema");
const fs = require("fs");
const path = require("path");


exports.getPreviousAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId format" });
    }

    const previousAppointments = await Appointment.find({
      patientId: new mongoose.Types.ObjectId(patientId),
      //date: { $lt: new Date() },
      status: { $ne: "confirmed" },
    }).sort({ date: -1 });

    const results = [];
    for (const appt of previousAppointments) {
      const doctor = await Doctor.findOne(
        { registrationNumber: appt.registrationNumber },
        "name specialty"
      );
      results.push({
        ...appt.toObject(),
        doctorName: doctor ? doctor.name : null,
        specialty: doctor ? doctor.specialty : null,
      });
    }

    if (!previousAppointments.length) {
      return res
        .status(404)
        .json({ message: "No previous appointments found" });
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching previous appointments:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// exports.getPreviousConsultationById = async (req, res) => {
//   try {
//     const { appointmentId } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
//       return res.status(400).json({ message: "Invalid appointmentId format" });
//     }

//     const appointment = await Appointment.findOne({
//       _id: appointmentId,
//       //date: { $lt: new Date() }
//     });

//     if (!appointment) {
//       return res.status(404).json({ message: "Previous appointment not found" });
//     }

//     if (!appointment.consultationId) {
//       return res.status(404).json({ message: "No consultation attached to this appointment" });
//     }

//     const consultation = await Consultation.findById(appointment.consultationId).select('notes prescription');

//     if (!consultation) {
//       return res.status(404).json({ message: "Consultation record not found" });
//     }

//     res.json({
//       notes: consultation.notes,
//       prescription: consultation.prescription
//     });
//   } catch (error) {
//     console.error("Error fetching consultation:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// exports.getUpcomingAppointments = async (req, res) => {
//   try {
//     const { patientId } = req.query;

//     if (!mongoose.Types.ObjectId.isValid(patientId)) {
//       return res.status(400).json({ message: 'Invalid patientId format' });
//     }

//     const appointments = await Appointment.find({
//       patientId: new mongoose.Types.ObjectId(patientId),
//       status: 'confirmed'
//     }).sort({ date: 1, startTime: 1 });

//     if (!appointments.length) {
//       return res.status(404).json({ message: 'No confirmed appointments found' });
//     }

//     res.json(appointments);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// };

exports.getPreviousConsultationById = async (req, res) => {
  try {
    const { appointmentId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointmentId format" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appointment.consultationId) {
      return res
        .status(404)
        .json({ message: "No consultation attached to this appointment" });
    }

    const consultation = await Consultation.findById(
      appointment.consultationId
    ).select("notes prescription");
    if (!consultation) {
      return res.status(404).json({ message: "Consultation record not found" });
    }

    const doctor = await Doctor.findOne(
      { registrationNumber: appointment.registrationNumber },
      "name speciality"
    );

    res.json({
      notes: consultation.notes,
      prescription: consultation.prescription,
      doctorName: doctor ? doctor.name : null,
      speciality: doctor ? doctor.speciality : null,
    });
  } catch (error) {
    console.error("Error fetching consultation:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;

    // Validate patientId format
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patientId format" });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const currentTime = now.toTimeString().slice(0, 5); // 'HH:mm'

    // Fetch upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId: new mongoose.Types.ObjectId(patientId),
      $or: [
        { date: { $gt: now } }, // future dates
        { date: today, startTime: { $gt: currentTime } }, // same day later time
      ],
    }).sort({ date: 1, startTime: 1 });

    if (!upcomingAppointments.length) {
      return res
        .status(404)
        .json({ message: "No upcoming appointments found" });
    }

    // Fetch doctor details for each appointment
    const formatted = await Promise.all(
      upcomingAppointments.map(async (app) => {
        const doctor = await Doctor.findOne({
          registrationNumber: app.registrationNumber,
        });
        return {
          id: app._id.toString(),
          patientId: app.patientId.toString(),
          registrationNumber: app.registrationNumber,
          doctorName: doctor ? doctor.name : null,
          specialty: doctor ? doctor.specialty : null,
          date: app.date.toISOString().split("T")[0],
          startTime: app.startTime,
          endTime: app.endTime,
          status: app.status,
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
        };
      })
    );

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};



exports.downloadConsultation = async (req, res) => {
  try {
    const { appointmentId } = req.query; // ✅ Using query params for GET

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointmentId format" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appointment.consultationId) {
      return res.status(404).json({ message: "No consultation attached to this appointment" });
    }

    const consultation = await Consultation.findById(appointment.consultationId)
      .select('notes prescription');
    if (!consultation) {
      return res.status(404).json({ message: "Consultation record not found" });
    }

    const doctor = await Doctor.findOne(
      { registrationNumber: appointment.registrationNumber },
      'name speciality'
    );

    // ✅ Prepare file content
    const fileContent = `
Consultation Details
----------------------
Doctor Name: ${doctor ? doctor.name : 'N/A'}
Speciality: ${doctor ? doctor.speciality : 'N/A'}
Appointment Date: ${appointment.date.toDateString()}
Notes: ${consultation.notes}
Prescription: ${consultation.prescription}
----------------------
Thank you for visiting!
`;

    // ✅ Create unique filename
    const timestamp = Date.now();
    const fileName = `consultation_${timestamp}.txt`;
    const filePath = path.join(__dirname, fileName);

    // ✅ Write file
    fs.writeFileSync(filePath, fileContent);

    // ✅ Send file for download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error downloading file');
      } else {
        console.log('File sent for download');
        // ✅ Clean up after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Error generating consultation file:', error);
    res.status(500).json({ error: 'Failed to generate consultation file' });
  }
};