const jwt = require("jsonwebtoken");
const TokenJti = require("../models/tokenJti");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET || "hospital_secret_key");


const tokenDoc = await TokenJti.findOne({ jti: decoded.jti });
if (tokenDoc) {
  return res.status(401).json({ message: "Unauthorized: Token has been revoked" });
}

req.user = decoded;
next();
  
}

module.exports = { authenticate };