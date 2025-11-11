// const jwt = require('jsonwebtoken');
// const JWT_SECRET = 'hospital_secret_key';

// exports.verifyToken = (req, res, next) => {
//   const token = req.header('Authorization');
//   if (!token) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });

//   try {
//     const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
//     req.user = verified;
//     next();
//   } catch (err) {
//     res.status(400).json({ message: 'Invalid Token' });
//   }
// };




const jwt = require('jsonwebtoken');
const TokenJti = require('../models/tokenJti');
const JWT_SECRET = process.env.JWT_SECRET || 'hospital_secret_key';
 
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });
 
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const verified = jwt.verify(token, JWT_SECRET);
 
    // basic jti verification
    if (!verified.jti) return res.status(401).json({ message: 'Invalid Token: missing jti' });
 
    const stored = await TokenJti.findOne({ jti: verified.jti });
    if (!stored) return res.status(401).json({ message: 'Token revoked or jti not found' });
 
    if (stored.expiresAt && stored.expiresAt < new Date()) {
      await TokenJti.findOneAndDelete({ jti: verified.jti }); // cleanup expired jti
      return res.status(401).json({ message: 'Token expired' });
    }
 
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
};
// ...existing code...
 