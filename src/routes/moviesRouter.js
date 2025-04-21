import express from "express";
import { 
    listMoviesByTheater, 
    addMovie, 
    updateMovie, 
    deleteMovie, 
    getAllMoviesByQuery,
    getMovieById,
    getAllMovies
} from "../controllers/movieController.js";
import { protect, authorizeExhibitor, authorizeAdmin } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js"; 

const router = express.Router();

// List all movies
router.get("/", getAllMoviesByQuery);

// List all movies
router.get("/all-movies", getAllMovies);

// Get movie by ID
router.get("/:movieId", getMovieById);

// List movies by theater
router.get("/theater/:theaterId", listMoviesByTheater);

// Add a movie 
router.post(
    "/add", 
    protect, 
    authorizeAdmin, 
    upload.fields([
        { name: "posters", maxCount: 5 }, 
        { name: "banners", maxCount: 3 },
        { name: "castAndCrew", maxCount: 30 } 
    ]), 
    addMovie
);

// Update a movie 
router.put(
    "/update/:movieId", 
    protect, 
    authorizeAdmin, 
    upload.fields([
        { name: "posters", maxCount: 5 }, 
        { name: "banners", maxCount: 3 },
        { name: "castAndCrew", maxCount: 30 } 
    ]), 
    updateMovie
);

// Delete a movie
router.delete("/delete/:movieId", protect, authorizeAdmin, deleteMovie);

export { router as moviesRouter };
