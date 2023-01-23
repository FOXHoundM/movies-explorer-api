const Movie = require('../models/movie');
const {
  BAD_REQUEST_MESSAGE,
  BAD_REQUEST_ERROR,
  CREATED,
  OK,
  NOT_FOUND_ERROR,
  NOT_FOUND_ERROR_MESSAGE,
  DELETED_SUCCESS,
  FORBIDDEN_ERROR,
  FORBIDDEN_ERROR_MESSAGE,
} = require('../errors/errors');

module.exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});

    return res.status(OK)
      .json(movies);
  } catch (err) {
    return next(err);
  }
};

module.exports.createMovie = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const movie = await Movie.create({ owner: ownerId, ...req.body });

    return res.status(CREATED)
      .json(movie);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(BAD_REQUEST_ERROR)
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    return next(err);
  }
};

module.exports.deleteMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const userId = req.user._id;

    const movie = await Movie.findById({ _id: movieId });

    if (movie === null) {
      res.status(NOT_FOUND_ERROR)
        .json({ message: `Movie ${NOT_FOUND_ERROR_MESSAGE}` });
    }
    if (movie.owner.valueOf() === userId) {
      await movie.remove();
    } else {
      res.status(FORBIDDEN_ERROR)
        .json({ message: FORBIDDEN_ERROR_MESSAGE });
    }

    return res.status(OK)
      .json({ message: DELETED_SUCCESS });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(BAD_REQUEST_ERROR)
        .json({ message: BAD_REQUEST_MESSAGE });
    }
    return next(err);
  }
};
