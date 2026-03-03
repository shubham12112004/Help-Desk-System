const mongoose = require("mongoose");

const ticketCommentSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    user_id: { type: String, required: true, index: true },
    content: { type: String, required: true },
    is_internal: { type: Boolean, default: false },
    is_system_message: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketComment", ticketCommentSchema);
