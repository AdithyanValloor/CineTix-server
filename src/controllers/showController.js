import { Show } from "../models/showsModel.js";
import { Theater } from "../models/theatersModel.js";
import { Seat } from "../models/seatsModel.js";
import { Movie } from "../models/moviesModel.js";

// Create Show
export const createShow = async (req, res) => {
    try {
        const { movie, theater, date, time, ticketPrice } = req.body;

        if (!movie || !theater || !date || !time || !ticketPrice) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const movieData = await Movie.findById(movie);
        if (!movieData) return res.status(404).json({ message: "Movie not found" });


        const theaterData = await Theater.findById(theater);
        if (!theaterData) return res.status(404).json({ message: "Theater not found" });

        const show = await Show.create({ 
            movie, 
            theater, 
            date, 
            time, 
            ticketPrice, 
            exhibitor: req.user._id
        });

        console.log("Show Created:", show);
        console.log("Show ID:", show._id);

        // Generate seats
        let seats = [];
        for (let row = 1; row <= theaterData.rows; row++) {
            for (let col = 1; col <= theaterData.columns; col++) {
                const seat = await Seat.create({
                    row: String.fromCharCode(64 + row), 
                    column: col,
                    theater,
                    movie,
                    show: show._id,
                    isBooked: false 
                });
                seats.push(seat._id)
            }
        }

        show.seats = seats
        await show.save()

        await Movie.findByIdAndUpdate(movie, { 
            $addToSet: { theaters: theater } 
        });
        
        res.status(201).json({ data: show, message: "Show created successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" })
    }
};

// Get Shows 
export const getShows = async (req, res) => {
    try {
        const { movie, theater } = req.query
        let filter = {}
        if (movie) filter.movie = movie
        if (theater) filter.theater = theater

        const shows = await Show.find(filter).populate("movie theater seats")
        res.json({ data: shows })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

// Update Show
export const updateShow = async (req, res) => {
    try {
        const { movie, ticketPrice, date, time } = req.body
        const show = await Show.findById(req.params.id)

        if (!show) return res.status(404).json({ message: "Show not found" })

        if (ticketPrice) show.ticketPrice = ticketPrice
        if (date) show.date = date
        if (time) show.time = time
        if (movie) show.movie = movie

        await show.save();
        res.json({ data: show, message: "Show updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

// Delete Show
export const deleteShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
        if (!show) return res.status(404).json({ message: "Show not found" })

        const { movie, theater } = show;    

        await Show.deleteOne({ _id: req.params.id });
        await Seat.deleteMany({ _id: { $in: show.seats } })

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
