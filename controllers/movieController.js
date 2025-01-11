const tmdbService = require("../services/tmdbService");
const pool = require("../config/database");

const movieController = {
    // search movies
    async searchMovies(req, res) {
        try {
            const { query, page } = req.query;
            if (!query) {
                return res
                    .status(400)
                    .json({ message: "Search query is required" });
            }

            const movies = await tmdbService.searchMovies(query, page);

            // simpan histori pencarian jika pengguna sudah login
            if (req.user) {
                await pool.query(
                    "INSERT INTO search_history (user_id, query) VALUES (?, ?)",
                    [req.user.id, query]
                );
            }

            res.json(movies);
        } catch (error) {
            console.error("Search movies error:", error);
            res.status(500).json({ message: "Error searching movies" });
        }
    },

    // mengambil data detail movie
    async getMovieDetails(req, res) {
        try {
            const { id } = req.params;
            const movie = await tmdbService.getMovieDetails(id);
            res.json(movie);
        } catch (error) {
            console.error("Get movie details error:", error);
            res.status(500).json({ message: "Error getting movie details" });
        }
    },

    // mengambil data popular movies
    async getPopularMovies(req, res) {
        try {
            const { page } = req.query;
            const movies = await tmdbService.getPopularMovies(page);
            res.json(movies);
        } catch (error) {
            console.error("Get popular movies error:", error);
            res.status(500).json({ message: "Error getting popular movies" });
        }
    },

    // mengambil data cast
    async getMovieCast(req, res) {
        try {
            const { id } = req.params;
            const movie = await tmdbService.getMovieDetails(id);
            res.json(movie.credits.cast);
        } catch (error) {
            console.error("Get movie cast error:", error);
            res.status(500).json({ message: "Error getting movie cast" });
        }
    },

    // mencari movie by genre
    async getMoviesByGenre(req, res) {
        try {
            const { genre } = req.params;
            const { page } = req.query;
            const movies = await tmdbService.getMoviesByGenre(genre, page);
            res.json(movies);
        } catch (error) {
            console.error("Get movies by genre error:", error);
            res.status(500).json({ message: "Error getting movies by genre" });
        }
    },

    // mencari movie by year
    async getMoviesByYear(req, res) {
        try {
            const { year } = req.params;
            const { page } = req.query;
            const movies = await tmdbService.getMoviesByYear(year, page);
            res.json(movies);
        } catch (error) {
            console.error("Get movies by year error:", error);
            res.status(500).json({ message: "Error getting movies by year" });
        }
    },
};

module.exports = movieController;
