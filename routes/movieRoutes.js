const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.get("/", movieController.searchMovies);
router.get("/popular", movieController.getPopularMovies);
router.get("/:id", movieController.getMovieDetails);
router.get("/:id/cast", movieController.getMovieCast);
router.get("/genre/:genre", movieController.getMoviesByGenre);
router.get("/year/:year", movieController.getMoviesByYear);

module.exports = router;
