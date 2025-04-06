import express from "express";
import { protect } from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  deactivateProfile,
  deleteAccount,
  logout,
  reactivateAccount
} from "../controllers/userController.js"; 

const router = express.Router();

// Test route
router.get("/", (req, res) => res.status(200).send("userRouter is working"));

// User routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile-update", protect, upload.single("profilePicture"), updateProfile);
router.put("/deactivate-account", protect, deactivateProfile);
router.put("/reactivate-account", reactivateAccount)
router.delete("/delete-account", protect, deleteAccount);
router.post("/logout", logout);


export { router as userRouter };
