const UserSettings = require("../models/UserSettings");
const Profile = require("../models/Profile");
const Ticket = require("../models/Ticket");
const TicketComment = require("../models/TicketComment");

function formatProfile(profile) {
  const data = profile.toObject();
  return {
    id: data.userId,
    user_id: data.userId,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    phone: data.phone,
    avatar_url: data.avatar_url,
    department: data.department,
    address: data.address,
    emergency_contact: data.emergency_contact,
    is_active: data.is_active,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

function formatSettings(settings) {
  const data = settings.toObject();
  return {
    id: data._id,
    user_id: data.userId,
    email_notifications: data.email_notifications,
    push_notifications: data.push_notifications,
    sms_notifications: data.sms_notifications,
    notify_ticket_created: data.notify_ticket_created,
    notify_ticket_assigned: data.notify_ticket_assigned,
    notify_ticket_updated: data.notify_ticket_updated,
    notify_ticket_commented: data.notify_ticket_commented,
    notify_ticket_resolved: data.notify_ticket_resolved,
    notify_appointment_reminder: data.notify_appointment_reminder,
    notify_sla_warning: data.notify_sla_warning,
    daily_digest: data.daily_digest,
    weekly_summary: data.weekly_summary,
    theme: data.theme,
    language: data.language,
    date_format: data.date_format,
    time_format: data.time_format,
    default_dashboard_view: data.default_dashboard_view,
    tickets_per_page: data.tickets_per_page,
    profile_visible: data.profile_visible,
    show_online_status: data.show_online_status,
    enable_sound: data.enable_sound,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

/**
 * Get user settings
 */
exports.getUserSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.id });

    if (!settings) {
      settings = await UserSettings.create({ userId: req.user.id });
    }

    res.status(200).json({ settings: formatSettings(settings) });
  } catch (error) {
    console.error("Error in getUserSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update user settings
 */
exports.updateUserSettings = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Settings updated successfully",
      settings: formatSettings(settings),
    });
  } catch (error) {
    console.error("Error in updateUserSettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.email;
    delete updateData.role;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      profile: formatProfile(profile),
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Export user data (GDPR compliance)
 */
exports.exportUserData = async (req, res) => {
  try {
    const [profile, settings, tickets, comments] = await Promise.all([
      Profile.findOne({ userId: req.user.id }),
      UserSettings.findOne({ userId: req.user.id }),
      Ticket.find({ created_by: req.user.id }),
      TicketComment.find({ user_id: req.user.id }),
    ]);

    const exportData = {
      profile: profile ? formatProfile(profile) : null,
      settings: settings ? formatSettings(settings) : null,
      tickets: tickets || [],
      comments: comments || [],
      exported_at: new Date().toISOString(),
    };

    res.status(200).json(exportData);
  } catch (error) {
    console.error("Error in exportUserData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Deactivate user account
 */
exports.deactivateAccount = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { is_active: false } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Error in deactivateAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
