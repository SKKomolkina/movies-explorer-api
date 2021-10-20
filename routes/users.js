const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const validateEmail = require('../utils/validateEmail');

const { getCurrentUser, updateUser } = require('../controllers/users');

router.get('/me', getCurrentUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validateEmail),
    name: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

module.exports = router;
