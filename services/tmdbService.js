const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

// Create a custom Axios instance
const tmdbAxios = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: "application/json",
    },
});

const tmdbService = {
    async searchMovies(query, page = 1) {
        try {
            const response = await tmdbAxios.get("/search/movie", {
                params: {
                    query,
                    page,
                    include_adult: false,
                },
            });
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Search Error:",
                error.response?.data || error.message
            );
            throw new Error("Error searching movies");
        }
    },

    async getMovieDetails(movieId) {
        try {
            const response = await tmdbAxios.get(`/movie/${movieId}`, {
                params: {
                    append_to_response: "credits,reviews",
                },
            });
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Details Error:",
                error.response?.data || error.message
            );
            throw new Error("Error getting movie details");
        }
    },

    async getPopularMovies(page = 1) {
        try {
            const response = await tmdbAxios.get("/movie/popular", {
                params: { page },
            });
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Popular Error:",
                error.response?.data || error.message
            );
            throw new Error("Error getting popular movies");
        }
    },

    async getMoviesByGenre(genreId, page = 1) {
        try {
            const response = await tmdbAxios.get("/discover/movie", {
                params: {
                    with_genres: genreId,
                    page,
                    sort_by: "popularity.desc",
                },
            });
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Genre Error:",
                error.response?.data || error.message
            );
            throw new Error("Error getting movies by genre");
        }
    },

    async getMoviesByYear(year, page = 1) {
        try {
            const response = await tmdbAxios.get("/discover/movie", {
                params: {
                    primary_release_year: year,
                    page,
                    sort_by: "popularity.desc",
                },
            });
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Year Error:",
                error.response?.data || error.message
            );
            throw new Error("Error getting movies by year");
        }
    },

    async getMovieCredits(movieId) {
        try {
            const response = await tmdbAxios.get(`/movie/${movieId}/credits`);
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Credits Error:",
                error.response?.data || error.message
            );
            throw new Error("Error getting movie credits");
        }
    },

    async getMovieReviews(movieId, page = 1) {
        try {
            const response = await tmdbAxios.get(`/movie/${movieId}/reviews`, {
                params: { page },
            });
            return response.data;
        } catch (error) {
            console.error(
                "TMDB Reviews Error:",
                error.response?.data || error.message
            );
            throw new Error("Error getting movie reviews");
        }
    },
};

module.exports = tmdbService;
