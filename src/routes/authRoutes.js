const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const router = express.Router();
const {addDoctor} = require("../controllers/docAuth");


router.post("/signup", signup);
router.post("/login", login);
router.post("/addDoctor", addDoctor);
router.post("/logout", logout)

module.exports = router;
