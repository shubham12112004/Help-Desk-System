const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    doctor_id: { type: String, default: null },
    doctor_name: { type: String, default: "" },
    medications: [
      {
        medicine_name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, default: "" },
      },
    ],
    diagnosis: { type: String, default: "" },
    notes: { type: String, default: "" },
    issued_date: { type: Date, default: Date.now, index: true },
    valid_until: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patient_id: 1, status: 1 });
prescriptionSchema.index({ issued_date: -1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
