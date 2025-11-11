const express = require("express");
const app = express();
const logger = require("./src/middleware/logger");
const headerSet = require("./src/middleware/header");
const errorHandler = require("./src/middleware/errorHandler");
const doctorRoutes = require("./src/routes/doctorRoute");
const appointmentRoutes = require("./src/routes/appointmentRoute");
const consultationRouter = require("./src/routes/consultationRoutes");
const authRoute = require("./src/routes/authRoutes");
// const convertIdsToString = require('./src/middleware/convertIdToString');
const profileRoute = require('./src/routes/patient');
const editAppRoute = require('./src/routes/editAppRoutes');
const { authenticate } = require('./src/middleware/authenticate');
const { authorize } = require('./src/middleware/authorize');
const cors = require("cors");


const connectDB = require("./src/config/db.config");
app.use(express.json());
app.use(logger);
app.use(headerSet);
// app.use(convertIdsToString);
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    maxAge: 360,
  })
);

app.use("/auth", authRoute);
app.use("/doctors",authenticate, doctorRoutes); // have both patient and doctor
app.use("/appointments", appointmentRoutes);
app.use("/", editAppRoute);
app.use("/profile", profileRoute); 
app.use("/consultations",authenticate, consultationRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

module.exports = app;
