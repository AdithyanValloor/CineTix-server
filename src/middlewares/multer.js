import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", 
    allowed_formats: ["jpeg", "png", "jpg"],
    transformation: [{ width: 1920, height: 1080, crop: "limit" }]
  },
});

const upload = multer({ storage });

export default upload;
