const mongoose = require("mongoose");

const patientMedicalRecordSchema = new mongoose.Schema(
  {
    patient_id: { type: String, required: true, index: true },
    record_type: {
      type: String,
      enum: ["diagnosis", "treatment", "prescription", "lab_report", "imaging", "surgery", "vital_signs", "allergy", "vaccination"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    treatment_plan: { type: String, default: "" },
    medications: { type: [String], default: [] },
    test_results: { type: mongoose.Schema.Types.Mixed, default: {} },
    doctor_id: { type: String, default: null },
    doctor_name: { type: String, default: "" },
    date_recorded: { type: Date, default: Date.now, index: true },
    follow_up_required: { type: Boolean, default: false },
    follow_up_date: { type: Date, default: null },
    attachments: { type: [String], default: [] },
    notes: { type: String, default: "" },
    vital_signs: {
      blood_pressure: { type: String, default: "" },
      heart_rate: { type: Number, default: null },
      temperature: { type: Number, default: null },
      respiratory_rate: { type: Number, default: null },
      oxygen_saturation: { type: Number, default: null },
      weight: { type: Number, default: null },
      height: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

patientMedicalRecordSchema.index({ patient_id: 1, date_recorded: -1 });
patientMedicalRecordSchema.index({ record_type: 1 });

module.exports = mongoose.model("PatientMedicalRecord", patientMedicalRecordSchema);
