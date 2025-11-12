const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { authorize } = require("../middleware/authorize");
 
const {
  getFilteredDoctors,
  timeSlots,
  deleteTimeSlot,
  getTimeSlot,
  editSlots,
} = require("../controllers/docController");
const validateRequest = require("../middleware/validateRequest");
 
const {
  deleteSlotSchema,
  createSlotSchema,
} = require("../validators/timeSlotValidors");
 
router.get("/getDoctors", getFilteredDoctors);
 
router.put(
  "/timeSlots",
  authorize(["Doctor"]),
  createSlotSchema,
  validateRequest,
  timeSlots
);
router.put("/editSlots", authorize(["Doctor"]), editSlots);
router.put("/deleteSlot", authorize(["Doctor"]), deleteTimeSlot);
router.get("/getSlots",authorize(["Doctor"]), getTimeSlot);
 
module.exports = router;
 
 