const mongoose = require('mongoose');

const jarSchema = mongoose.Schema( {
  title: { type: String, required: true},
  description: { type: String, required: true },
  balance: { type: Number, required: true },
  charge: { type: Number, required: true },
  goal: {type: Number, required: true},
  users: { type: [ { type: String } ], required: true }
});

jarSchema.query.byName = function(name) {
  return this.where({ name: new RegExp(name, 'i')});
}

module.exports = mongoose.model('Jar', jarSchema);
