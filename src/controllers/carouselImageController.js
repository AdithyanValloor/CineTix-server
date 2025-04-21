import { CarouselImage } from "../models/carouselImageModel.js";
import cloudinary from "../config/cloudinary.js";

// Fetch all carousel images
export const getCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
};

// Add new carousel image
export const addCarouselImage = async (req, res) => {
  try {
    const file = req.file;
    console.log("Uploaded file:", file);

    const { caption } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const imageUrl = file.path; 
    const public_id = file.filename; 

    const newImage = await CarouselImage.create({
      imageUrl,
      public_id,
      caption,
    });

    res.status(201).json({ success: true, data: newImage });
  } catch (err) {
    console.error("Add Carousel Error:", err);
    res.status(500).json({ success: false, message: "Failed to add image" });
  }
};

// Update image (caption or replace image)
export const updateCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const existingImage = await CarouselImage.findById(id);
    if (!existingImage) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // If new image is uploaded, delete old one from Cloudinary
    if (req.file) {
      if (existingImage.public_id) {
        await cloudinary.uploader.destroy(existingImage.public_id);
      }

      existingImage.imageUrl = req.file.secure_url;
      existingImage.public_id = req.file.public_id;
    }

    if (caption) {
      existingImage.caption = caption;
    }

    const updatedImage = await existingImage.save();

    res.status(200).json({ success: true, data: updatedImage });
  } catch (err) {
    console.error("Update Carousel Error:", err);
    res.status(500).json({ success: false, message: "Failed to update image" });
  }
};

// Delete image
export const deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;

    const imageDoc = await CarouselImage.findById(id);
    if (!imageDoc) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Delete from Cloudinary
    if (imageDoc.public_id) {
      await cloudinary.uploader.destroy(imageDoc.public_id);
    }

    await imageDoc.deleteOne();

    res.status(200).json({ success: true, message: "Image deleted from Cloudinary and DB" });
  } catch (err) {
    console.error("Delete Carousel Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
};
