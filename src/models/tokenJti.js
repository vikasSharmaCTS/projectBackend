const mongoose = require('mongoose');
 
const tokenJtiSchema = new mongoose.Schema({
    jti: String,
    expiresAt: Date
});
 
module.exports = mongoose.model('TokenJti', tokenJtiSchema);
 