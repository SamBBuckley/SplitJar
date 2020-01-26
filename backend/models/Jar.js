const mongoose = require('mongoose');

const jarSchema = mongoose.Schema( {
  title: { type: String, required: true},
  description: { type: String, required: true },
  balance: { type: mongoose.Types.Decimal128, required: true },
  charge: { type: mongoose.Types.Decimal128, required: true },
  users: { type: Array[String], required: true }
});

module.exports = mongoose.model('Jar', jarSchema);
