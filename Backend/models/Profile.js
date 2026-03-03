const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    full_name: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["citizen", "patient", "staff", "doctor", "admin", "user"],
      default: "citizen",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    avatar_url: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    emergency_contact: {
      type: String,
      default: "",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_on_duty: {
      type: Boolean,
      default: false,
    },
    current_tickets_count: {
      type: Number,
      default: 0,
    },
    employee_id: {
      type: String,
      default: "",
    },
    last_login_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
