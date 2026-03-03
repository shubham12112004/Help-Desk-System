import APIClient from './api';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get user settings
 * @returns {Promise<Object>} User settings object
 */
export async function getUserSettings() {
  try {
    const response = await APIClient.get('/user/settings');
    return response.settings || {};
  } catch (error) {
    console.error('Error fetching user settings:', error);
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
    // Filter out read-only fields
    const { id, user_id, created_at, updated_at, ...updateData } = settings;

    // Filter out null and undefined values
    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    );

    if (Object.keys(cleanData).length === 0) {
      console.warn('No valid settings to update');
      return settings;
    }

    const response = await APIClient.put('/user/settings', cleanData);
    return response.settings || cleanData;
  } catch (error) {
    console.error('Error updating user settings:', error);
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
    // Filter out read-only fields
    const {
      id,
      userId,
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
      Object.entries(updateData).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ''
      )
    );

    if (Object.keys(cleanData).length === 0) {
      console.warn('No valid fields to update');
      return profileData;
    }

    const response = await APIClient.put('/profiles/me', cleanData);
    return response.profile || cleanData;
  } catch (error) {
    console.error('Error updating user profile:', error);
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
    console.error('Error updating password:', error);
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
    console.error('Error updating email:', error);
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
    console.error('Error fetching notification preferences:', error);
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
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}

/**
 * Delete user account (soft delete by setting is_active to false)
 * @returns {Promise<void>}
 */
export async function deactivateUserAccount() {
  try {
    await APIClient.post('/user/deactivate');

    // Sign out the user
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error deactivating account:', error);
    throw error;
  }
}

/**
 * Export user data (GDPR compliance)
 * @returns {Promise<Object>} User data
 */
export async function exportUserData() {
  try {
    const response = await APIClient.get('/user/export');
    return response.data || {};
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}
