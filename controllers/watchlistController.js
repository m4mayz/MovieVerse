const pool = require("../config/database");
const tmdbService = require("../services/tmdbService");

const watchlistController = {
    // Add movie to watchlist
    async addToWatchlist(req, res) {
        try {
            const userId = req.user.id;
            const { movieId } = req.body;

            if (!movieId) {
                return res
                    .status(400)
                    .json({ message: "Movie ID is required" });
            }

            // Check if movie already in watchlist
            const [existing] = await pool.query(
                "SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?",
                [userId, movieId]
            );

            if (existing.length > 0) {
                return res
                    .status(400)
                    .json({ message: "Movie already in watchlist" });
            }

            try {
                await tmdbService.getMovieDetails(movieId);
            } catch (error) {
                return res
                    .status(404)
                    .json({ message: "Movie not found in TMDB" });
            }

            await pool.query(
                "INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)",
                [userId, movieId]
            );

            res.status(201).json({
                message: "Movie added to watchlist successfully",
            });
        } catch (error) {
            console.error("Add to watchlist error:", error);
            res.status(500).json({
                message: "Error adding movie to watchlist",
            });
        }
    },

    // Get user watchlist
    async getUserWatchlist(req, res) {
        try {
            const userId = req.params.userId;

            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({ message: "Access denied" });
            }

            const [watchlistItems] = await pool.query(
                "SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC",
                [userId]
            );

            // Take movie details
            const watchlistWithDetails = await Promise.all(
                watchlistItems.map(async (item) => {
                    const movieDetails = await tmdbService.getMovieDetails(
                        item.movie_id
                    );
                    return {
                        watchlist_id: item.id,
                        added_at: item.added_at,
                        movie: {
                            id: movieDetails.id,
                            title: movieDetails.title,
                            poster_path: movieDetails.poster_path,
                            release_date: movieDetails.release_date,
                            overview: movieDetails.overview,
                        },
                    };
                })
            );

            res.json({
                count: watchlistItems.length,
                watchlist: watchlistWithDetails,
            });
        } catch (error) {
            console.error("Get watchlist error:", error);
            res.status(500).json({ message: "Error retrieving watchlist" });
        }
    },

    // Remove movie from watchlist
    async removeFromWatchlist(req, res) {
        try {
            const userId = req.params.userId;
            const movieId = req.params.movieId;

            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({ message: "Access denied" });
            }

            const [result] = await pool.query(
                "DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?",
                [userId, movieId]
            );

            if (result.affectedRows === 0) {
                return res
                    .status(404)
                    .json({ message: "Movie not found in watchlist" });
            }

            res.json({ message: "Movie removed from watchlist successfully" });
        } catch (error) {
            console.error("Remove from watchlist error:", error);
            res.status(500).json({
                message: "Error removing movie from watchlist",
            });
        }
    },

    // Get watchlist count
    async getWatchlistCount(req, res) {
        try {
            const userId = req.params.userId;

            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({ message: "Access denied" });
            }

            const [result] = await pool.query(
                "SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?",
                [userId]
            );

            res.json({ count: result[0].count });
        } catch (error) {
            console.error("Get watchlist count error:", error);
            res.status(500).json({ message: "Error getting watchlist count" });
        }
    },
};

module.exports = watchlistController;
