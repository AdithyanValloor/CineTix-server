import { Movie } from "../models/moviesModel.js";
import { Review } from "../models/reviewsModel.js";
import { Theater } from "../models/theatersModel.js";

export const addReview = async (req, res) => {
    try {
        const { theaterId, movieId, rating, comment, reviewType } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const user = req.user.id;

        // Validate reviewType
        if (!["movie", "theater", "feedback"].includes(reviewType)) {
            return res.status(400).json({ message: "Invalid review type" });
        }

        // Validate rating range
        if (rating > 5 || rating < 1) {
            return res.status(400).json({ message: "Please provide a rating between 1 and 5" });
        }

        // Check if review already exists
        const exists = await Review.findOne({ user, ...(movieId && { movie: movieId }), ...(theaterId && { theater: theaterId }), reviewType });

        if (exists) return res.status(400).json({ message: "Review already exists" });

        // Validate movie and theater existence for relevant review types
        if (reviewType === "theater" && theaterId) {
            const theater = await Theater.findById(theaterId);
            if (!theater) return res.status(404).json({ message: "Theater not found" });
        }

        if (reviewType === "movie" && movieId) {
            const movie = await Movie.findById(movieId);
            if (!movie) return res.status(404).json({ message: "Movie not found" });
        }

        // Create review
        const review = new Review({
            user,
            reviewType,
            ...(reviewType === "movie" && { movie: movieId }),
            ...(reviewType === "theater" && { theater: theaterId }),
            rating,
            comment: reviewType === "feedback" ? undefined : comment, // Don't require comment for feedback
        });

        await review.save();

        res.json({ data: review, message: "Review Added" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { theaterId, movieId, rating, comment, reviewType } = req.body;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const user = req.user.id;

        // Validate reviewType
        if (!["movie", "theater", "feedback"].includes(reviewType)) {
            return res.status(400).json({ message: "Invalid review type" });
        }

        // Validate rating range
        if (rating > 5 || rating < 1) {
            return res.status(400).json({ message: "Please provide a rating between 1 and 5" });
        }

        // Validate movie and theater existence for relevant review types
        if (reviewType === "theater" && theaterId) {
            const theater = await Theater.findById(theaterId);
            if (!theater) return res.status(404).json({ message: "Theater not found" });
        }

        if (reviewType === "movie" && movieId) {
            const movie = await Movie.findById(movieId);
            if (!movie) return res.status(404).json({ message: "Movie not found" });
        }

        // Update review
        const review = await Review.findOneAndUpdate(
            { user, ...(reviewType === "movie" && { movie: movieId }), ...(reviewType === "theater" && { theater: theaterId }) },
            { rating, comment },
            { new: true, upsert: true }
        );

        res.json({ data: review, message: "Review updated" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

export const getReview = async (req, res) => {
    try {
      const { movieId, theaterId } = req.query;
  
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
  
      const userId = req.user.id;
  
      // Validate movie and theater existence
      if (movieId) {
        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ message: "Movie not found" });
      }
  
      if (theaterId) {
        const theater = await Theater.findById(theaterId);
        if (!theater) return res.status(404).json({ message: "Theater not found" });
      }
  
      const review = await Review.findOne({
        user: userId,
        ...(movieId && { movie: movieId }),
        ...(theaterId && { theater: theaterId }),
      });
  
      // Instead of sending 404, return data: null when no review is found
      return res.status(200).json({
        data: review || null,
        message: review ? "Review found" : "No review yet",
      });
  
    } catch (error) {
      res
        .status(error.statusCode || 500)
        .json({ message: error.message || "Internal server error" });
    }
};
  

export const deleteReview = async (req, res) => {
    try {
        const { movieId, theaterId } = req.query;

        // Ensure user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const userId = req.user.id;

        const review = await Review.findOneAndDelete({
            user: userId,
            ...(movieId && { movie: movieId }),
            ...(theaterId && { theater: theaterId }),
        });

        if (!review) return res.status(404).json({ message: "Review not found" });

        res.json({ data: review, message: "Review deleted successfully" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};

// Controller for fetching reviews
export const getReviewsForTheater = async (req, res) => {
    const { theaterId } = req.params;

    console.log(theaterId);

    try {
      if (!theaterId) {
        return res.status(400).json({ message: 'Theater ID is required.' });
      }

      // Fetch reviews for the theater
      const reviews = await Review.find({ theater: theaterId, reviewType: "theater" }).populate("user theater");

      // Return an empty array if no reviews are found
      return res.status(200).json({ data: reviews });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
};

// Get reviews
export const getAllReviews = async (req, res) => {
  try {
    const { movieId, theaterId, reviewType } = req.query;

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Build filter object
    const filter = {};
    if (movieId) filter.movie = movieId;
    if (theaterId) filter.theater = theaterId;
    if (reviewType) filter.reviewType = reviewType;

    const reviews = await Review.find(filter)
      .populate("movie", "title posterUrl language releaseDate") 
      .populate("user", "firstName lastName profilePicture") 
      .populate("theater", "name location"); 

    res.json({
      success: true,
      data: reviews,
      message: reviews.length ? "Reviews found" : "No reviews available",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

  

export const averageRating = async (req, res) => {
    try {
        // Get movie or theater ID
        const { movieId, theaterId } = req.params;

        //  Filter object
        const filter = {};
        if (movieId) filter.movie = movieId;
        if (theaterId) filter.theater = theaterId;

        // Fetch rating on filter
        const reviews = await Review.find(filter);

        // Return 0 if no review exists
        if (reviews.length === 0) return res.json({ data: 0, message: "No reviews found" });

        const averageRating = Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));

        res.json({ data: averageRating, message: "Average rating" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
};
