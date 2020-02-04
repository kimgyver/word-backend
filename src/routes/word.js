const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Word = require('../models/Word');
const auth = require('../middleware/auth');

const getSortOptions = reqQuery => {
  const orderOptions = {
    'Priority (1 > 2 > 3)': ['priority', 'asc'],
    'Updated Time': ['updatedAt', 'desc'],
    Alphabet: ['text', 'asc'],
    'Created Time': ['createdAt', 'desc']
  };

  if (reqQuery.random) return 'random';

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

// @route   GET /api/word
// @desc    Get all words
// @access  Private
router.get('/word/', auth, async (req, res) => {
  // console.log(
  //   'REQ.USER,ID ---> ',
  //   req.user !== null && req.user !== undefined ? req.user.id : null
  // );

  //console.log(req.query);
  let sortOptions = getSortOptions(req.query);
  try {
    let condition = [];
    if (req.user.role === 'Admin') {
      // all
    } else {
      //condition.push({ owner: { $eq: null } });
      if (req.user !== '') {
        condition.push({ owner: { $in: req.user.friends } });
        condition.push({ owner: { $eq: req.user.id } });
      } else {
        return getWordsForGuests(req, res);
      }
    }
    //console.log('CONDITION ===========>', condition);
    const finalCondition = condition.length !== 0 ? { $or: condition } : null;
    let words = await Word.find(finalCondition)
      .populate('owner', 'name')
      .sort(sortOptions);
    if (sortOptions === 'random') words = shuffleArray(words);

    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.send('Server Error');
  }
});

const getWordsForGuests = async (req, res) => {
  try {
    let words = await Word.aggregate([
      { $sample: { size: 15 } },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      {
        $project: {
          'owner.password': 0
        }
      },
      { $unwind: '$owner' }
    ]);

    res.json(words);
  } catch (err) {
    console.error(err.message);
    res.send('Server Error');
  }
};

// @route   POST /api/word
// @desc    Add new word
// @access  Private
router.post(
  '/word/',
  [
    auth,
    [
      check('text')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        text,
        definition,
        synonyms,
        examples,
        priority,
        origins
      } = req.body;

      const userId = req.user !== '' ? req.user.id : null;
      const newWord = new Word({
        text,
        definition,
        synonyms,
        examples,
        priority,
        owner: userId,
        origins
      });
      let word = await newWord.save();
      word = await Word.findById(word._id).populate('owner', 'name');
      res.json({ word });
    } catch (err) {
      console.error(err.message);
      res.send('Server Error');
    }
  }
);

// @route   PUT /api/word/:id
// @desc    Update word
// @access  Private
router.put(
  '/word/:id',
  [
    auth,
    [
      check('text')
        .not()
        .isEmpty()
    ]
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
      if (req.user.role !== 'Admin') {
        if (
          word.owner === null ||
          word.owner === undefined ||
          word.owner.toString() !== req.user.id
        ) {
          return res.status(401).json({ msg: 'Not authorized.' });
        }
      }

      word = await Word.findByIdAndUpdate(
        req.params.id,
        { $set: wordFields },
        { new: true }
      ).populate('owner', 'name');

      res.json(word);
    } catch (err) {
      console.error(err.message);
      res.send('Server Error');
    }
  }
);

// @route   DELETE /api/word/:id
// @desc    Delete word
// @access  Private
router.delete('/word/:id', auth, async (req, res) => {
  try {
    let word = await Word.findById(req.params.id);
    if (!word) return res.status(404).json({ msg: 'Word not found' });

    // make sure that user owns word
    if (req.user.role !== 'Admin') {
      if (
        word.owner === null ||
        word.owner === undefined ||
        word.owner.toString() !== req.user.id
      ) {
        return res.status(401).json({ msg: 'Not authorized.' });
      }
    }

    word = await Word.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Word removed' });
  } catch (error) {
    console.error(err.message);
    res.send('Server Error');
  }
});

module.exports = router;
