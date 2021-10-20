const Movie = require('../models/movieSchema');

const NotFoundError = require('../utils/Errors/NotFoundError');
const ForbiddenError = require('../utils/Errors/ForbiddenError');
const ValidationError = require('../utils/Errors/BadRequestError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const movieInfo = req.body;
  const owner = req.user._id;

  Movie.create({ movieInfo, owner })
    .then((movie) => {
      res.status(200).send(movie);
    })
    .catch(next);
};

module.exports.deleteMovieById = (req, res, next) => {
  const { movieId } = req.params;
  const owner = req.user._id;

  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Возникла ошибка: фильм с указанным ID не найден!'));
      }
      if (owner !== String(movie.owner)) {
        return next(new ForbiddenError('Вы не можете удалить чужой фильм!'));
      }

      return Movie.findByIdAndRemove(movieId)
        .then((data) => {
          res.status(200).send(data);
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            throw new ValidationError('Переданы некорректные данные!');
          }
        })
        .catch(next);
    });
};
