const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const {
  getFilteredDoctors,
  updateDoctor,
  createTimeSlot,
  deleteTimeSlot,
  getTimeSlot
} = require('../controllers/docController');
const validateRequest = require('../middleware/validateRequest');

const validateUpdateDoctor = require('../validators/doctorValidator');
const  {deleteSlotSchema, createSlotSchema}  = require('../validators/timeSlotValidors');

router.get('/', authenticate, authorize(['Doctor']), getFilteredDoctors);

// router.put('/:id', validateUpdateDoctor, updateDoctor);
router.put('/createSlot',createSlotSchema,validateRequest, createTimeSlot);
router.put('/deleteSlot/:doctorId',deleteSlotSchema,validateRequest, deleteTimeSlot);
router.get('/getSlots/:doctorId', getTimeSlot);


module.exports = router;
