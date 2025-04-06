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

        // Create the show first
        const show = await Show.create({ 
            movie, 
            theater, 
            date, 
            time, 
            exhibitor: req.user._id
        });

        // Generate seats statuses for this show
        await generateShowSeatStatuses(show._id, theaterData._id); 

        // Link movie to theater (optional for listing)
        await Movie.findByIdAndUpdate(movie, { 
            $addToSet: { theaters: theater } 
        });

        res.status(201).json({ data: show, message: "Show created and seats generated successfully" });

    } catch (error) {
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
        const { movie, theater } = req.query
        let filter = {}
        if (movie) filter.movie = movie
        if (theater) filter.theater = theater

        const shows = await Show.find(filter).populate("movie theater")
        res.json({ data: shows })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

// Get active movies 

export const getActiveMovies = async (req, res) => {
    try {
        // Get distinct movie IDs from shows
        const movieIdsWithShows = await Show.distinct('movie');
    
        // Now fetch the actual movie data
        const movies = await Movie.find({ _id: { $in: movieIdsWithShows } });
    
        res.status(200).json({ success: true, data: movies });
    } catch (err) {
    res.status(500).json({ success: false, error: err.message });
    }
}

// Get shows for movies filtered with date

export const getShowsForMovie = async (req, res) => {
    const { movieId } = req.params;
    const { date } = req.query;
  
    try {
      const query = { movie: movieId };
  
      if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
  
        query.date = { $gte: start, $lt: end }; // Matches the full day
      }
  
      const shows = await Show.find(query)
        .populate("theater")
        .lean();
  
      const grouped = {};
  
      for (const show of shows) {
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
  

// export const getShowsForMovie = async (req, res) => {
//     const { movieId } = req.params;
//     const { date } = req.query;
  
//     try {
//       const query = { movie: movieId };
  
//       if (date) {
//         const start = new Date(date);
//         const end = new Date(date);
//         end.setDate(end.getDate() + 1);
  
//         // Assuming your Show schema has a `date` field of type Date
//         query.date = { $gte: start, $lt: end };
//       }
  
//       const shows = await Show.find(query)
//         .populate("theater")
//         .lean();
  
//       const grouped = {};
  
//       for (const show of shows) {
//         const tId = show.theater._id.toString();
//         if (!grouped[tId]) {
//           grouped[tId] = {
//             theater: show.theater,
//             shows: [],
//           };
//         }
//         grouped[tId].shows.push(show);
//       }
  
//       res.status(200).json({
//         success: true,
//         data: Object.values(grouped),
//       });
//     } catch (err) {
//       console.error("Error fetching shows for movie:", err);
//       res.status(500).json({ message: "Failed to fetch shows for movie" });
//     }
// };
  

// export const getShowsForMovie = async (req, res) => {
//     const { movieId } = req.params;
  
//     try {
//       const shows = await Show.find({ movie: movieId })
//         .populate("theater") // Assuming show has a `theater` ObjectId field
//         .lean();
  
//       // Group by theater
//       const grouped = {};
  
//       for (const show of shows) {
//         const tId = show.theater._id.toString();
//         if (!grouped[tId]) {
//           grouped[tId] = {
//             theater: show.theater,
//             shows: [],
//           };
//         }
//         grouped[tId].shows.push(show);
//       }
  
//       res.status(200).json({
//         success: true,
//         data: Object.values(grouped), 
//       });
//     } catch (err) {
//       console.error("Error fetching shows for movie:", err);
//       res.status(500).json({ message: "Failed to fetch shows for movie" });
//     }
// };

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
        const { movie, date, time } = req.body;
        const show = await Show.findById(req.params.id);

        if (!show) return res.status(404).json({ message: "Show not found" });

        if (date) show.date = date;
        if (time) show.time = time;

        if (movie && movie !== show.movie.toString()) {
            // Update movie reference and movie-theater link (optional)
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
        const show = await Show.findById(req.params.id)
        if (!show) return res.status(404).json({ message: "Show not found" })

        const { movie, theater } = show;    

        await Show.deleteOne({ _id: req.params.id });
        await ShowSeatStatus.deleteMany({ show: show._id });

        const remainingShows = await Show.findOne({ movie, theater });

        if (!remainingShows) {
            await Movie.findByIdAndUpdate(movie, {
                $pull: { theaters: theater }
            });
        }

        res.json({ message: "Show deleted successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};
