const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  //console.log('TOKEN--->', token);

  if (token === '' || token === undefined) {
    req.user = '';
    return next();
  }

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    console.log('token-->', token);
    //const decoded = jwt.verify(token, config.get('jwtSecret'));
    const decoded = jwt.verify(token, 'secret');
    console.log('decoded-->', decoded);

    req.user = decoded.user;
    let user = await User.findOne({ _id: req.user.id });
    req.user.role = user.role;
    req.user.friends = user.friends;
    if (req.user.id === undefined) req.user.id = '';
    //console.log('ROLE--->', req.user.role);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
