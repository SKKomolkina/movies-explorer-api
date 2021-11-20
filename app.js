require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const error = require('./middlewares/error');

const NotFoundError = require('./utils/Errors/NotFoundError');
// const { MONGO } = require('./utils/config');

const routers = require('./routes/index');

const allowedCors = [
  'localhost:3000',
  'http://localhost:3000',
  'http://api.movies-skomolkina.nomoredomains.monster',
  'https://api.movies-skomolkina.nomoredomains.monster',
  'https://api.movies-skomolkina.nomoredomains.monster/'
];

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(requestLogger);

const db = 'mongodb://localhost:27017/dbmovies';
mongoose.connect(db);

// mongoose.connect('mongodb://localhost:27017/', {
//   dbName: 'dimplomamovies', useNewUrlParser: true, useUnifiedTopology: true
// }, err => err ? console.log(err) : console.log('Connected to database'));

app.use((req, res,
         next) => {
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

app.use('/', routers);

app.use(errorLogger);

app.use(errors());
app.use(error);

app.use('*', () => {
  throw new NotFoundError('Страница не найдена!');
});

app.listen(PORT);
