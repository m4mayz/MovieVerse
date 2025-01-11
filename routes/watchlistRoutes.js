const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes need authentication
router.use(verifyToken);

router.post("/", watchlistController.addToWatchlist);
router.get("/:userId", watchlistController.getUserWatchlist);
router.delete("/:userId/:movieId", watchlistController.removeFromWatchlist);
router.get("/:userId/count", watchlistController.getWatchlistCount);

module.exports = router;
