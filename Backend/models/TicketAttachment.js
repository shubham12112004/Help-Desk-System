const mongoose = require("mongoose");

const ticketAttachmentSchema = new mongoose.Schema(
  {
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketComment",
      default: null,
    },
    uploaded_by: { type: String, required: true, index: true },
    file_name: { type: String, required: true },
    file_path: { type: String, required: true },
    file_type: { type: String, default: "" },
    file_size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TicketAttachment", ticketAttachmentSchema);
