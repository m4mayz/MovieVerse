const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const userController = {
    // Register new user
    async signup(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validate input
            if (!username || !email || !password) {
                return res.status(400).json({
                    message: "Please provide username, email and password",
                });
            }

            // Check if user already exists
            const [existingUsers] = await pool.query(
                "SELECT * FROM users WHERE email = ? OR username = ?",
                [email, username]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    message: "User with this email or username already exists",
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const [result] = await pool.query(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                [username, email, hashedPassword]
            );

            // Create token
            const token = jwt.sign(
                { id: result.insertId, username },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(201).json({
                message: "User created successfully",
                token,
                user: {
                    id: result.insertId,
                    username,
                    email,
                },
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                message: "Error creating user",
            });
        }
    },

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    message: "Please provide email and password",
                });
            }

            // Check if user exists
            const [users] = await pool.query(
                "SELECT * FROM users WHERE email = ?",
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password",
                });
            }

            const user = users[0];

            // Check password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({
                    message: "Invalid email or password",
                });
            }

            // Create token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                message: "Error logging in",
            });
        }
    },

    // Get user profile
    async getProfile(req, res) {
        try {
            const userId = req.params.id;

            // Check if user exists
            const [users] = await pool.query(
                "SELECT id, username, email, created_at FROM users WHERE id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            res.json({
                user: users[0],
            });
        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({
                message: "Error retrieving user profile",
            });
        }
    },

    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.params.id;
            const { username, email } = req.body;

            // Validate if user is updating their own profile
            if (req.user.id !== parseInt(userId)) {
                return res.status(403).json({
                    message: "Not authorized to update this profile",
                });
            }

            // Check if user exists
            const [users] = await pool.query(
                "SELECT * FROM users WHERE id = ?",
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            // Update user
            await pool.query(
                "UPDATE users SET username = ?, email = ? WHERE id = ?",
                [username, email, userId]
            );

            res.json({
                message: "Profile updated successfully",
                user: {
                    id: parseInt(userId),
                    username,
                    email,
                },
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({
                message: "Error updating user profile",
            });
        }
    },
};

module.exports = userController;
