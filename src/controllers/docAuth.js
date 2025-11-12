const bcrypt = require("bcrypt");
const Doctor = require("../models/doctorsSchema");
const Credentials = require("../models/credentials");

exports.addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, registrationNumber, specialty, registrationValidUpto } = req.body;

    const doctor = await Doctor.create({
      name,
      email,
      registrationNumber,
      specialty,
      registrationValidUpto
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const credentials = await Credentials.create({
      email,
      password: hashedPassword,
      role: "Doctor",    
      user: doctor._id    
    });

    doctor.credentials = credentials._id;
    await doctor.save();

    res.json({ message: "Doctor Added Successfully", doctor });

  } catch (err) {
    console.error(err);
    err.statusCode = err.statusCode || 500;
    next(err);
  }
};
