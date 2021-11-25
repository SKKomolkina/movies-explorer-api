require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { errors } = require('celebrate');

// const rateLimit = require('express-rate-limit');
// const rateLimiter = require('./utils/rateLimiter');
//
// const limiter = rateLimit(rateLimiter);

const { requestLogger, errorLogger } = require('./middlewares/logger');
const error = require('./middlewares/error');

const NotFoundError = require('./utils/Errors/NotFoundError');
const { MONGO } = require('./utils/config');

const routers = require('./routes/index');

const allowedCors = [
  'localhost:3000',
  'http://localhost:3000',
  'http://api.movies-skomolkina.nomoredomains.monster',
  'https://api.movies-skomolkina.nomoredomains.monster',
  'https://movies-skomolkina.nomoredomains.monster'
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

app.use('/', routers);

app.use('*', () => {
  throw new NotFoundError('Страница не найдена!');
});

app.use(errorLogger);

app.use(errors());
app.use(error);

app.listen(PORT);
