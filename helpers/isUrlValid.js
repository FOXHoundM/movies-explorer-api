const validator = require('validator');
const { BAD_REQUEST_ERROR } = require('../errors/errors');

module.exports.isUrlValid = (url, res) => {
  if (!validator.isURL(url)) {
    return res.status(BAD_REQUEST_ERROR)
      .json({ message: 'Invalid URL' });
  }
  return url;
};
