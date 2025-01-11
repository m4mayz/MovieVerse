const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public route
router.get("/movie/:movieId", reviewController.getMovieReviews);

// Routes need authentication
router.use(verifyToken);
router.post("/", reviewController.submitReview);
router.get("/user/:userId", reviewController.getUserReviews);
router.put("/:reviewId", reviewController.updateReview);
router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;
