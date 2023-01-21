const mongoose = require('mongoose');
const validator = require('validator');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: 'Введенный Вами адрес электронной почты не соответствует необходимому формату.',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      minLength: 2,
      maxLength: 30,
      default: 'Микаэль',
    },
  },
);

module.exports = mongoose.model('user', userSchema);
