import { supabase } from "@/integrations/supabase/client";

/**
 * Get user settings
 * @returns {Promise<Object>} User settings object
 */
export async function getUserSettings() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    console.log("Fetching settings for user:", user.id);

    // Try to get existing settings
    let { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .limit(1);

    console.log("Settings query result:", { data, error });

    // If no settings exist, create default settings
    if ((!data || data.length === 0) && error?.code === "PGRST116") {
      console.log("No settings found, creating defaults...");
      const { data: newSettings, error: createError } = await supabase
        .from("user_settings")
        .insert([{ user_id: user.id }])
        .select()
        .limit(1);

      if (createError) {
        console.error("Error creating settings:", createError);
        throw createError;
      }
      return newSettings && newSettings.length > 0 ? newSettings[0] : null;
    }

    if (error) {
      console.error("Settings query error:", error);
      throw error;
    }
    
    return data && data.length > 0 ? data[0] : null;
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

    // Filter out null and undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== null && value !== undefined)
    );

    if (Object.keys(cleanData).length === 0) {
      console.warn("No valid settings to update");
      return settings;
    }

    console.log("Updating settings with data:", cleanData);

    const { data, error } = await supabase
      .from("user_settings")
      .update(cleanData)
      .eq("user_id", user.id)
      .select()
      .limit(1);

    console.log("Settings update result:", { data, error });

    if (error) {
      console.error("Supabase settings update error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return data && data.length > 0 ? data[0] : settings;
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

    // Remove read-only fields and clean data
    const { 
      id, 
      user_id,
      created_at, 
      updated_at, 
      email, 
      role, 
      is_active,
      last_login_at,
      employee_id,
      ...updateData 
    } = profileData;

    // Filter out null and undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== null && value !== undefined && value !== '')
    );

    // Validate data before update
    if (Object.keys(cleanData).length === 0) {
      console.warn("No valid fields to update");
      return profileData;
    }

    console.log("Updating profile with data:", cleanData);

    // Try updating with user_id first (old schema)
    let result = await supabase
      .from("profiles")
      .update(cleanData)
      .eq("user_id", user.id)
      .select()
      .limit(1);
    
    console.log("Update with user_id result:", result);
    
    // If no rows affected, try with id (new schema)
    if (!result.data || result.data.length === 0) {
      console.log("Trying update with id field...");
      result = await supabase
        .from("profiles")
        .update(cleanData)
        .eq("id", user.id)
        .select()
        .limit(1);
      
      console.log("Update with id result:", result);
    }

    if (result.error) {
      console.error("Supabase update error:", result.error);
      throw new Error(`Database error: ${result.error.message}`);
    }
    
    if (!result.data || result.data.length === 0) {
      throw new Error("Profile not found or no changes made");
    }
    
    return result.data[0];
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

    console.log("Deactivating account for user:", user.id);

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", user.id);

    if (error) {
      console.error("Deactivate error:", error);
      throw new Error(`Failed to deactivate account: ${error.message}`);
    }

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
