const router = require('express')
  .Router();
const {
  validationSignin,
  validationSignup,
} = require('../middlewares/validator');
const {
  login,
  createUser,
} = require('../controllers/users');
const auth = require('../middlewares/auth');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { NOT_FOUND_ERROR } = require('../errors/errors');

router.post(
  '/signin',
  validationSignin,
  login,
);

router.post(
  '/signup',
  validationSignup,
  createUser,
);

router.use(auth);

router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('*', (req, res) => res.status(NOT_FOUND_ERROR)
  .json({ message: 'Произошла ошибка, передан некорректный путь' }));

module.exports = router;
