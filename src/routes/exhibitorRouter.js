import express from "express";
import { authorizeExhibitor, protect } from "../middlewares/auth.js";
import { 
    registerExhibitor, 
    loginExhibitor, 
    getExhibitorProfile, 
    updateExhibitorProfile,
    logout, 
    getDashboardStats,
    getExhibitorBookings, 
    getRevenueReports,
    getTheaterAnalytics
} from "../controllers/exhibitorController.js";

const router = express.Router()

// Authentication routes
router.post("/register", registerExhibitor);
router.post("/login", loginExhibitor);

// Dashboard stats
router.get("/dashboard", protect, authorizeExhibitor, getDashboardStats )

// All bookings
router.get("/bookings", protect, authorizeExhibitor, getExhibitorBookings )

// Get Revenue Report
router.get("/revenue-reports", protect, authorizeExhibitor, getRevenueReports)

// Get Analytics
router.get("/analytics", protect, authorizeExhibitor, getTheaterAnalytics);



// Exhibitor profile management
router.get("/profile", protect, authorizeExhibitor, getExhibitorProfile);
router.put("/update-profile", protect, authorizeExhibitor, updateExhibitorProfile);
router.post("/logout", logout)


export { router as exhibitorRouter}

