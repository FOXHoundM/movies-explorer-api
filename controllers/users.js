const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../helpers/token');
const {
  BAD_REQUEST_ERROR,
  BAD_REQUEST_MESSAGE,
  AUTHENTICATION_ERROR,
  CREATED,
  OK,
  NOT_FOUND_ERROR,
  NOT_FOUND_ERROR_MESSAGE,
  CONFLICT_ERROR_MESSAGE,
  CONFLICT_ERROR,
} = require('../errors/errors');

module.exports.getUsersMe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(NOT_FOUND_ERROR)
        .json({ message: `User ${NOT_FOUND_ERROR_MESSAGE}` });
    } else if (user) {
      res.status(OK)
        .json(user);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(BAD_REQUEST_ERROR)
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    next(err);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const {
      email,
      name,
    } = req.body;
    const changeUserInfo = await User.findByIdAndUpdate(
      req.user._id,
      {
        email,
        name,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!changeUserInfo) {
      return res.status(NOT_FOUND_ERROR)
        .json({ message: `User ${NOT_FOUND_ERROR_MESSAGE}` });
    }
    return res.status(OK)
      .json(changeUserInfo);
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(BAD_REQUEST_ERROR)
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    return next(err);
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      email,
      name,
      password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hash,
      name,
    });

    if (!email || !password) {
      res.status(BAD_REQUEST_ERROR)
        .send
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    return res.status(CREATED)
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(BAD_REQUEST_ERROR)
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    if (err.code === 11000) {
      return res.status(CONFLICT_ERROR)
        .json({ message: CONFLICT_ERROR_MESSAGE });
    }
    return next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      res.status(BAD_REQUEST_ERROR)
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    const user = await User.findOne({ email })
      .select('password');

    if (!user) {
      res.status(AUTHENTICATION_ERROR)
        .json({ message: 'Неправильные почта или пароль' });
    }

    const result = await bcrypt.compare(password, user.password);

    if (result) {
      const payload = { _id: user._id };
      const token = generateToken(payload);
      res.status(OK)
        .json({ token });
    } else {
      res.status(AUTHENTICATION_ERROR)
        .json({ message: 'Неправильные почта или пароль' });
    }
  } catch (err) {
    next(err);
  }
};
