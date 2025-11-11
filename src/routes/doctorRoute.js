const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
const {
  getFilteredDoctors,
  updateDoctor,
  timeSlots,
  deleteTimeSlot,
  getTimeSlot,
  editSlots,
} = require("../controllers/docController");
const validateRequest = require("../middleware/validateRequest");

const validateUpdateDoctor = require("../validators/doctorValidator");
const {
  deleteSlotSchema,
  createSlotSchema,
} = require("../validators/timeSlotValidors");

router.get("/getDoctors", getFilteredDoctors); // for patients

// router.put('/:id', validateUpdateDoctor, updateDoctor);
router.put(
  "/timeSlots",
  authorize(["Doctor"]),
  createSlotSchema,
  validateRequest,
  timeSlots
);
router.put("/editSlots", authorize(["Doctor"]), editSlots);
// router.put('/deleteSlot/:doctorId',deleteSlotSchema,validateRequest, deleteTimeSlot);
router.put("/deleteSlot", authorize(["Doctor"]), deleteTimeSlot);
router.get("/getSlots", getTimeSlot); /// for docor only // only booked false should fetch

module.exports = router;
