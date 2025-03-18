import { Movie } from "../models/moviesModel.js";

// Get all movies
export const getAllMovies = async (req, res) => {
    try {

        // Get all movie query 
        const movies = await Movie.find()

        // Check if movies exist
        if(!movies.length) return res.status(404).json({ message: "No movies available" });
        
        res.json({ data: movies, message: "Movies fetched successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
        
    }
}

// List all movies in a theater
export const listMoviesByTheater = async (req, res) => {
    try {
        const movies = await Movie.find({ theaters: req.params.theaterId });

        if (!movies.length) return res.json({ message: "No movies available" });

        res.json({ data: movies, message: "Movies fetched successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Add a new movie to a theater
export const addMovie = async (req, res) => {
    try {
        const { title, description, duration, language, genre, year, director, cast} = req.body;

        if (!title || !description || !duration || !language || !genre) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newMovie = new Movie({
            title,
            description,
            duration,
            language,
            genre,
            year,
            director,
            cast,
            exhibitor: req.user._id
        });

        await newMovie.save();

        res.status(201).json({ data: newMovie, message: "Movie added successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Update movie details
export const updateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const updates = req.body;

        const updatedMovie = await Movie.findByIdAndUpdate(movieId, updates, { new: true });

        if (!updatedMovie) return res.status(404).json({ message: "Movie not found" });

        res.json({ data: updatedMovie, message: "Movie updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Delete a movie
export const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;

        const deletedMovie = await Movie.findByIdAndDelete(movieId);

        if (!deletedMovie) return res.status(404).json({ message: "Movie not found" });

        res.json({ message: "Movie deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
