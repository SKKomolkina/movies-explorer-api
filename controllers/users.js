require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const UnauthorizedError = require('../utils/Errors/UnauthrizedError');
const NotFoundError = require('../utils/Errors/NotFoundError');
const ConflictError = require('../utils/Errors/ConflictError');

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  return User.findOne({ email })
    .then((mail) => {
      if (mail) {
        throw new ConflictError('Такой пользователь уже существует!');
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          throw new Error('Ошибка на сервере!');
        }

        User.create({ email, password: hash, name })
          .then((user) => {
            res.status(200).send({
              id: user._id,
              email: user.email,
              name: user.name,
            });
          });
      });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неверная почта или пароль.');
      }

      bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неверная почта или пароль!');
          }
          const { NODE_ENV, JWT_SECRET } = process.env;

          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          );

          res.send({ token });
        })
        .catch(next);
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.status(200).send({
        email: user.email,
        name: user.name,
      });
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Почта уже занята!');
      }

      User.findByIdAndUpdate(req.user._id, { email, name },
        { new: true, runValidators: true })
        .then((user) => {
          if (!user) {
            throw new NotFoundError('Пользователь не найден');
          } else {
            res.status(200).send(user);
          }
        })
        .catch((err) => {
          if ((err.name === 'CastError')|| (err.name === 'ValidationError')) {
            throw new NotFoundError('Переданы некорректные данные');
          } else {
            next(err);
          }
        })
    })
    .catch(next);
};
