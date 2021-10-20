require('dotenv').config();

// <!--------------------------!>

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { celebrate, Joi, errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const error = require('./middlewares/error');
const validateEmail = require('./utils/validateEmail');

const auth = require('./middlewares/auth');
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const { login, createUser } = require('./controllers/users');

const NotFoundError = require('./utils/Errors/NotFoundError');

const { PORT = 3001 } = process.env;

const app = express();

// <!--------------------------!>

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

// <!--------------------------!>

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validateEmail),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom(validateEmail),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

app.use(auth);

app.use('/users', userRouter);

app.use('/movies', movieRouter);

// <!--------------------------!>

app.use(errorLogger);

app.use('*', () => {
  throw new NotFoundError('Страница не найдена!');
});
app.use(errors());
app.use(error);

// <!--------------------------!>

app.listen(PORT);
