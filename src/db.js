const mongoose = require('mongoose');
const config = require('config');
// const db = config.get('mongoURI');
const db =
  'mongodb+srv://english:english@cluster0-5xua6.mongodb.net/english?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    mongoose.set('useCreateIndex', true);
    await mongoose.connect(db, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
