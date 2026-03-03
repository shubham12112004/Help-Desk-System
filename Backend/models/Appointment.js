const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    doctor_id: { type: String, default: null, index: true },
    department: { type: String, required: true },
    appointment_date: { type: Date, required: true, index: true },
    appointment_time: { type: String, required: true },
    time_slot: { type: String, default: null },
    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },
    reason: { type: String, default: "" },
    notes: { type: String, default: "" },
    doctor_notes: { type: String, default: "" },
    prescription_given: { type: Boolean, default: false },
    follow_up_date: { type: Date, default: null },
  },
  { timestamps: true }
);

appointmentSchema.index({ patient_id: 1, appointment_date: 1 });
appointmentSchema.index({ doctor_id: 1, appointment_date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
