const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Word = Schema({
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
  },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  origins: {
    type: [String]
  }
});

module.exports = mongoose.model('Word', Word);
