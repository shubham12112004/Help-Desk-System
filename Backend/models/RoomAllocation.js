const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    room_number: { type: String, required: true },
    room_type: {
      type: String,
      enum: ["general", "semi_private", "private", "icu", "emergency"],
      default: "general",
    },
    bed_number: { type: String, required: true },
    floor: { type: String, default: "" },
    admission_date: { type: Date, default: Date.now },
    discharge_date: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "discharged", "transferred"],
      default: "active",
    },
    daily_rate: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

roomAllocationSchema.index({ patient_id: 1, status: 1 });
roomAllocationSchema.index({ room_number: 1, status: 1 });
roomAllocationSchema.index({ status: 1 });

module.exports = mongoose.model("RoomAllocation", roomAllocationSchema);
