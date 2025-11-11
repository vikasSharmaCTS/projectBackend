const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["Patient", "Doctor"], 
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "role",   
    required: true,
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("Credentials", credentialSchema);
