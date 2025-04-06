import express from "express";
import { authorizeExhibitor, protect } from "../middlewares/auth.js";
import { 
    registerExhibitor, 
    loginExhibitor, 
    getExhibitorProfile, 
    updateExhibitorProfile, 
} from "../controllers/exhibitorController.js";

const router = express.Router()

// Authentication routes
router.post("/register", registerExhibitor);

router.post("/login", loginExhibitor);

// Exhibitor profile management
router.get("/profile", protect, authorizeExhibitor, getExhibitorProfile);
router.put("/update-profile", protect, authorizeExhibitor, updateExhibitorProfile);


export { router as exhibitorRouter}

