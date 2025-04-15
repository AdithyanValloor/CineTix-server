import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true 
},
  issueType: { 
    type: String, 
    enum: ["Booking", "Payment", "Technical", "Other"], 
    required: true 
},
  description: { 
    type: String, 
    required: true 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
},
  status: { 
    type: String, 
    enum: ["Pending", "Resolved", "Closed"], 
    default: "Pending" 
}
});

export const Support = mongoose.model("SupportTicket", supportTicketSchema);
