require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const { celebrate, Joi, errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const error = require('./middlewares/error');

const auth = require('./middlewares/auth');
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const { login, createUser } = require('./controllers/users');

const NotFoundError = require('./utils/Errors/NotFoundError');
const { MONGO } = require('./utils/config');

const allowedCors = [
  'localhost:3000',
  'http://localhost:3000',
  'http://movies-skomolkina.nomoredomains.monster',
  'https://movies-skomolkina.nomoredomains.monster',
];

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

mongoose.connect(MONGO);

app.use((req, res, next) => {
  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  const { origin } = req.headers;
  const { method } = req;
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  if (method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    res.header('Access-Control-Allow-Headers', requestHeaders);
    return res.status(200).send();
  }

  return next();
});

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required().min(2).max(30),
  }),
}), createUser);

app.use(auth);

app.use('/users', userRouter);

app.use('/movies', movieRouter);

app.use(errorLogger);

app.use('*', () => {
  throw new NotFoundError('Страница не найдена!');
});
app.use(errors());
app.use(error);

app.listen(PORT);
