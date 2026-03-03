const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email_notifications: { type: Boolean, default: true },
    push_notifications: { type: Boolean, default: true },
    sms_notifications: { type: Boolean, default: false },
    notify_ticket_created: { type: Boolean, default: true },
    notify_ticket_assigned: { type: Boolean, default: true },
    notify_ticket_updated: { type: Boolean, default: true },
    notify_ticket_commented: { type: Boolean, default: true },
    notify_ticket_resolved: { type: Boolean, default: true },
    notify_appointment_reminder: { type: Boolean, default: true },
    notify_sla_warning: { type: Boolean, default: true },
    daily_digest: { type: Boolean, default: false },
    weekly_summary: { type: Boolean, default: true },
    theme: { type: String, default: "system" },
    language: { type: String, default: "en" },
    date_format: { type: String, default: "MM/DD/YYYY" },
    time_format: { type: String, default: "12h" },
    default_dashboard_view: { type: String, default: "grid" },
    tickets_per_page: { type: Number, default: 10 },
    profile_visible: { type: Boolean, default: true },
    show_online_status: { type: Boolean, default: true },
    enable_sound: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSettings", userSettingsSchema);
