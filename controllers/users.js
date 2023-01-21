const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../helpers/token');

module.exports.getUsersMe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else if (user) {
      res.status(200).json(user);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).json({ message: 'Неправильные данные введены' });
    }
    next(err);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const changeUserInfo = await User.findByIdAndUpdate(
      req.user._id,
      { email, name },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!changeUserInfo) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(changeUserInfo);
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Неправильные данные введены' });
    }
    return next(err);
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });

    if (!email || !password) {
      res.status(400).json({ message: 'Invalid credentials' });
    }
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Неправильные данные введены' });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }
    return next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Invalid credentials' });
    }
    const user = await User.findOne({ email }).select('password');

    if (!user) {
      res.status(401).json({ message: 'Неправильные почта или пароль' });
    }

    const result = await bcrypt.compare(password, user.password);

    if (result) {
      const payload = { _id: user._id };
      const token = generateToken(payload);
      res.status(200)
        .json({ token });
    } else {
      res.status(401).json({ message: 'Неправильные почта или пароль' });
    }
  } catch (err) {
    next(err);
  }
};
