'use strict';

const Mongoose = require('mongoose');
require('dotenv').config();


module.exports = {
  dbConnection: () => {
    if (Mongoose.connection.readyState === 0) {
      let DB_AUTH_URL = process.env.MONGODB_URI;
      Mongoose.connect(DB_AUTH_URL);
      Mongoose.connection.on('error', (err) => {
        throw err;
      });

      Mongoose.connection.on('connected', () => {
        console.log(`⚡ MongoDB Connected ⚡`);
      });
    }
  },
  Mongoose
};
