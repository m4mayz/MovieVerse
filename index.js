const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
// const watchlistRoutes = require('./routes/watchlistRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');
// const searchHistoryRoutes = require('./routes/searchHistoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
// app.use("/api/watchlist", watchlistRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/search-history", searchHistoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/api`);
});
