import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({ imageUrl: req.file.path });
});

export default router;
