const express = require('express');
const app = express();
const logger = require('./src/middleware/logger');
const headerSet = require('./src/middleware/header');
const errorHandler = require('./src/middleware/errorHandler');
const doctorRoutes = require('./src/routes/doctorRoute');
const appointmentRoutes = require('./src/routes/appointmentRoute');
const consultationRouter = require('./src/routes/consultationRoutes');

const connectDB = require('./src/config/db.config');
app.use(express.json());
app.use(logger);
app.use(headerSet);
connectDB();



app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);

app.use("/consultations", consultationRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
