const mongoose = require("mongoose");

const medicineRequestSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    prescription_id: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", default: null },
    medicine_name: { type: String, required: true },
    dosage: { type: String, required: true },
    quantity: { type: Number, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "dispensed", "delivered", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    pharmacy_notes: { type: String, default: "" },
    dispensed_by: { type: String, default: null },
    dispensed_at: { type: Date, default: null },
    delivery_method: {
      type: String,
      enum: ["pickup", "home_delivery"],
      default: "pickup",
    },
    delivery_address: { type: String, default: null },
  },
  { timestamps: true }
);

medicineRequestSchema.index({ patient_id: 1, status: 1 });
medicineRequestSchema.index({ status: 1 });

module.exports = mongoose.model("MedicineRequest", medicineRequestSchema);
