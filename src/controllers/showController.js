import { Show } from "../models/showsModel.js";
import { Theater } from "../models/theatersModel.js";
import { ShowSeatStatus } from "../models/showSeatStatusModel.js";
import { Movie } from "../models/moviesModel.js";
import { generateShowSeatStatuses } from "../utils/generateSeatStatus.js"

// Create Show
export const createShow = async (req, res) => {
    try {
      const { movie, theater, date, time } = req.body;
  
      if (!movie || !theater || !date || !time) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const movieData = await Movie.findById(movie);
      if (!movieData) return res.status(404).json({ message: "Movie not found" });
  
      const theaterData = await Theater.findById(theater);
      if (!theaterData) return res.status(404).json({ message: "Theater not found" });
  
     
      if (theaterData.exhibitor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You do not own this theater" });
      }
  
      const existingShow = await Show.findOne({ movie, theater, date, time });
      if (existingShow) {
        return res.status(409).json({ message: "Show already exists for the same movie, theater, date, and time" });
      }
  
     
      const show = await Show.create({
        movie,
        theater,
        date,
        time,
        exhibitor: req.user._id,
      });
  
      await generateShowSeatStatuses(show._id, theater);
  
      // 🔗 Optionally link movie to this theater
      await Movie.findByIdAndUpdate(movie, {
        $addToSet: { theaters: theater },
      });
  
      res.status(201).json({
        data: show,
        message: "Show created and seats generated successfully",
      });
  
    } catch (error) {
      console.error("Error creating show:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
  

// Get available seats
export const getAvailableSeats = async (req, res) => {
    try {
        const { showId } = req.params;

        const seats = await ShowSeatStatus.find({ show: showId })
            .select('_id seat seatType isBooked price rows columns');

        res.status(200).json({ success: true, seats });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch seats' });
    }
}

// Get Shows  
export const getShows = async (req, res) => {
    try {
      const { movie, theater, type } = req.query;
      let filter = {};
  
      // Apply movie or theater filters
      if (movie) filter.movie = movie;
      if (theater) filter.theater = theater;
  
      // Filter based on type: "upcoming" or "past"
      const today = new Date();
      if (type === "upcoming") {
        filter.date = { $gte: today };
      } else if (type === "past") {
        filter.date = { $lt: today };
      }
  
      const shows = await Show.find(filter).populate("movie theater").sort({ date: -1 });
  
      res.json({ data: shows });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

// Get exhibitor shows
export const getExhibitorShows = async (req, res) => {
  try {
    const exhibitorId = req.user._id; // assuming you're using auth middleware
    // Step 1: Find all theaters owned by this exhibitor
    const theaters = await Theater.find({ exhibitor: exhibitorId }).select('_id');

    const theaterIds = theaters.map(theater => theater._id);

    // Step 2: Find all shows for those theaters
    const shows = await Show.find({ theater: { $in: theaterIds } })
      .populate("movie theater")
      .sort({ date: -1 });

    res.json({ data: shows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  
// Get currently running or upcoming movies by theater
export const getMoviesByTheater = async (req, res) => {
  try {
      const { theaterId } = req.params;

      // Set today's date at 00:00:00 to compare with show dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Step 1: Find unique movie IDs for upcoming or current shows in the given theater
      const movieIds = await Show.distinct("movie", {
          theater: theaterId,
          date: { $gte: today }, // Only future or today's shows
      });

      // Step 2: Fetch the corresponding movie documents
      const movies = await Movie.find({ _id: { $in: movieIds } });

      res.status(200).json({
          success: true,
          data: movies,
      });
  } catch (error) {
      console.error("Error fetching movies by theater:", error);
      res.status(500).json({ success: false, message: "Failed to fetch movies for theater" });
  }
};


export const getActiveMovies = async (req, res) => {
  try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find distinct movie IDs from future shows only
      const movieIdsWithUpcomingShows = await Show.distinct('movie', {
          date: { $gte: today }
      });

      // Fetch the actual movie documents
      const movies = await Movie.find({ _id: { $in: movieIdsWithUpcomingShows } });

      res.status(200).json({ success: true, data: movies });
  } catch (err) {
      console.error("Error fetching active movies:", err);
      res.status(500).json({ success: false, error: err.message });
  }
};


// Get movies by location
export const getMoviesByLocation = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Step 1: Find theaters in the given location
    const theatersInLocation = await Theater.find({ location }).select('_id');

    const theaterIds = theatersInLocation.map(t => t._id);

    if (theaterIds.length === 0) {
      return res.status(200).json({ success: true, data: [] }); // No theaters, so no movies
    }

    // Step 2: Find shows in those theaters (optional: filter upcoming)
    const today = new Date();
    const showMovieIds = await Show.distinct('movie', {
      theater: { $in: theaterIds },
      date: { $gte: today } // Only upcoming shows
    });

    // Step 3: Find the movie documents
    const movies = await Movie.find({ _id: { $in: showMovieIds } });

    res.status(200).json({ success: true, data: movies });
  } catch (error) {
    console.error("Error fetching movies by location:", error);
    res.status(500).json({ message: "Failed to fetch movies by location" });
  }
};

  
// Get shows for a movie grouped by theater and filtered by date
export const getShowsForMovie = async (req, res) => {
    const { movieId } = req.params;
    const { date } = req.query;
  
    try {
      const query = { movie: movieId };
  
      if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
  
        query.date = { $gte: start, $lt: end };
      }
  
      const shows = await Show.find(query).populate("theater").lean();
  
      const grouped = {};
  
      for (const show of shows) {
        if (!show.theater) continue;
  
        const tId = show.theater._id.toString();
  
        if (!grouped[tId]) {
          grouped[tId] = {
            theater: show.theater,
            shows: [],
          };
        }
        grouped[tId].shows.push(show);
      }
  
      res.status(200).json({
        success: true,
        data: Object.values(grouped),
      });
    } catch (err) {
      console.error("Error fetching shows for movie:", err);
      res.status(500).json({ message: "Failed to fetch shows for movie" });
    }
};
  

// Get movie details by show id
export const movieByShowId = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id).populate('movie'); 

        if (!show) return res.status(404).json({ message: "Show not found" });

        res.json({ data: show.movie, message: "Movie fetched successfully" }); 
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};


// Get show by Id
export const getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id).populate('theater')

        if (!show) return res.status(404).json({ message: "Show not found" });

        res.json({ data: show, message: "Show fetched successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

// Update Show
export const updateShow = async (req, res) => {
    try {
      const show = await Show.findById(req.params.id);
      if (!show) return res.status(404).json({ message: "Show not found" });
  
      if (show.exhibitor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not allowed to update this show" });
      }
  
      const { movie, date, time } = req.body;
  
      if (date) show.date = date;
      if (time) show.time = time;
  
      if (movie && movie !== show.movie.toString()) {
        await Movie.findByIdAndUpdate(show.movie, { $pull: { theaters: show.theater } });
        await Movie.findByIdAndUpdate(movie, { $addToSet: { theaters: show.theater } });
        show.movie = movie;
      }
  
      await show.save();
      res.json({ data: show, message: "Show updated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
  

// Delete Show
export const deleteShow = async (req, res) => {
    try {
      const show = await Show.findById(req.params.id);
      if (!show) return res.status(404).json({ message: "Show not found" });
  
      if (show.exhibitor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You are not allowed to delete this show" });
      }
  
      const { movie, theater } = show;
  
      await Show.deleteOne({ _id: req.params.id });
      await ShowSeatStatus.deleteMany({ show: show._id });
  
      const remainingShows = await Show.findOne({ movie, theater });
      if (!remainingShows) {
        await Movie.findByIdAndUpdate(movie, {
          $pull: { theaters: theater },
        });
      }
  
      res.json({ message: "Show deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  