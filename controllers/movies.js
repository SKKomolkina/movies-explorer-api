const Movie = require('../models/movieSchema');

const NotFoundError = require('../utils/Errors/NotFoundError');
const ForbiddenError = require('../utils/Errors/ForbiddenError');
const BadRequestError = require('../utils/Errors/BadRequestError');

module.exports.getSavedMovies = (req, res, next) => {
  const movieOwner = req.user._id;

  Movie.find({ owner: movieOwner })
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image,
    trailer, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  const owner = req.user._id;

  Movie.findOne({ owner, movieId }).then((data) => {
    if (data) {
      return next(new NotFoundError('Возникла ошибка: фильм с указанным ID не найден!'));
    }

    return Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    })
      .then((movie) => {
        res.status(200).send(movie);
      })
      .catch(next);
  });
};

module.exports.deleteMovieById = (req, res, next) => {
  const owner = req.user._id;

  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Возникла ошибка: фильм с указанным ID не найден!'));
      }
      if (owner !== String(movie.owner)) {
        return next(new ForbiddenError('Вы не можете удалить чужой фильм!'));
      }

      return Movie.remove(movie)
        .then((data) => {
          res.send({ message: data });
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new BadRequestError('Переданы некорректные данные!');
          }
        })
        .catch(next);
    });
};
