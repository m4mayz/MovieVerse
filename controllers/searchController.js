const pool = require("../config/database");

const searchController = {
    // Record search history
    async recordSearch(req, res) {
        try {
            const userId = req.user.id;
            const { query } = req.body;

            if (!query) {
                return res.status(400).json({
                    message: "Search query is required",
                });
            }

            // Insert search history
            await pool.query(
                "INSERT INTO search_history (user_id, query) VALUES (?, ?)",
                [userId, query]
            );

            res.status(201).json({
                message: "Search history recorded successfully",
            });
        } catch (error) {
            console.error("Record search history error:", error);
            res.status(500).json({
                message: "Error recording search history",
            });
        }
    },

    // Get user's search history
    async getUserSearchHistory(req, res) {
        try {
            const userId = req.params.userId;

            // Validate access
            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            // Get search history with pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            // Get total count
            const [countResult] = await pool.query(
                "SELECT COUNT(*) as total FROM search_history WHERE user_id = ?",
                [userId]
            );
            const totalSearches = countResult[0].total;

            // Get search history
            const [searches] = await pool.query(
                `SELECT id, query, searched_at 
                FROM search_history 
                WHERE user_id = ? 
                ORDER BY searched_at DESC 
                LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );

            // Get popular searches for this user
            const [popularSearches] = await pool.query(
                `SELECT query, COUNT(*) as count 
                FROM search_history 
                WHERE user_id = ? 
                GROUP BY query 
                ORDER BY count DESC 
                LIMIT 5`,
                [userId]
            );

            res.json({
                searches: searches.map((search) => ({
                    id: search.id,
                    query: search.query,
                    searched_at: search.searched_at,
                })),
                popular_searches: popularSearches,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(totalSearches / limit),
                    total_searches: totalSearches,
                    has_more: offset + searches.length < totalSearches,
                },
            });
        } catch (error) {
            console.error("Get search history error:", error);
            res.status(500).json({
                message: "Error retrieving search history",
            });
        }
    },

    // Delete specific search history
    async deleteSearchHistory(req, res) {
        try {
            const userId = req.params.userId;
            const { searchIds } = req.body;

            // Validate access
            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            if (searchIds && searchIds.length > 0) {
                // Delete specific search records
                await pool.query(
                    "DELETE FROM search_history WHERE user_id = ? AND id IN (?)",
                    [userId, searchIds]
                );
            } else {
                // Delete all search history for user
                await pool.query(
                    "DELETE FROM search_history WHERE user_id = ?",
                    [userId]
                );
            }

            res.json({
                message: "Search history deleted successfully",
            });
        } catch (error) {
            console.error("Delete search history error:", error);
            res.status(500).json({
                message: "Error deleting search history",
            });
        }
    },

    // Get search analytics
    async getSearchAnalytics(req, res) {
        try {
            const userId = req.params.userId;

            // Validate access
            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({
                    message: "Access denied",
                });
            }

            // Get daily search counts for the last 7 days
            const [dailySearches] = await pool.query(
                `SELECT 
                    DATE(searched_at) as date,
                    COUNT(*) as count
                FROM search_history
                WHERE user_id = ?
                AND searched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(searched_at)
                ORDER BY date DESC`,
                [userId]
            );

            res.json({
                daily_searches: dailySearches,
                total_searches: dailySearches.reduce(
                    (acc, day) => acc + day.count,
                    0
                ),
            });
        } catch (error) {
            console.error("Get search analytics error:", error);
            res.status(500).json({
                message: "Error retrieving search analytics",
            });
        }
    },
};

module.exports = searchController;
