const bcrypt = require("bcrypt");
const Doctor = require("../models/doctorsSchema");
const Credentials = require("../models/credentials");

exports.addDoctor = async (req, res) => {
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

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
