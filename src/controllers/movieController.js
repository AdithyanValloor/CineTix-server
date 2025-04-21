import { Movie } from "../models/moviesModel.js";

// Get all movies by query
export const getAllMoviesByQuery = async (req, res) => {
    try {
      const { query } = req.query;
  
      if (!query || !query.trim()) {
        return res.status(400).json({ message: "Search query is required" });
      }
  
      const movies = await Movie.find({
        title: { $regex: query.trim(), $options: "i" },
      });
  
      return res.status(200).json({
        data: movies,
        count: movies.length,
        message: movies.length
          ? "Movies fetched successfully"
          : "No movies found",
      });
    } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

// Get movie by id
export const getMovieById = async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        res.json({ data: movie, message: "Movie fetched successfully" });

    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

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

// List all movies in a theater
export const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();

        if (!movies.length) return res.json({ message: "No movies available" });

        res.json({ data: movies, message: "Movies fetched successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Add movie
export const addMovie = async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            language,
            genre,
            year,
            releaseDate,
            director,
            certification,
            rating
        } = req.body;
        
        // Cast & crew comes as indexed fields, so parse it manually
        const castAndCrew = [];
        for (let i = 0; req.body[`castAndCrew[${i}][name]`]; i++) {
        castAndCrew.push({
            name: req.body[`castAndCrew[${i}][name]`],
            role: req.body[`castAndCrew[${i}][role]`],
            character: req.body[`castAndCrew[${i}][character]`],
            image: req.files?.castAndCrew?.find(file => file.originalname === req.body[`castAndCrew[${i}][name]`])?.path || ''
        });
        }
          

        const posters = req.files?.posters?.map(file => file.secure_url) || [];
        const banners = req.files?.banners?.map(file => file.secure_url) || [];

        const updatedCastAndCrew = castAndCrew.map(member => ({
            ...member,
            image: req.files?.castAndCrew?.find(file => file.originalname === member.name)?.secure_url || ""
        }));

        const newMovie = new Movie({
            title,
            description,
            duration,
            language,
            genre,
            year,
            releaseDate,
            director,
            certification,
            castAndCrew: updatedCastAndCrew,
            posters, 
            rating,
            banners, 
            exhibitor: req.user._id
        });

        await newMovie.save();

        res.status(201).json({ data: newMovie, message: "Movie added successfully" });

    } catch (error) {
        console.error('Error adding movie:', error);  // Log the error for debugging
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Update movie details 
export const updateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const updates = req.body;

        if (req.files?.posters) {
            updates.posters = req.files.posters.map(file => file.path);
        }
        if (req.files?.banners) {
            updates.banners = req.files.banners.map(file => file.path);
        }

        // Update castAndCrew images if provided
        if (updates.castAndCrew) {
            updates.castAndCrew = updates.castAndCrew.map(member => ({
                ...member,
                image: req.files?.castAndCrew?.find(file => file.originalname === member.name)?.path || member.image
            }));
        }

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
