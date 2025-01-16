# MovieVerse API

![MovieVerse](./img/image.png)

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Database Design](#database-design)
3. [Packages](#packages)
4. [API Documentation](#api-documentation)
5. [Public API Integration](#public-api-integration)
6. [Authentication & Middleware](#authentication--middleware)
7. [Testing Results](#testing-results)
8. [End of Report](#end-of-report)

## Introduction

MovieVerse API is a REST API platform that allows users to search for movie information, create personal watchlists, write reviews, and track their search history. This API is built using Node.js, Express, and MySQL, with integration to The Movie Database (TMDB) API.

## Database Design

### ERD (Entity Relationship Diagram)

![ERD Diagram](./img/erd.png)

## Packages

Packages that we used on this project.

<a href="https://www.npmjs.com/package/node"><img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white"></a>
<a href="https://www.npmjs.com/package/express"><img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge"></a>

<a href="https://www.npmjs.com/package/cors"><img src="https://img.shields.io/github/package-json/dependency-version/m4mayz/MovieVerse/cors?color=blue" alt="Package - cors"></a>
<a href="https://www.npmjs.com/package/axios"><img src="https://img.shields.io/github/package-json/dependency-version/m4mayz/MovieVerse/axios?color=blue" alt="Package - axios"></a>
<a href="https://www.npmjs.com/package/bcryptjs"><img src="https://img.shields.io/github/package-json/dependency-version/m4mayz/MovieVerse/bcryptjs?color=blue" alt="Package - bcryptjs"></a>
<a href="https://www.npmjs.com/package/dotenv"><img src="https://img.shields.io/github/package-json/dependency-version/m4mayz/MovieVerse/dotenv?color=blue" alt="Package - dotenv"></a>
<a href="https://www.npmjs.com/package/jsonwebtoken"><img src="https://img.shields.io/github/package-json/dependency-version/m4mayz/MovieVerse/jsonwebtoken?color=blue" alt="Package - jsonwebtoken"></a>
<a href="https://www.npmjs.com/package/mysql2"><img src="https://img.shields.io/github/package-json/dependency-version/m4mayz/MovieVerse/mysql2?color=blue" alt="Package - mysql2"></a>

## API Documentation

### Endpoint Overview (Total: 23 Endpoints)

#### 👤 User Management (4 Endpoints)

1. **Register User**

    ```http
    POST /api/users/signup
    ```

2. **Login User**

    ```http
    POST /api/users/login
    ```

3. **Get User Profile**

    ```http
    GET /api/users/:id/profile
    ```

4. **Update User Profile**
    ```http
    PUT /api/users/:id/profile
    ```

#### 🎬 Movie Management (6 Endpoints)

1. **Search Movies**

    ```http
    GET /api/movies?query=string&page=integer
    ```

2. **Get Popular Movies**

    ```http
    GET /api/movies/popular
    ```

3. **Get Movie Details**

    ```http
    GET /api/movies/:id
    ```

4. **Get Movie Cast**

    ```http
    GET /api/movies/:id/cast
    ```

5. **Get Movies by Genre**

    ```http
    GET /api/movies/genre/:genre
    ```

6. **Get Movies by Year**
    ```http
    GET /api/movies/year/:year
    ```

#### 📋 Watchlist Management (4 Endpoints)

1. **Add to Watchlist**

    ```http
    POST /api/watchlist
    ```

2. **Get User Watchlist**

    ```http
    GET /api/watchlist/:userId
    ```

3. **Remove from Watchlist**

    ```http
    DELETE /api/watchlist/:userId/:movieId
    ```

4. **Get Watchlist Count**
    ```http
    GET /api/watchlist/:userId/count
    ```

#### ⭐ Review Management (5 Endpoints)

1. **Submit Review**

    ```http
    POST /api/reviews
    ```

2. **Get Movie Reviews**

    ```http
    GET /api/reviews/movie/:movieId
    ```

3. **Get User Reviews**

    ```http
    GET /api/reviews/user/:userId
    ```

4. **Update Review**

    ```http
    PUT /api/reviews/:reviewId
    ```

5. **Delete Review**
    ```http
    DELETE /api/reviews/:reviewId
    ```

#### 🔍 Search History Management (4 Endpoints)

1. **Record Search**

    ```http
    POST /api/search-history
    ```

2. **Get User Search History**

    ```http
    GET /api/search-history/:userId
    ```

3. **Delete Search History**

    ```http
    DELETE /api/search-history/:userId
    ```

4. **Get Search Analytics**
    ```http
    GET /api/search-history/:userId/analytics
    ```

#### For more details about API documentation, you can see on the [following page.](https://documenter.getpostman.com/view/40816838/2sAYQUqECL)

## Public API Integration

### TMDB API Integration

```javascript
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const tmdbAxios = axios.create({
    baseURL: TMDB_BASE_URL,
    headers: {
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
        Accept: "application/json",
    },
});
```

## Authentication & Middleware

### JWT Implementation

```javascript
const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
);
```

### Authentication Middleware

```javascript
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "Access denied",
        });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({
            message: "Invalid token",
        });
    }
};
```

## Testing Results

### Endpoint Testing Summary

| Category  | Total Endpoints | Success Rate | Avg Response Time |
| --------- | --------------- | ------------ | ----------------- |
| Users     | 4               | 100%         | 145ms             |
| Movies    | 6               | 100%         | 267ms             |
| Watchlist | 4               | 100%         | 156ms             |
| Reviews   | 5               | 100%         | 178ms             |
| Search    | 4               | 100%         | 134ms             |

### Test Examples using Postman

#### User Registration Test

![user signup](./img/signup.png)

#### Login User Test

![user signup](./img/login.png)

#### Search Movie Test

![user signup](./img/search.png)

## End of Report

MovieVerse API has been successfully implemented by fulfilling all the required criteria:

1. ✅ Database design with 4 related tables
2. ✅ 23 endpoint designs (exceeding the minimum of 20)
3. ✅ Complete documentation for each endpoint
4. ✅ Integration with TMDB API
5. ✅ Middleware and JWT Authorization implementation
6. ✅ Testing for all endpoints
