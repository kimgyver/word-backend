const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Word = require('../models/Word');
const auth = require('../middleware/auth');

// @route     POST api/users
// @desc      Regiter a user
// @access    Public
router.post(
  '/user/',
  [
    check('name', 'Please add name')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 360000
        },
        (err, token) => {
          s;
          if (err) throw err;
          user.password = undefined;
          res.json({ token, user });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/user
// @desc    Get all users
// @access  Private
router.get('/user/', async (req, res) => {
  try {
    let users = await User.find({})
      .populate('owner', 'name')
      .select('-password');
    let wordsCount = await Word.aggregate([
      {
        $group: { _id: '$owner', count: { $sum: 1 } }
      }
    ]).exec();

    //console.log(users);
    //console.log(wordsCount);

    res.json({ users, wordsCount });
  } catch (err) {
    console.error(err.message);
    res.send('Server Error');
  }
});

// @route   PUT /api/user/:id
// @desc    Update user
// @access  Private
router.put('/user/:id', auth, async (req, res) => {
  const { friends } = req.body;

  // build user object
  const userFields = {};
  if (friends) userFields.friends = friends;
  userFields.updatedAt = Date.now();
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    // make sure that user is eligible
    if (req.user.role !== 'Admin') {
      if (user._id.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized.' });
      }
    }
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.send('Server Error');
  }
});

module.exports = router;
