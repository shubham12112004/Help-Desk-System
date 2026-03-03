const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    bill_number: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paid_amount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    bill_type: {
      type: String,
      enum: ["consultation", "medicine", "lab_test", "room", "surgery", "emergency", "other"],
      default: "consultation",
    },
    due_date: { type: Date, default: null },
    paid_date: { type: Date, default: null },
    payment_method: { type: String, default: "" },
    payment_reference: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

billingSchema.index({ patient_id: 1, status: 1 });
billingSchema.index({ bill_number: 1 });
billingSchema.index({ status: 1 });

module.exports = mongoose.model("Billing", billingSchema);
