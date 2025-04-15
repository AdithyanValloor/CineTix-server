import express from "express";
import { createSupportTicket } from "../controllers/supportRequest.js";

const router = express.Router();

router.post("/", createSupportTicket);

export {router as supportRouter};
