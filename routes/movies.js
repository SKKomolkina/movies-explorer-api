const router = require('express').Router();

const { celebrate, Joi } = require('celebrate');
const validateURL = require('../utils/validateUrl');

const { createMovie, deleteMovieById, getSavedMovies } = require('../controllers/movies');

router.get('/movies', getSavedMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(validateURL),
    trailerLink: Joi.string().required().custom(validateURL),
    thumbnail: Joi.string().required().custom(validateURL),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    movieId: Joi.number().required(),
  }),
}), createMovie);

router.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().required().length(24),
  }),
}), deleteMovieById);

module.exports = router;
