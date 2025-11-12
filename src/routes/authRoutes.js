const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const {authenticate} = require("../middleware/authenticate");
const router = express.Router();
const {addDoctor} = require("../controllers/docAuth");
const passport = require('../config/passport');


router.post("/signup", signup);
router.post("/login", login);
router.post("/addDoctor", addDoctor);
router.post("/logout", passport.authenticate('jwt', { session: false }), logout)

module.exports = router;
