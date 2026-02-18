import { supabase } from "@/integrations/supabase/client";

/**
 * Get user settings
 * @returns {Promise<Object>} User settings object
 */
export async function getUserSettings() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    // Try to get existing settings
    let { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // If no settings exist, create default settings
    if (error && error.code === "PGRST116") {
      const { data: newSettings, error: createError } = await supabase
        .from("user_settings")
        .insert([{ user_id: user.id }])
        .select()
        .single();

      if (createError) throw createError;
      return newSettings;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw error;
  }
}

/**
 * Update user settings
 * @param {Object} settings - Settings object to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateUserSettings(settings) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    // Remove read-only fields
    const { id, user_id, created_at, updated_at, ...updateData } = settings;

    const { data, error } = await supabase
      .from("user_settings")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
}

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export async function updateUserProfile(profileData) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    // Remove read-only fields
    const { id, created_at, updated_at, email, role, ...updateData } = profileData;

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<void>}
 */
export async function updateUserPassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

/**
 * Update user email
 * @param {string} newEmail - New email address
 * @returns {Promise<void>}
 */
export async function updateUserEmail(newEmail) {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
}

/**
 * Get notification preferences from settings
 * @returns {Promise<Object>} Notification preferences
 */
export async function getNotificationPreferences() {
  try {
    const settings = await getUserSettings();
    return {
      email_notifications: settings.email_notifications,
      push_notifications: settings.push_notifications,
      sms_notifications: settings.sms_notifications,
      notify_ticket_created: settings.notify_ticket_created,
      notify_ticket_assigned: settings.notify_ticket_assigned,
      notify_ticket_updated: settings.notify_ticket_updated,
      notify_ticket_commented: settings.notify_ticket_commented,
      notify_ticket_resolved: settings.notify_ticket_resolved,
      notify_appointment_reminder: settings.notify_appointment_reminder,
      notify_sla_warning: settings.notify_sla_warning,
      daily_digest: settings.daily_digest,
      weekly_summary: settings.weekly_summary,
    };
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw error;
  }
}

/**
 * Update notification preferences
 * @param {Object} preferences - Notification preferences to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateNotificationPreferences(preferences) {
  try {
    return await updateUserSettings(preferences);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    throw error;
  }
}

/**
 * Delete user account (soft delete by setting is_active to false)
 * @returns {Promise<void>}
 */
export async function deactivateUserAccount() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) throw error;

    // Sign out the user
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error deactivating account:", error);
    throw error;
  }
}

/**
 * Export user data (GDPR compliance)
 * @returns {Promise<Object>} User data
 */
export async function exportUserData() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get settings
    const settings = await getUserSettings();

    // Get tickets
    const { data: tickets } = await supabase
      .from("tickets")
      .select("*")
      .eq("created_by", user.id);

    // Get comments
    const { data: comments } = await supabase
      .from("ticket_comments")
      .select("*")
      .eq("user_id", user.id);

    return {
      profile,
      settings,
      tickets: tickets || [],
      comments: comments || [],
      exported_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error exporting user data:", error);
    throw error;
  }
}
