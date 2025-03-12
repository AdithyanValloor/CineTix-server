import express from "express";
import { protect, authorizeAdmin} from "../middlewares/auth.js";
import { deactivateUser, deleteUser, getAllUsers, login, signup } from "../controllers/adminController.js";

const router = express.Router();

// ADMIN ROUTES

// Sign up
router.post("/signup", signup)

// Login
router.post("/login", login)

// Get all users
router.get("/users", protect, authorizeAdmin, getAllUsers);

// Deactivate user
router.put("/deactivate-user/:id", protect, authorizeAdmin, deactivateUser);

// Delete user 
router.delete("/delete-user/:id", protect, authorizeAdmin, deleteUser)

export { router as adminRouter };