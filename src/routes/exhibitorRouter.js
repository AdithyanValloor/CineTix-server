import express from "express";
import { authorizeExhibitor, protect } from "../middlewares/auth.js";
import { 
    registerExhibitor, 
    loginExhibitor, 
    getExhibitorProfile, 
    updateExhibitorProfile,
    logout, 
    getDashboardStats,
    getExhibitorBookings 
} from "../controllers/exhibitorController.js";

const router = express.Router()

// Authentication routes
router.post("/register", registerExhibitor);
router.post("/login", loginExhibitor);

// Dashboard stats
router.get("/dashboard", protect, authorizeExhibitor, getDashboardStats )

// All bookings
router.get("/bookings", protect, authorizeExhibitor, getExhibitorBookings )


// Exhibitor profile management
router.get("/profile", protect, authorizeExhibitor, getExhibitorProfile);
router.put("/update-profile", protect, authorizeExhibitor, updateExhibitorProfile);
router.post("/logout", logout)


export { router as exhibitorRouter}

