const mongoose = require("mongoose");

const ambulanceRequestSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    pickup_location: { type: String, required: true },
    destination: { type: String, required: true },
    emergency_type: { type: String, required: true },
    contact_number: { type: String, required: true },
    user_latitude: { type: Number, default: null },
    user_longitude: { type: Number, default: null },
    ambulance_latitude: { type: Number, default: null },
    ambulance_longitude: { type: Number, default: null },
    distance_km: { type: Number, default: null },
    eta_minutes: { type: Number, default: null },
    status: {
      type: String,
      enum: ["requested", "assigned", "dispatched", "arrived", "completed", "cancelled"],
      default: "requested",
    },
    ambulance_number: { type: String, default: null },
    driver_name: { type: String, default: null },
    driver_contact: { type: String, default: null },
    last_location_update: { type: Date, default: null },
    request_time: { type: Date, default: Date.now },
    completed_time: { type: Date, default: null },
  },
  { timestamps: true }
);

ambulanceRequestSchema.index({ patient_id: 1, status: 1 });
ambulanceRequestSchema.index({ status: 1 });

module.exports = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
