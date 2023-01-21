const Movie = require('../models/movie');

module.exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({});

    return res.json(movies);
  } catch (err) {
    return next(err);
  }
};

module.exports.createMovie = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const movie = await Movie.create({ owner: ownerId, ...req.body });

    return res.status(201).json(movie);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ message: 'Неправильно данные введены' });
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
      res.status(404).json({ message: 'Movie not found' });
    }
    if (movie.owner.valueOf() === userId) {
      await movie.remove();
    } else {
      res.status(403).json({ message: 'Невозможно удалить' });
    }

    return res.json({ message: 'Deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Неправильно данные введены' });
    }
    return next(err);
  }
};
