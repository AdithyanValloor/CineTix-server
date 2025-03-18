import { Watchlist } from "../models/watchlistModel.js";

export const getWatchlist = async (req, res) => {
    try {
        // Ensure if user is authentic 
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})
        
        const userId = req.user.id

        const watchlist = await Watchlist.find({user: userId})

        if(!watchlist || !watchlist.length) return res.status(404).json({message: "No watchlist found"})

        res.json({data: watchlist, message: "Watchlist retrieved"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: "Internal server error"})
    }
}

export const addToWatchlist = async ( req, res ) => {
    try {

        // Get movie
        const { movieId } = req.params

        // Ensure if user is authentic 
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})
    
        const userId = req.user.id

        // Check if already exist
        const exist = await Watchlist.findOne({user: userId, movie: movieId})

        if(exist) return res.status(400).json({message: "Movie already exist in watchlist"})

        const watchlist = new Watchlist({user: userId, movie: movieId})

        await watchlist.save()
        
        res.json({data: watchlist, message: "Movie added to watchlist"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: "Internal server error"})
    }
}

export const deleteFromWatchlist = async (req, res) => {
    try {
        // Get movie
        const { movieId } = req.params

        // Ensure if user is authentic 
        if(!req.user || !req.user.id) return res.status(401).json({message: "Unauthorized access"})
    
        const userId = req.user.id

        const movie = await Watchlist.findOneAndDelete({user: userId, movie: movieId})

        if(!movie) return res.status(404).json({message: "Movie not found"})

        res.json({data: movie, message: "Movie deleted from watchlist"})

    } catch (error) {
        res.status(error.statusCode || 500).json({message: "Internal server error"})
    }
}