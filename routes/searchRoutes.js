const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { verifyToken } = require("../middleware/authMiddleware");

// All routes need authentication
router.use(verifyToken);

router.post("/", searchController.recordSearch);
router.get("/:userId", searchController.getUserSearchHistory);
router.delete("/:userId", searchController.deleteSearchHistory);
router.get("/:userId/analytics", searchController.getSearchAnalytics);

module.exports = router;
