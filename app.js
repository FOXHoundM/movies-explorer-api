require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const helmet = require('helmet');
const cors = require('cors');
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { validationSignin, validationSignup } = require('./middlewares/validator');
const { errorHandler } = require('./helpers/errorHandler');
const { corsOptions } = require('./middlewares/allowedCors');

const { PORT = 3000, NODE_ENV, MONGODB_ADDRESS } = process.env;
const mongoDBAddress = NODE_ENV === 'production' ? MONGODB_ADDRESS : 'mongodb://127.0.0.1:27017/diplom';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use(requestLogger);
app.use(helmet());

app.post(
  '/signin',
  validationSignin,
  login,
);

app.post(
  '/signup',
  validationSignup,
  createUser,
);

app.use('/users', auth, userRouter);
app.use('/movies', auth, movieRouter);

app.use('*', (req, res) => res.status(404)
  .json({ message: 'Произошла ошибка, передан некорректный путь' }));

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

mongoose.connect(mongoDBAddress, {
  useNewUrlParser: true,
}, () => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
});
