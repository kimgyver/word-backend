const mongoose = require('mongoose');
const Word = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  definition: {
    type: String,
    required: false
  },
  synonyms: {
    type: String,
    required: false
  },
  examples: {
    type: [String],
    required: false
  },
  priority: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Word', Word);
