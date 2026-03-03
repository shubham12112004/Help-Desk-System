/**
 * Notifications Service
 * Handles all notification operations via backend API
 */

import APIClient from './api';

/**
 * Get all notifications for current user
 * @param {number} limit - Maximum number of notifications to fetch
 * @returns {Promise<Array>} List of notifications
 */
export async function getNotifications(limit = 50) {
  try {
    const response = await APIClient.get(`/notifications?limit=${limit}`);
    return response.notifications || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadCount() {
  try {
    const response = await APIClient.get('/notifications/unread-count');
    return response.count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function markAsRead(notificationId) {
  try {
    await APIClient.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export async function markAllAsRead() {
  try {
    await APIClient.put('/notifications/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  try {
    await APIClient.delete(`/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Subscribe to new notifications using polling
 * Note: Realtime subscriptions are handled by polling at regular intervals
 * @param {Function} callback - Function to call when new notifications arrive
 * @param {number} pollInterval - Polling interval in milliseconds (default: 5000ms)
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToNotifications(callback, pollInterval = 5000) {
  let lastNotificationTime = Date.now();
  let isUnsubscribed = false;

  const pollForNotifications = async () => {
    if (isUnsubscribed) return;

    try {
      const notifications = await getNotifications();
      
      // Only call callback for new notifications
      const newNotifications = notifications.filter(
        (n) => new Date(n.created_at).getTime() > lastNotificationTime
      );

      if (newNotifications.length > 0) {
        newNotifications.forEach(callback);
        lastNotificationTime = Math.max(
          ...newNotifications.map((n) => new Date(n.created_at).getTime())
        );
      }
    } catch (error) {
      console.error('Error in notification polling:', error);
    }

    // Schedule next poll
    if (!isUnsubscribed) {
      setTimeout(pollForNotifications, pollInterval);
    }
  };

  // Start polling
  pollForNotifications();

  return {
    unsubscribe: () => {
      isUnsubscribed = true;
    },
  };
}

/**
 * Get notification preferences for user
 * @returns {Promise<Object>} Notification preferences from user settings
 */
export async function getNotificationPreferences() {
  try {
    const response = await APIClient.get('/user/settings');
    const settings = response.settings || {};
    
    // Extract notification preferences
    return {
      email_notifications: settings.email_notifications !== false,
      push_notifications: settings.push_notifications !== false,
      sms_notifications: settings.sms_notifications || false,
      notify_ticket_created: settings.notify_ticket_created !== false,
      notify_ticket_assigned: settings.notify_ticket_assigned !== false,
      notify_ticket_updated: settings.notify_ticket_updated !== false,
      notify_ticket_resolved: settings.notify_ticket_resolved !== false,
      notify_ticket_commented: settings.notify_ticket_commented !== false,
      notify_appointment_reminder: settings.notify_appointment_reminder !== false,
      notify_sla_warning: settings.notify_sla_warning !== false,
      notify_daily_digest: settings.notify_daily_digest || false,
      notify_weekly_summary: settings.notify_weekly_summary || false,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
}

/**
 * Update notification preferences
 * @param {Object} preferences - Updated notification preferences
 * @returns {Promise<void>}
 */
export async function updateNotificationPreferences(preferences) {
  try {
    await APIClient.put('/user/settings', preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}
