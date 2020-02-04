const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const User = Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  friends: { type: [Schema.Types.ObjectId], ref: 'User', required: false }
  // words: { type: [Schema.Types.ObjectId], ref: 'Word', required: false }
});

module.exports = mongoose.model('User', User);
