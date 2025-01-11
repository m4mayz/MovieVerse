const pool = require("../config/database");
const tmdbService = require("../services/tmdbService");

const reviewController = {
    // Submit review
    async submitReview(req, res) {
        try {
            const userId = req.user.id;
            const { movieId, rating, comment } = req.body;

            if (!movieId || !rating) {
                return res.status(400).json({
                    message: "Movie ID and rating are required",
                });
            }

            if (rating < 1 || rating > 10) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 10",
                });
            }

            // cek apakah movieId valid
            try {
                await tmdbService.getMovieDetails(movieId);
            } catch (error) {
                return res.status(404).json({
                    message: "Movie not found in TMDB",
                });
            }

            // cek apakah user sudah pernah review movie ini
            const [existingReview] = await pool.query(
                "SELECT * FROM reviews WHERE user_id = ? AND movie_id = ?",
                [userId, movieId]
            );

            if (existingReview.length > 0) {
                return res.status(400).json({
                    message: "You have already reviewed this movie",
                });
            }

            // kalo belum pernah review, submit
            const [result] = await pool.query(
                "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)",
                [userId, movieId, rating, comment || null]
            );

            res.status(201).json({
                message: "Review submitted successfully",
                review: {
                    id: result.insertId,
                    movieId,
                    rating,
                    comment,
                    created_at: new Date(),
                },
            });
        } catch (error) {
            console.error("Submit review error:", error);
            res.status(500).json({ message: "Error submitting review" });
        }
    },

    // get movie reviews
    async getMovieReviews(req, res) {
        try {
            const { movieId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // menghitung total review
            const [countResult] = await pool.query(
                "SELECT COUNT(*) as total FROM reviews WHERE movie_id = ?",
                [movieId]
            );
            const totalReviews = countResult[0].total;

            // get reviews with user info
            const [reviews] = await pool.query(
                `SELECT r.*, u.username 
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                WHERE r.movie_id = ? 
                ORDER BY r.created_at DESC 
                LIMIT ? OFFSET ?`,
                [movieId, limit, offset]
            );

            // mengambil detail movie dari TMDB
            const movieDetails = await tmdbService.getMovieDetails(movieId);

            res.json({
                movie: {
                    id: movieDetails.id,
                    title: movieDetails.title,
                    poster_path: movieDetails.poster_path,
                },
                reviews: reviews.map((review) => ({
                    id: review.id,
                    rating: review.rating,
                    comment: review.comment,
                    username: review.username,
                    created_at: review.created_at,
                })),
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(totalReviews / limit),
                    total_reviews: totalReviews,
                    has_more: offset + reviews.length < totalReviews,
                },
            });
        } catch (error) {
            console.error("Get movie reviews error:", error);
            res.status(500).json({ message: "Error retrieving reviews" });
        }
    },

    // menampilkan semua review user
    async getUserReviews(req, res) {
        try {
            const { userId } = req.params;

            // Validasi akses
            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({ message: "Access denied" });
            }

            const [reviews] = await pool.query(
                "SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC",
                [userId]
            );

            // Get movie details for each review
            const reviewsWithDetails = await Promise.all(
                reviews.map(async (review) => {
                    const movieDetails = await tmdbService.getMovieDetails(
                        review.movie_id
                    );
                    return {
                        id: review.id,
                        rating: review.rating,
                        comment: review.comment,
                        created_at: review.created_at,
                        movie: {
                            id: movieDetails.id,
                            title: movieDetails.title,
                            poster_path: movieDetails.poster_path,
                        },
                    };
                })
            );

            res.json({
                count: reviews.length,
                reviews: reviewsWithDetails,
            });
        } catch (error) {
            console.error("Get user reviews error:", error);
            res.status(500).json({ message: "Error retrieving user reviews" });
        }
    },

    // Update review
    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            // Validasi rating
            if (rating && (rating < 1 || rating > 10)) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 10",
                });
            }

            // Cek kepemilikan review
            const [review] = await pool.query(
                "SELECT * FROM reviews WHERE id = ? AND user_id = ?",
                [reviewId, userId]
            );

            if (review.length === 0) {
                return res.status(404).json({
                    message: "Review not found or unauthorized",
                });
            }

            // Update review
            await pool.query(
                "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
                [
                    rating || review[0].rating,
                    comment || review[0].comment,
                    reviewId,
                ]
            );

            res.json({ message: "Review updated successfully" });
        } catch (error) {
            console.error("Update review error:", error);
            res.status(500).json({ message: "Error updating review" });
        }
    },

    // Delete review
    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;

            const [result] = await pool.query(
                "DELETE FROM reviews WHERE id = ? AND user_id = ?",
                [reviewId, userId]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Review not found or unauthorized",
                });
            }

            res.json({ message: "Review deleted successfully" });
        } catch (error) {
            console.error("Delete review error:", error);
            res.status(500).json({ message: "Error deleting review" });
        }
    },
};

module.exports = reviewController;
