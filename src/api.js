const express = require('express');
const connectDB = require('./db');
const path = require('path');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

var corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST, DELETE, OPTIONS',
  preflightContinue: true,
  optionsSuccessStatus: 204
};

// Connect DB
connectDB();

// Init middleware
app.use(express.json({ extended: false }));
app.get('/', (req, res) => res.json({ msg: 'Welcome to the Words API...' }));

app.use(cors(corsOptions));

// Define Routes
// app.use('/api/users', require('./routes/users'));
// app.use('/api/auth', require('./routes/auth'));

//app.use('/api/words', require('./routes/word'));
app.use('/.netlify/functions/api', require('./routes/word'));
app.use('/.netlify/functions/api', require('./routes/user'));
app.use('/.netlify/functions/api', require('./routes/auth'));
//app.use('/api/words', require('./routes/word'));

// app.use(cors());

// Add corsOptions to express app

// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//   // Set static folder
//   app.use(express.static('client/build'));

//   app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')));
// }

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports.handler = serverless(app);
