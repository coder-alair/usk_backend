'use strict';

const Jwt = require('jsonwebtoken');

module.exports = {
  /**
   * @description This Function is use to Decode token on a request and get without bearer
   * @param {*} token
   * @returns {*}
   */
  decode: (token) => {
    const parts = token.split(' ');
    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        return credentials;
      }
      return false;
    }
    return false;
  },

  /**
   * @description This function is used to verify user token
   * @param {*} token
   * @param {*} callback
   * @returns {}
   */
  verifyUser: (token, callback) => {
    try {
      return Jwt.verify(token, process.env.ENCRYPTION_SECRET, {}, callback);
    } catch (err) {
      return 'error';
    }
  },
};
