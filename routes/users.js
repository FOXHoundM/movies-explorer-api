const router = require('express').Router();

const { getUsersMe, updateUser } = require('../controllers/users');
const { validationUpdateUser } = require('../middlewares/validator');

router.get('/me', getUsersMe);

router.patch('/me', validationUpdateUser, updateUser);

module.exports = router;
