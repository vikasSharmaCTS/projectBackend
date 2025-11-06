const express = require("express");
const { signup, login } = require("../controllers/authController");
const router = express.Router();
const {addDoctor} = require("../controllers/docAuth");


router.post("/signup", signup);
router.post("/login", login);
router.post("/addDoctor", addDoctor);

module.exports = router;
