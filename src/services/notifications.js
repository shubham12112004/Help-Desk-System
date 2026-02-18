/**
 * Notifications Service
 * Handles all notification operations and realtime subscriptions
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Get all notifications for current user
 * @param {number} limit - Maximum number of notifications to fetch
 * @returns {Promise<Array>} List of notifications
 */
export async function getNotifications(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      ticket:ticket_id(id, ticket_number, title, status)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification UUID
 * @returns {Promise<void>}
 */
export async function markAsRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification UUID
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Subscribe to new notifications
 * @param {Function} callback - Function to call when new notification arrives
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToNotifications(callback) {
  const { data: { user } } = supabase.auth.getUser();
  
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) {
      console.error('Cannot subscribe to notifications: user not authenticated');
      return;
    }

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch full notification with ticket details
          const { data: notification, error } = await supabase
            .from('notifications')
            .select(`
              *,
              ticket:ticket_id(id, ticket_number, title, status)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && notification) {
            callback(notification);
          }
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  });

  return {
    unsubscribe: () => {},
  };
}

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(data) {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.userId,
      ticket_id: data.ticketId || null,
      type: data.type,
      message: data.message,
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return notification;
}

/**
 * Get notification preferences for user
 * @returns {Promise<Object>} Notification preferences
 */
export async function getNotificationPreferences() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Check if preferences exist in profiles or settings table
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  // Default preferences (can be stored in a separate settings table)
  return {
    email: true,
    push: true,
    ticket_created: true,
    ticket_assigned: true,
    ticket_updated: true,
    ticket_commented: true,
    appointment_reminder: true,
    sla_warning: true,
  };
}

/**
 * Update notification preferences
 * @param {Object} preferences - Updated preferences
 * @returns {Promise<void>}
 */
export async function updateNotificationPreferences(preferences) {
  // This would update a settings table or user_metadata
  // For now, we'll store in user metadata
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase.auth.updateUser({
    data: {
      notification_preferences: preferences,
    },
  });

  if (error) throw error;
}
