require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');

const { PORT = 3001 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/bitfilmsdb');

app.use('/users', userRouter);

app.use('/movies', movieRouter);

app.listen(PORT, () => {
  console.log(`App listening on ${PORT}`);
});
