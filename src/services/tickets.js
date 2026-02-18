/**
 * Comprehensive Tickets Service
 * Handles all ticket CRUD operations, assignments, and status updates
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Generate unique ticket number
 */
async function generateTicketNumber() {
  const { count } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true });
  
  const ticketNum = (count || 0) + 1;
  return `HDS-${String(ticketNum).padStart(6, '0')}`;
}

/**
 * Create a new ticket
 * @param {Object} ticketData - Ticket information
 * @param {Array} files - Array of files to attach
 * @returns {Promise<Object>} Created ticket
 */
export async function createTicket(ticketData, files = []) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const ticketNumber = await generateTicketNumber();

  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert({
      ticket_number: ticketNumber,
      title: ticketData.title,
      description: ticketData.description,
      category: ticketData.category,
      priority: ticketData.priority || 'medium',
      status: 'open',
      created_by: user.id,
      department: ticketData.department,
    })
    .select(`
      *,
      creator:created_by(id, full_name, email, role, avatar_url)
    `)
    .single();

  if (error) throw error;

  // Upload attachments if any
  if (files && files.length > 0) {
    const { uploadMultipleFiles, saveAttachmentMetadata } = await import('./storage');
    const uploadedFiles = await uploadMultipleFiles(files, ticket.id);
    
    // Save attachment metadata to database
    for (const file of uploadedFiles) {
      await saveAttachmentMetadata(ticket.id, file);
    }
  }

  return ticket;
}

/**
 * Get all tickets with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of tickets
 */
export async function getTickets(filters = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'citizen';
  const isStaff = ['staff', 'doctor', 'admin'].includes(userRole);

  let query = supabase
    .from('tickets')
    .select(`
      *,
      creator:created_by(id, full_name, email, role, avatar_url, department),
      assignee:assigned_to(id, full_name, email, role, avatar_url, department),
      comments:ticket_comments(count)
    `)
    .order('created_at', { ascending: false });

  // Citizens/patients only see their own tickets
  if (!isStaff) {
    query = query.eq('created_by', user.id);
  }

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  if (filters.createdBy) {
    query = query.eq('created_by', filters.createdBy);
  }

  if (filters.department) {
    query = query.eq('department', filters.department);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get a single ticket by ID
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<Object>} Ticket details
 */
export async function getTicketById(ticketId) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      creator:created_by(id, full_name, email, role, avatar_url, department, phone),
      assignee:assigned_to(id, full_name, email, role, avatar_url, department, phone)
    `)
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update ticket status and track timestamps
 * @param {string} ticketId - Ticket UUID
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Updated ticket
 */
export async function updateTicketStatus(ticketId, newStatus) {
  const updateData = { status: newStatus };

  // Track status-specific timestamps
  if (newStatus === 'in_progress' && !updateData.first_response_at) {
    updateData.first_response_at = new Date().toISOString();
  }

  if (newStatus === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
  }

  if (newStatus === 'closed') {
    updateData.closed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tickets')
    .update(updateData)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  // Create notification for ticket creator
  await createNotification(ticketId, 'ticket_updated', 
    `Ticket status changed to ${newStatus}`);

  return data;
}

/**
 * Assign ticket to a staff member
 * @param {string} ticketId - Ticket UUID
 * @param {string} staffId - Staff member UUID
 * @returns {Promise<Object>} Updated ticket
 */
export async function assignTicket(ticketId, staffId) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ 
      assigned_to: staffId,
      status: 'assigned'
    })
    .eq('id', ticketId)
    .select(`
      *,
      creator:created_by(id, full_name, email),
      assignee:assigned_to(id, full_name, email, role)
    `)
    .single();

  if (error) throw error;

  // Create notification for assigned staff
  await createNotification(ticketId, 'ticket_assigned', 
    `You have been assigned ticket ${data.ticket_number}`, staffId);

  // Notify ticket creator
  await createNotification(ticketId, 'ticket_assigned',
    `Your ticket has been assigned to ${data.assignee.full_name}`, data.created_by);

  return data;
}

/**
 * Update ticket priority
 * @param {string} ticketId - Ticket UUID
 * @param {string} priority - New priority (low, medium, high, urgent, critical)
 * @returns {Promise<Object>} Updated ticket
 */
export async function updateTicketPriority(ticketId, priority) {
  const { data, error } = await supabase
    .from('tickets')
    .update({ priority })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;

  await createNotification(ticketId, 'ticket_updated',
    `Ticket priority changed to ${priority}`);

  return data;
}

/**
 * Delete a ticket (soft delete by setting status to cancelled)
 * @param {string} ticketId - Ticket UUID
 * @returns {Promise<void>}
 */
export async function deleteTicket(ticketId) {
  const { error } = await supabase
    .from('tickets')
    .update({ 
      status: 'cancelled',
      closed_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (error) throw error;
}

/**
 * Get ticket statistics
 * @returns {Promise<Object>} Ticket statistics
 */
export async function getTicketStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'citizen';
  const isStaff = ['staff', 'doctor', 'admin'].includes(userRole);

  let query = supabase.from('tickets').select('status, priority, created_at');

  // Citizens only see their own tickets
  if (!isStaff) {
    query = query.eq('created_by', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats = {
    total: data.length,
    open: data.filter(t => t.status === 'open').length,
    assigned: data.filter(t => t.status === 'assigned').length,
    in_progress: data.filter(t => t.status === 'in_progress').length,
    resolved: data.filter(t => t.status === 'resolved').length,
    closed: data.filter(t => t.status === 'closed').length,
    high_priority: data.filter(t => ['high', 'urgent', 'critical'].includes(t.priority)).length,
  };

  return stats;
}

/**
 * Get staff members for assignment
 * @param {string} department - Optional department filter
 * @returns {Promise<Array>} List of staff members
 */
export async function getStaffMembers(department = null) {
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, role, department, avatar_url')
    .in('role', ['staff', 'doctor', 'admin'])
    .eq('is_active', true)
    .order('full_name');

  if (department) {
    query = query.eq('department', department);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}

/**
 * Create a notification
 * @param {string} ticketId - Ticket UUID
 * @param {string} type - Notification type
 * @param {string} message - Notification message
 * @param {string} userId - Optional user ID (defaults to ticket creator)
 */
async function createNotification(ticketId, type, message, userId = null) {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: ticket } = await supabase
        .from('tickets')
        .select('created_by')
        .eq('id', ticketId)
        .single();
      
      targetUserId = ticket?.created_by;
    }

    if (!targetUserId) return;

    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        ticket_id: ticketId,
        type,
        message,
        is_read: false,
      });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Search tickets
 * @param {string} searchTerm - Search query
 * @returns {Promise<Array>} Matching tickets
 */
export async function searchTickets(searchTerm) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role || 'citizen';
  const isStaff = ['staff', 'doctor', 'admin'].includes(userRole);

  let query = supabase
    .from('tickets')
    .select(`
      *,
      creator:created_by(id, full_name, email),
      assignee:assigned_to(id, full_name, email)
    `)
    .or(`ticket_number.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!isStaff) {
    query = query.eq('created_by', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
}
