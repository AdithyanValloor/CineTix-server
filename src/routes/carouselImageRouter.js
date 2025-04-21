import express from "express";
import upload from "../middlewares/multer.js"; 
import {
  getCarouselImages,
  addCarouselImage,
  updateCarouselImage,
  deleteCarouselImage
} from "../controllers/carouselImageController.js";
import { authorizeAdmin, protect } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getCarouselImages);
router.post("/", protect, authorizeAdmin, upload.single("image"), addCarouselImage);
router.put("/:id", protect, authorizeAdmin, upload.single("image"), updateCarouselImage);
router.delete("/:id", protect, authorizeAdmin, deleteCarouselImage);

export {router as carouselImageRouter};
