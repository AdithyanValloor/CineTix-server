import express from "express";
import { protect, authorizeAdmin} from "../middlewares/auth.js";
import { deactivateUser, deleteUser, getAllUsers, login, signup, adminDashboard, logout } from "../controllers/adminController.js";

const router = express.Router();

// ADMIN ROUTES

// Sign up
router.post("/signup", signup)

// Login
router.post("/login", login)

// Admin dashboard
router.get("/dashboard", protect, authorizeAdmin, adminDashboard)

// Get all users
router.get("/users", protect, authorizeAdmin, getAllUsers);

// Deactivate user
router.put("/deactivate-user/:id", protect, authorizeAdmin, deactivateUser);

// Delete user 
router.delete("/delete-user/:id", protect, authorizeAdmin, deleteUser)

// Logout
router.post("/logout", logout)

export { router as adminRouter };