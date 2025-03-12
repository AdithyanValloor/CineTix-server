import express from "express";
import { addTheater, deleteTheater, editTheater, listTheaters } from "../controllers/theaterController.js";

const router = express.Router()

// Add theater
router.post("/add-theater", addTheater)

// Edit theater
router.patch("/edit-theater/:id", editTheater)

// Delete theater
router.delete("/delete-theater/:id", deleteTheater)

// List theaters
router.get("/list-theaters", listTheaters)

export {router as theaterRouter}