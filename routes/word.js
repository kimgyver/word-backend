const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
// const User = require('../models/User');
// const auth = require('../middleware/auth');
const Word = require('../models/Word');

const getOptions = reqQuery => {
  const orderOptions = {
    'Priority (1 > 2 > 3)': ['priority', 'asc'],
    'Updated Time': ['updatedAt', 'desc'],
    Alphabet: ['text', 'asc'],
    'Created Time': ['createdAt', 'desc']
  };

  if (reqQuery.random) return 'random';

  // console.log(orderOptions[reqQuery.order1]);
  // console.log(orderOptions[reqQuery.order2]);
  // console.log(orderOptions[reqQuery.order3]);

  let sortOptions = [];
  if (orderOptions[reqQuery.order1] !== undefined) {
    sortOptions.push(orderOptions[reqQuery.order1]);
  }
  if (orderOptions[reqQuery.order2] !== undefined) {
    sortOptions.push(orderOptions[reqQuery.order2]);
  }
  if (orderOptions[reqQuery.order3] !== undefined) {
    sortOptions.push(orderOptions[reqQuery.order3]);
  }

  if (sortOptions.length === 0) {
    console.log('Default order option is applied: priority/updateAt/Alphabet');
    sortOptions.push(['priority', 'asc']);
    sortOptions.push(['updatedAt', 'desc']);
    sortOptions.push(['text', 'asc']);
  }

  return sortOptions;
};

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// @route   GET /api/words
// @desc    Get all words
// @access  Private
router.get('/', async (req, res) => {
  //console.log(req.query);
  let sortOptions = getOptions(req.query);
  try {
    // console.log(sortOptions);
    let words = await Word.find().sort(sortOptions);
    if (sortOptions === 'random') words = shuffleArray(words);

    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.send('Server Error');
  }
});

// @route   POST /api/words
// @desc    Add new word
// @access  Private
router.post(
  '/',
  [
    check('text')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { text, definition, synonyms, examples, priority } = req.body;
      const newWord = new Word({
        text,
        definition,
        synonyms,
        examples,
        priority
      });
      const word = await newWord.save();
      res.json({ word });
    } catch (err) {
      console.error(err.message);
      res.send('Server Error');
    }
  }
);

// @route   PUT /api/words/:id
// @desc    Update word
// @access  Private
router.put(
  '/:id',
  [
    check('text')
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const { text, definition, synonyms, examples, priority } = req.body;

    // build word object
    const wordFields = {};
    if (text) wordFields.text = text;
    if (definition) wordFields.definition = definition;
    if (synonyms) wordFields.synonyms = synonyms;
    if (examples) wordFields.examples = examples;
    if (priority) wordFields.priority = priority;
    wordFields.updatedAt = Date.now();

    try {
      let word = await Word.findById(req.params.id);
      if (!word) return res.status(404).json({ msg: 'Word not found' });

      // make sure that user owns word
      // if (word.user.toString() !== req.user.id) {
      //   return res.status(401).json({ msg: 'Not authorized.' });
      // }

      word = await Word.findByIdAndUpdate(
        req.params.id,
        { $set: wordFields },
        { new: true }
      );

      res.json(word);
    } catch (err) {
      console.error(err.message);
      res.send('Server Error');
    }
  }
);

// @route   DELETE /api/words/:id
// @desc    Delete word
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    let word = await Word.findById(req.params.id);
    if (!word) return res.status(404).json({ msg: 'Word not found' });

    // make sure that user owns word
    // if (word.user.toString() !== req.user.id) {
    //     return res.status(401).json({msg: 'Not authorized.'});
    // }

    word = await Word.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Word removed' });
  } catch (error) {
    console.error(err.message);
    res.send('Server Error');
  }
});

module.exports = router;
