import { Support } from "../models/supportRequestModel.js";

export const createSupportTicket = async (req, res) => {
  try {
    const { name, email, issueType, description } = req.body;

    if (!name || !email || !issueType || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newTicket = new Support({
      name,
      email,
      issueType,
      description
    });

    await newTicket.save();

    res.status(201).json({ message: "Support request submitted successfully." });
  } catch (err) {
    console.error("Error creating support ticket:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
