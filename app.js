require('dotenv')
  .config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const {
  requestLogger,
  errorLogger,
} = require('./middlewares/logger');
const { errorHandler } = require('./helpers/errorHandler');
const { corsOptions } = require('./middlewares/allowedCors');
const { limiter } = require('./middlewares/rateLimit');
const router = require('./routes');

const {
  PORT = 3000,
  NODE_ENV,
  MONGODB_ADDRESS,
} = process.env;
const mongoDBAddress = NODE_ENV === 'production' ? MONGODB_ADDRESS : 'mongodb://127.0.0.1:27017/bitfilmsdb';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));

app.use(requestLogger);
app.use(limiter);
app.use(helmet());

app.use(router);

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
