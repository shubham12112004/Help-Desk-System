const mongoose = require("mongoose");

const tokenQueueSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    department: { type: String, required: true, index: true },
    token_number: { type: Number, required: true },
    status: {
      type: String,
      enum: ["waiting", "called", "in_consultation", "completed", "missed", "cancelled"],
      default: "waiting",
    },
    issue_date: { type: Date, default: Date.now, index: true },
    estimated_wait_minutes: { type: Number, default: 0 },
    called_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
  },
  { timestamps: true }
);

tokenQueueSchema.index({ department: 1, issue_date: 1, token_number: 1 });
tokenQueueSchema.index({ patient_id: 1, status: 1 });
tokenQueueSchema.index({ status: 1 });

module.exports = mongoose.model("TokenQueue", tokenQueueSchema);
