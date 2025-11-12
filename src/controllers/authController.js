const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Credentials = require("../models/credentials");
const Patient = require("../models/patientSchema");
const { v4: uuidv4 } = require("uuid");
const TokenJti = require("../models/tokenJti");


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
      emailId: email,
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
 
    if (!credentials) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
 
    const match = await bcrypt.compare(password, credentials.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
 
    const jti = uuidv4();
    const token = jwt.sign(
      { id: credentials._id, role: credentials.role, jti },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
 
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
 
    res.json({
      message: `${credentials.role} Login Successful`,
      role: credentials.role,
      data: credentials.user, 
      token,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: e.message });
  }
};
 


exports.logout = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
const decoded = jwt.verify(token, process.env.JWT_SECRET || "hospital_secret_key");


const expiresAt = new Date(decoded.exp * 1000); // convert exp to Date
const result = await TokenJti.create({ jti: decoded.jti, expiresAt });


    return res.json({ message: "Logout successful" });
  } catch (e) {
    console.error("Logout error:", e);
    return res.status(400).json({ message: "Invalid token" });
  }
};
