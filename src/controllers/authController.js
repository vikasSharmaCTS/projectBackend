const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Credentials = require("../models/credentials");
const Patient = require("../models/patientSchema");

// exports.signup = async (req, res) => {
//   try {
//     const { email, password, name, age, gender, phoneNumber} = req.body;

//     const existingUser = await Credentials.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

    

//     const patient = await Patient.create({
//       name,
//       age,
//       gender,
//       phoneNumber
//     });

//     const credentials = await Credentials.create({
//       email,
//       password: hashedPassword,
//       role: "Patient",
//       user: patient._id,
//     });

//     patient.credentials = credentials._id;
//     await patient.save();

//     res.status(201).json({ message: "Signup Successful", patient });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.signup = async (req, res) => {
  try {
    const { email, password, name, age, gender, phoneNumber } = req.body;

    const existingUser = await Credentials.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      name,
      age,
      gender,
      phoneNumber,
      emailId: email 
    });

    const credentials = await Credentials.create({
      email,
      password: hashedPassword,
      role: "Patient",
      user: patient._id,
    });

    patient.credentials = credentials._id;
    await patient.save();

    res.status(201).json({ message: "Signup Successful", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const credentials = await Credentials.findOne({ email }).populate("user");

    if (!credentials) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, credentials.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: credentials.user._id, role: credentials.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: `${credentials.role} Login Successful`,
      role: credentials.role,
      data: credentials.user,
      token
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


