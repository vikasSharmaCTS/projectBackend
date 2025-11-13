const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const Credentials = require("../models/credentials");
const TokenJti = require("../models/tokenJti");
const Patient = require("../models/patientSchema");
 
require("dotenv").config();
 
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};
 
 
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // 1. Revocation check
      const tokenDoc = await TokenJti.findOne({ jti: jwt_payload.jti });
      if (tokenDoc) {
        return done(null, false, { message: "Token revoked" });
      }
 
      // 2. Lookup Credentials by ID
      const credentials = await Credentials.findById(jwt_payload.id).populate("user");
      if (credentials) return done(null, credentials);
 
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);
 
 
 
module.exports = passport;
 