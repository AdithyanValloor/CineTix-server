import express from 'express'
import { protect } from '../middlewares/auth.js'
import { 
    addReview,
    getAllReviews,
    getReview,
    deleteReview,
    averageRating,
    updateReview,


 } from '../controllers/reviewController.js'

const router = express.Router()

// Create review
router.post("/add-review", protect, addReview)

// Get all reviews
router.get("/all", protect, getAllReviews)

// Get reviews with id
router.get("/:id", protect, getReview)

// Edit reviews
router.patch("/update-review/:id", protect, updateReview)

// Delete reviews
router.delete("/delete-review/:id", protect, deleteReview)

// Average rating
router.get("/average/:movieId?/:theaterId?", protect, averageRating)


export {router as reviewRouter}