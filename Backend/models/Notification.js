const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    type: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    read_at: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
