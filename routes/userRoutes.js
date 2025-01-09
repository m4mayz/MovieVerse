const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", userController.signup);
router.post("/login", userController.login);

// Protected routes
router.get("/:id/profile", verifyToken, userController.getProfile);
router.put("/:id/profile", verifyToken, userController.updateProfile);

module.exports = router;
