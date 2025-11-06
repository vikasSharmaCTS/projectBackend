const express = require("express");
const passport = require("../config/passport");
const router = express.Router();

router.get("/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "Protected Route Success", user: req.user });
  }
);

module.exports = router;
