import { Movie } from "../models/moviesModel.js";
import { Review } from "../models/reviewsModel.js";
import { Theater } from "../models/theatersModel.js";

export const addReview = async (req, res) => {
    try {
        const { theaterId, movieId, rating, comment } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const user = req.user.id

        // Validate rating range
        if (rating > 5 || rating < 1) {
            return res.status(400).json({ message: "Please provide a rating between 1 and 5" })
        }

        // Check if review already exists
        const exists = await Review.findOne({user, ...(movieId && {movie: movieId}), ...(theaterId && {theater: theaterId}) })

        if(exists) return res.status(400).json({ message: "Review already exists" })

        // Validate theater existence
        if (theaterId) {
            const theater = await Theater.findById(theaterId)
            if (!theater) return res.status(404).json({ message: "Theater not found" })
        }

        // Validate movie existence
        if (movieId) {
            const movie = await Movie.findById(movieId)
            if (!movie) return res.status(404).json({ message: "Movie not found" })
        }

        // Create review
        const review = new Review(
            { user, ...(theaterId && { theater: theaterId }), ...(movieId && { movie: movieId }),  rating, comment }
        );

        await review.save()

        res.json({ data: review, message: "Review Added" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
};

export const updateReview = async (req, res) => {
    try {
        const { theaterId, movieId, rating, comment } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const user = req.user.id

        // Validate theater existence
        if (theaterId) {
            const theater = await Theater.findById(theaterId)
            if (!theater) return res.status(404).json({ message: "Theater not found" })
        }

        // Validate movie existence
        if (movieId) {
            const movie = await Movie.findById(movieId)
            if (!movie) return res.status(404).json({ message: "Movie not found" })
        }

        // Validate rating range
        if (rating > 5 || rating < 1) {
            return res.status(400).json({ message: "Please provide a rating between 1 and 5" })
        }

        // Update review
        const review = await Review.findOneAndUpdate(
            { user, ...(theaterId && { theater: theaterId }), ...(movieId && { movie: movieId }) },
            { rating, comment },
            { new: true, upsert: true }
        );

        res.json({ data: review, message: "Review updated" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
};

export const getReview = async (req, res) => {
    try {
        const { movieId, theaterId } = req.query

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const userId = req.user.id

        if (movieId) {
            const movie = await Movie.findById(movieId);
            if (!movie) return res.status(404).json({ message: "Movie not found" })
        }

        if (theaterId) {
            const theater = await Theater.findById(theaterId);
            if (!theater) return res.status(404).json({ message: "Theater not found" })
        }

        const review = await Review.findOne({
            user: userId,
            ...(movieId && { movie: movieId }),
            ...(theaterId && { theater: theaterId }),
        });

        if (!review) return res.status(404).json({ message: "Review not found" })

        res.json({ data: review, message: "Review found" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { movieId, theaterId } = req.query

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" })
        }

        const userId = req.user.id;

        const review = await Review.findOneAndDelete({
            user: userId,
            ...(movieId && { movie: movieId }),
            ...(theaterId && { theater: theaterId }),
        });

        if (!review) return res.status(404).json({ message: "Review not found" })

        res.json({ data: review, message: "Review deleted successfully" })

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" })
    }
};

export const getAllReviews = async (req, res) => {
    try {
        const { movieId, theaterId } = req.query

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" })
        }

        //  Filter object
        const filter = {}
        if (movieId) filter.movie = movieId
        if (theaterId) filter.theater = theaterId

        const reviews = await Review.find(filter)

        if (!reviews.length) return res.status(404).json({ message: "No reviews found" });

        res.json({ data: reviews, message: "Reviews found" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const averageRating = async (req, res) => {
    try {
        // Get movie or theater ID
        const { movieId, theaterId } = req.params

        //  Filter object
        const filter = {}
        if (movieId) filter.movie = movieId
        if (theaterId) filter.theater = theaterId

        // Fetch rating on filter
        const reviews = await Review.find(filter)

        // Return 0 if no review exist
        if(reviews.length === 0) return res.json({ data: 0, message: "No reviews found" })

        const averageRating = Number((reviews.reduce((sum, review) => sum + review.rating,0)/reviews.length).toFixed(1))

        res.json({ data: averageRating, message: "Average rating" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
}
