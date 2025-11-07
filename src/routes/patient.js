// const express = require("express");
// const passport = require("../config/passport");
// const router = express.Router();

// router.get("/patient",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     res.json({ message: "Protected Route Success \n Welcome User", user: req.user });
//   }
// );

// router.get("/doctor",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     res.json({ message: "Protected Route Success \n Welcome DOC", user: req.user });
//   }
// );

// module.exports = router;

const express = require("express");
const passport = require("../config/passport");
const router = express.Router();
 
const authenticatePatient = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    console.log("USER___",user);
    if (err || !user || user.role !== "Patient") {
      return res.status(401).json({ message: "Unauthorized: Patient access required" });
    }
    req.user = user;
    next();
  })(req, res, next);

};
 
const authenticateDoctor = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err || !user || user.role !== "Doctor") {
      console.log("USER___",user);
      return res.status(401).json({ message: "Unauthorized: Doctor access required" });
    }
    req.user = user;
    next();
  })(req, res, next);
};
 
router.get("/patient", authenticatePatient, (req, res) => {
  res.json({ message: `${req.user.role} Profile Access`, user: req.user });
});
 
router.get("/doctor", authenticateDoctor, (req, res) => {
  res.json({ message: "Doctor Profile Access", user: req.user });
});
 
module.exports = router;