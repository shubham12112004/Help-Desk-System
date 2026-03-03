const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    ticket_number: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "general" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
        "cancelled",
      ],
      default: "open",
    },
    created_by: { type: String, required: true, index: true },
    assigned_to: { type: String, default: null, index: true },
    department: { type: String, default: "" },
    first_response_at: { type: Date, default: null },
    resolved_at: { type: Date, default: null },
    closed_at: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
