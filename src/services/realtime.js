/**
 * Realtime Chat Service
 * Handles realtime subscriptions for ticket comments/chat
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Subscribe to new comments on a ticket
 * @param {string} ticketId - Ticket ID to watch
 * @param {Function} onNewComment - Callback when new comment arrives
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToTicketComments(ticketId, onNewComment) {
  const channel = supabase
    .channel(`ticket-comments-${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_comments',
        filter: `ticket_id=eq.${ticketId}`,
      },
      async (payload) => {
        // Fetch the full comment with user details
        const { data: comment, error } = await supabase
          .from('ticket_comments')
          .select(`
            *,
            user:user_id (
              id,
              full_name,
              avatar_url,
              role
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && comment) {
          onNewComment(comment);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to ticket status updates
 * @param {string} ticketId - Ticket ID to watch
 * @param {Function} onUpdate - Callback when ticket is updated
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToTicketUpdates(ticketId, onUpdate) {
  const channel = supabase
    .channel(`ticket-updates-${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `id=eq.${ticketId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to new tickets (for staff/admin dashboard)
 * @param {Function} onNewTicket - Callback when new ticket is created
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToNewTickets(onNewTicket) {
  const channel = supabase
    .channel('new-tickets')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tickets',
      },
      async (payload) => {
        // Fetch full ticket details with creator info
        const { data: ticket, error } = await supabase
          .from('tickets')
          .select(`
            *,
            creator:created_by (
              id,
              full_name,
              avatar_url,
              role
            ),
            assignee:assigned_to (
              id,
              full_name,
              avatar_url,
              role
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && ticket) {
          onNewTicket(ticket);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to notifications for current user
 * @param {string} userId - User ID
 * @param {Function} onNewNotification - Callback when notification arrives
 * @returns {Object} Subscription object with unsubscribe method
 */
export function subscribeToNotifications(userId, onNewNotification) {
  const channel = supabase
    .channel(`user-notifications-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNewNotification(payload.new);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to typing indicators (presence)
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - Current user ID
 * @param {Function} onUsersTyping - Callback with array of typing users
 * @returns {Object} Subscription with methods
 */
export function subscribeToTypingIndicators(ticketId, userId, onUsersTyping) {
  const channel = supabase.channel(`ticket-presence-${ticketId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const typingUsers = Object.keys(state)
        .filter(key => key !== userId && state[key][0]?.typing)
        .map(key => state[key][0]);
      
      onUsersTyping(typingUsers);
    })
    .subscribe();

  return {
    setTyping: (isTyping, userName) => {
      channel.track({
        userId,
        userName,
        typing: isTyping,
        timestamp: new Date().toISOString(),
      });
    },
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Send typing indicator
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User ID
 * @param {boolean} isTyping - Whether user is typing
 */
export function sendTypingIndicator(ticketId, userId, isTyping) {
  // This is handled by subscribeToTypingIndicators
  // Just a placeholder for API consistency
}

/**
 * Post a new comment with realtime broadcast
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User ID
 * @param {string} content - Comment content
 * @param {boolean} isInternal - Whether comment is internal
 * @returns {Promise<Object>} Created comment
 */
export async function postComment(ticketId, userId, content, isInternal = false) {
  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        content,
        is_internal: isInternal,
        is_system_message: false,
      })
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}

/**
 * Get all comments for a ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Array>} Array of comments
 */
export async function getTicketComments(ticketId) {
  try {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

/**
 * Mark messages as read
 * @param {string} ticketId - Ticket ID
 * @param {string} userId - User ID
 */
export async function markMessagesAsRead(ticketId, userId) {
  // This would be implemented if you have a read status tracking
  // For now, it's a placeholder
  return true;
}

export default {
  subscribeToTicketComments,
  subscribeToTicketUpdates,
  subscribeToNewTickets,
  subscribeToNotifications,
  subscribeToTypingIndicators,
  postComment,
  getTicketComments,
  markMessagesAsRead,
};
