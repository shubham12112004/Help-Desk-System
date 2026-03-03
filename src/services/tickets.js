/**
 * Comprehensive Tickets Service
 * Handles all ticket CRUD operations via backend API
 */

import APIClient from './api';

/**
 * Create a new ticket
 * @param {Object} ticketData - Ticket information
 * @param {Array} files - Array of files to attach
 * @returns {Promise<Object>} Created ticket
 */
export async function createTicket(ticketData, files = []) {
  try {
    const ticket = await APIClient.post('/tickets', {
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || 'medium',
      department: ticketData.department,
    });

    // Upload attachments if any
    if (files && files.length > 0) {
      try {
        // Files would be handled separately via Supabase Storage
        // Save metadata to backend
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          // Upload to Supabase Storage
          const { supabase } = await import('@/integrations/supabase/client');
          const fileName = `${ticket.id}/${Date.now()}-${i}`;
          
          const { data: uploadData } = await supabase.storage
            .from('ticket-attachments')
            .upload(fileName, file);

          if (uploadData) {
            // Save attachment metadata to backend
            await APIClient.post(`/tickets/${ticket.id}/attachments`, {
              fileName: file.name,
              filePath: uploadData.path,
              fileType: file.type,
              fileSize: file.size,
            });
          }
        }
      } catch (fileError) {
        console.error('File upload error:', fileError);
        // Don't fail ticket creation if file upload fails
      }
    }

    return ticket;
  } catch (error) {
    console.error('Error in createTicket:', error);
    throw error;
  }
}

/**
 * Get all tickets with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of tickets
 */
export async function getTickets(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.priority) {
      queryParams.append('priority', filters.priority);
    }
    if (filters.category) {
      queryParams.append('category', filters.category);
    }
    if (filters.assignedTo) {
      queryParams.append('assignedTo', filters.assignedTo);
    }
    if (filters.createdBy) {
      queryParams.append('createdBy', filters.createdBy);
    }
    if (filters.department) {
      queryParams.append('department', filters.department);
    }

    const endpoint = `/tickets${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await APIClient.get(endpoint);
    return response.tickets || [];
  } catch (error) {
    console.error('Error in getTickets:', error);
    throw error;
  }
}

/**
 * Get a single ticket by ID
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket details
 */
export async function getTicketById(ticketId) {
  try {
    const response = await APIClient.get(`/tickets/${ticketId}`);
    return response.ticket;
  } catch (error) {
    console.error('Error in getTicketById:', error);
    throw error;
  }
}

/**
 * Update ticket status
 * @param {string} ticketId - Ticket ID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Updated ticket
 */
export async function updateTicketStatus(ticketId, newStatus) {
  try {
    const response = await APIClient.put(`/tickets/${ticketId}/status`, {
      status: newStatus,
    });
    return response.ticket;
  } catch (error) {
    console.error('Error in updateTicketStatus:', error);
    throw error;
  }
}

/**
 * Assign ticket to a staff member
 * @param {string} ticketId - Ticket ID
 * @param {string} staffId - Staff member ID
 * @returns {Promise<Object>} Updated ticket
 */
export async function assignTicket(ticketId, staffId) {
  try {
    const response = await APIClient.put(`/tickets/${ticketId}/assign`, {
      staffId,
    });
    return response.ticket;
  } catch (error) {
    console.error('Error in assignTicket:', error);
    throw error;
  }
}

/**
 * Update ticket priority
 * @param {string} ticketId - Ticket ID
 * @param {string} priority - New priority
 * @returns {Promise<Object>} Updated ticket
 */
export async function updateTicketPriority(ticketId, priority) {
  try {
    const response = await APIClient.put(`/tickets/${ticketId}/priority`, {
      priority,
    });
    return response.ticket;
  } catch (error) {
    console.error('Error in updateTicketPriority:', error);
    throw error;
  }
}

/**
 * Delete a ticket
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<void>}
 */
export async function deleteTicket(ticketId) {
  try {
    await APIClient.delete(`/tickets/${ticketId}`);
  } catch (error) {
    console.error('Error in deleteTicket:', error);
    throw error;
  }
}

/**
 * Get ticket statistics
 * @returns {Promise<Object>} Ticket statistics
 */
export async function getTicketStats() {
  try {
    const response = await APIClient.get('/tickets/stats');
    return response.stats;
  } catch (error) {
    console.error('Error in getTicketStats:', error);
    throw error;
  }
}

/**
 * Get staff members for assignment
 * @param {string} department - Optional department filter
 * @returns {Promise<Array>} List of staff members
 */
export async function getStaffMembers(department = null) {
  try {
    let endpoint = '/profiles/staff';
    if (department) {
      endpoint += `?department=${encodeURIComponent(department)}`;
    }
    const response = await APIClient.get(endpoint);
    return response.staff || [];
  } catch (error) {
    console.error('Error in getStaffMembers:', error);
    throw error;
  }
}

/**
 * Get ticket comments
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Array>} List of comments
 */
export async function getTicketComments(ticketId) {
  try {
    const response = await APIClient.get(`/tickets/${ticketId}/comments`);
    return response.comments || [];
  } catch (error) {
    console.error('Error in getTicketComments:', error);
    throw error;
  }
}

/**
 * Post a comment on a ticket
 * @param {string} ticketId - Ticket ID
 * @param {string} content - Comment content
 * @param {boolean} isInternal - Whether comment is internal
 * @returns {Promise<Object>} Created comment
 */
export async function postComment(ticketId, content, isInternal = false) {
  try {
    const response = await APIClient.post(`/tickets/${ticketId}/comments`, {
      content,
      is_internal: isInternal,
    });
    return response.comment;
  } catch (error) {
    console.error('Error in postComment:', error);
    throw error;
  }
}

/**
 * Search tickets
 * @param {string} searchTerm - Search query
 * @returns {Promise<Array>} Matching tickets
 */
export async function searchTickets(searchTerm) {
  try {
    const response = await APIClient.get(`/tickets/search?q=${encodeURIComponent(searchTerm)}`);
    return response.tickets || [];
  } catch (error) {
    console.error('Error in searchTickets:', error);
    throw error;
  }
}

/**
 * Get ticket attachments
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Array>} List of attachments
 */
export async function getTicketAttachments(ticketId) {
  try {
    const response = await APIClient.get(`/tickets/${ticketId}/attachments`);
    return response.attachments || [];
  } catch (error) {
    console.error('Error in getTicketAttachments:', error);
    return [];
  }
}
