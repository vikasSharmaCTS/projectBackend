
// const jwt = require('jsonwebtoken');

// function authenticate(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Unauthorized: No token provided' });
//   }

//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user info
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Unauthorized: Invalid token' });
//   }
// }

// module.exports = { authenticate };



const jwt = require("jsonwebtoken");
const TokenJti = require("../models/tokenJti");

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "hospital_secret_key");

    // Check JTI in DB
    const tokenDoc = await TokenJti.findOne({ jti: decoded.jti });
    if (!tokenDoc) {
      return res.status(401).json({ message: "Unauthorized: Token revoked or expired" });
    }

    req.user = decoded; // Attach user info
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
}

module.exports = { authenticate };