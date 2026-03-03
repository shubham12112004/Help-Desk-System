const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const TicketComment = require("../models/TicketComment");
const TicketAttachment = require("../models/TicketAttachment");
const Notification = require("../models/Notification");
const Profile = require("../models/Profile");

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

async function generateTicketNumber() {
  const count = await Ticket.countDocuments();
  const ticketNum = count + 1;
  return `HDS-${String(ticketNum).padStart(6, "0")}`;
}

function formatProfileSummary(profile) {
  if (!profile) return null;
  return {
    id: profile.userId,
    full_name: profile.full_name,
    role: profile.role,
    department: profile.department,
  };
}

function formatTicket(ticket, options = {}) {
  const data = ticket.toObject();
  const commentsCount = options.commentsCount || 0;

  return {
    id: data._id,
    ticket_number: data.ticket_number,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    status: data.status,
    created_by: data.created_by,
    assigned_to: data.assigned_to,
    department: data.department,
    first_response_at: data.first_response_at,
    resolved_at: data.resolved_at,
    closed_at: data.closed_at,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    creator: options.creator || null,
    assignee: options.assignee || null,
    comments: [{ count: commentsCount }],
  };
}

async function attachProfiles(tickets) {
  const userIds = new Set();
  tickets.forEach((ticket) => {
    if (ticket.created_by) userIds.add(ticket.created_by);
    if (ticket.assigned_to) userIds.add(ticket.assigned_to);
  });

  const profiles = await Profile.find({ userId: { $in: Array.from(userIds) } });
  const profileMap = new Map(
    profiles.map((profile) => [profile.userId, profile])
  );

  return profileMap;
}

async function attachCommentCounts(ticketIds) {
  const counts = await TicketComment.aggregate([
    { $match: { ticket_id: { $in: ticketIds } } },
    { $group: { _id: "$ticket_id", count: { $sum: 1 } } },
  ]);

  const map = new Map();
  counts.forEach((entry) => {
    map.set(String(entry._id), entry.count);
  });
  return map;
}

async function createNotification(userId, ticketId, type, message) {
  if (!userId) return;
  await Notification.create({
    user_id: userId,
    ticket_id: ticketId || null,
    type,
    message,
    is_read: false,
  });
}

exports.createTicket = async (req, res) => {
  try {
    const ticketNumber = await generateTicketNumber();
    const department = req.body.department || "";
    const category = req.body.category;
    const priority = req.body.priority || "medium";
    
    const ticket = await Ticket.create({
      ticket_number: ticketNumber,
      title: req.body.title,
      description: req.body.description,
      category: category,
      priority: priority,
      status: "open",
      created_by: req.user.id,
      department: department,
    });

    const creator = await Profile.findOne({ userId: req.user.id });

    // Auto-assign to available staff
    const assignedStaff = await autoAssignTicketToStaff(ticket, department, category, priority);
    
    if (assignedStaff) {
      ticket.assigned_to = assignedStaff.userId;
      ticket.status = "assigned";
      await ticket.save();
      
      await createNotification(
        assignedStaff.userId,
        ticket._id,
        "ticket_assigned",
        `New ticket ${ticket.ticket_number} assigned to you`
      );
    }

    await createNotification(
      req.user.id,
      ticket._id,
      "ticket_created",
      assignedStaff 
        ? `Ticket ${ticket.ticket_number} created and assigned to staff`
        : `Ticket ${ticket.ticket_number} created successfully`
    );

    return res.status(201).json({
      ticket: formatTicket(ticket, {
        creator: formatProfileSummary(creator),
        assignee: assignedStaff ? formatProfileSummary(assignedStaff) : null,
        commentsCount: 0,
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating ticket" });
  }
};

async function autoAssignTicketToStaff(ticket, department, category, priority) {
  try {
    // Find available staff members
    const query = { role: { $in: ["staff", "doctor"] } };
    
    // Prefer staff from same department if specified
    if (department) {
      query.department = department;
    }
    
    const staffMembers = await Profile.find(query).limit(10);
    
    if (staffMembers.length === 0) {
      // Fallback: try any staff member
      const anyStaff = await Profile.find({ role: { $in: ["staff", "doctor"] } }).limit(5);
      if (anyStaff.length === 0) return null;
      staffMembers.push(...anyStaff);
    }
    
    // Get ticket counts for each staff to balance load
    const staffIds = staffMembers.map(s => s.userId);
    const ticketCounts = await Ticket.aggregate([
      { 
        $match: { 
          assigned_to: { $in: staffIds },
          status: { $in: ["assigned", "in_progress"] }
        } 
      },
      { $group: { _id: "$assigned_to", count: { $sum: 1 } } }
    ]);
    
    const countMap = new Map(ticketCounts.map(tc => [tc._id, tc.count]));
    
    // Sort staff by workload (assign to least busy)
    staffMembers.sort((a, b) => {
      const countA = countMap.get(a.userId) || 0;
      const countB = countMap.get(b.userId) || 0;
      return countA - countB;
    });
    
    // High priority tickets go to most experienced (assume first in list)
    if (priority === "high" || priority === "urgent" || priority === "critical") {
      return staffMembers[0];
    }
    
    // Otherwise assign to least busy
    return staffMembers[0];
  } catch (error) {
    console.error("Auto-assign ticket error:", error);
    return null;
  }
}

exports.getTickets = async (req, res) => {
  try {
    const filters = {};

    if (req.profile?.role && !["staff", "doctor", "admin"].includes(req.profile.role)) {
      filters.created_by = req.user.id;
    }

    if (req.query.status && req.query.status !== "all") {
      filters.status = req.query.status;
    }
    if (req.query.priority) {
      filters.priority = req.query.priority;
    }
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.assignedTo) {
      filters.assigned_to = req.query.assignedTo;
    }
    if (req.query.createdBy) {
      filters.created_by = req.query.createdBy;
    }
    if (req.query.department) {
      filters.department = req.query.department;
    }

    const tickets = await Ticket.find(filters).sort({ createdAt: -1 });
    const ticketIds = tickets.map((ticket) => ticket._id);

    const profileMap = await attachProfiles(tickets);
    const commentCounts = await attachCommentCounts(ticketIds);

    const data = tickets.map((ticket) => {
      const creator = profileMap.get(ticket.created_by) || null;
      const assignee = ticket.assigned_to
        ? profileMap.get(ticket.assigned_to) || null
        : null;

      return formatTicket(ticket, {
        creator: formatProfileSummary(creator),
        assignee: formatProfileSummary(assignee),
        commentsCount: commentCounts.get(String(ticket._id)) || 0,
      });
    });

    return res.status(200).json({ tickets: data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching tickets" });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (
      !["staff", "doctor", "admin"].includes(req.profile.role) &&
      ticket.created_by !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const profileMap = await attachProfiles([ticket]);
    const commentCounts = await attachCommentCounts([ticket._id]);

    const creator = profileMap.get(ticket.created_by) || null;
    const assignee = ticket.assigned_to
      ? profileMap.get(ticket.assigned_to) || null
      : null;

    return res.status(200).json({
      ticket: formatTicket(ticket, {
        creator: formatProfileSummary(creator),
        assignee: formatProfileSummary(assignee),
        commentsCount: commentCounts.get(String(ticket._id)) || 0,
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching ticket" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const newStatus = req.body.status;
    if (!newStatus) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updateData = { status: newStatus };
    if (newStatus === "in_progress") {
      updateData.first_response_at = new Date();
    }
    if (newStatus === "resolved") {
      updateData.resolved_at = new Date();
    }
    if (newStatus === "closed") {
      updateData.closed_at = new Date();
    }

    const ticket = await Ticket.findByIdAndUpdate(ticketId, updateData, {
      new: true,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await createNotification(
      ticket.created_by,
      ticket._id,
      "ticket_updated",
      `Ticket status changed to ${newStatus}`
    );

    return res.status(200).json({ ticket: formatTicket(ticket) });
  } catch (error) {
    return res.status(500).json({ message: "Error updating ticket" });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const staffId = req.body.staffId;
    if (!staffId) {
      return res.status(400).json({ message: "staffId is required" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { assigned_to: staffId, status: "assigned" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await createNotification(
      staffId,
      ticket._id,
      "ticket_assigned",
      `You have been assigned ticket ${ticket.ticket_number}`
    );

    await createNotification(
      ticket.created_by,
      ticket._id,
      "ticket_assigned",
      `Your ticket has been assigned`
    );

    return res.status(200).json({ ticket: formatTicket(ticket) });
  } catch (error) {
    return res.status(500).json({ message: "Error assigning ticket" });
  }
};

exports.updateTicketPriority = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const priority = req.body.priority;
    if (!priority) {
      return res.status(400).json({ message: "Priority is required" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { priority },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    await createNotification(
      ticket.created_by,
      ticket._id,
      "ticket_updated",
      `Ticket priority changed to ${priority}`
    );

    return res.status(200).json({ ticket: formatTicket(ticket) });
  } catch (error) {
    return res.status(500).json({ message: "Error updating ticket" });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "cancelled", closed_at: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting ticket" });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const filters = {};
    if (![("staff"), ("doctor"), ("admin")].includes(req.profile.role)) {
      filters.created_by = req.user.id;
    }

    const tickets = await Ticket.find(filters).select("status priority");
    const stats = {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      assigned: tickets.filter((t) => t.status === "assigned").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
      high_priority: tickets.filter((t) =>
        ["high", "urgent", "critical"].includes(t.priority)
      ).length,
    };

    return res.status(200).json({ stats });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching stats" });
  }
};

exports.searchTickets = async (req, res) => {
  try {
    const searchTerm = (req.query.q || "").trim();
    if (!searchTerm) {
      return res.status(200).json({ tickets: [] });
    }

    const regex = new RegExp(searchTerm, "i");
    const filters = {
      $or: [
        { ticket_number: regex },
        { title: regex },
        { description: regex },
      ],
    };

    if (!["staff", "doctor", "admin"].includes(req.profile.role)) {
      filters.created_by = req.user.id;
    }

    const tickets = await Ticket.find(filters).sort({ createdAt: -1 }).limit(50);
    const profileMap = await attachProfiles(tickets);

    const data = tickets.map((ticket) => {
      const creator = profileMap.get(ticket.created_by) || null;
      const assignee = ticket.assigned_to
        ? profileMap.get(ticket.assigned_to) || null
        : null;

      return formatTicket(ticket, {
        creator: formatProfileSummary(creator),
        assignee: formatProfileSummary(assignee),
      });
    });

    return res.status(200).json({ tickets: data });
  } catch (error) {
    return res.status(500).json({ message: "Error searching tickets" });
  }
};

exports.getTicketComments = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const comments = await TicketComment.find({ ticket_id: ticketId })
      .sort({ createdAt: 1 });

    const userIds = Array.from(new Set(comments.map((c) => c.user_id)));
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(
      profiles.map((profile) => [profile.userId, profile])
    );

    const data = comments.map((comment) => {
      const profile = profileMap.get(comment.user_id) || null;
      return {
        id: comment._id,
        ticket_id: String(comment.ticket_id),
        user_id: comment.user_id,
        content: comment.content,
        is_internal: comment.is_internal,
        is_system_message: comment.is_system_message,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt,
        user: profile
          ? {
              id: profile.userId,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              role: profile.role,
            }
          : null,
      };
    });

    return res.status(200).json({ comments: data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching comments" });
  }
};

exports.postComment = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    if (!req.body.content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await TicketComment.create({
      ticket_id: ticketId,
      user_id: req.user.id,
      content: req.body.content,
      is_internal: !!req.body.is_internal,
      is_system_message: false,
    });

    const profile = await Profile.findOne({ userId: req.user.id });

    const ticket = await Ticket.findById(ticketId);
    if (ticket && ticket.created_by !== req.user.id) {
      await createNotification(
        ticket.created_by,
        ticket._id,
        "ticket_commented",
        "New comment on your ticket"
      );
    }

    return res.status(201).json({
      comment: {
        id: comment._id,
        ticket_id: String(comment.ticket_id),
        user_id: comment.user_id,
        content: comment.content,
        is_internal: comment.is_internal,
        is_system_message: comment.is_system_message,
        created_at: comment.createdAt,
        updated_at: comment.updatedAt,
        user: profile
          ? {
              id: profile.userId,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
              role: profile.role,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error posting comment" });
  }
};

exports.getAttachments = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const attachments = await TicketAttachment.find({ ticket_id: ticketId });
    const userIds = Array.from(new Set(attachments.map((a) => a.uploaded_by)));
    const profiles = await Profile.find({ userId: { $in: userIds } });
    const profileMap = new Map(
      profiles.map((profile) => [profile.userId, profile])
    );

    const data = attachments.map((attachment) => {
      const uploader = profileMap.get(attachment.uploaded_by) || null;
      return {
        id: attachment._id,
        ticket_id: String(attachment.ticket_id),
        comment_id: attachment.comment_id ? String(attachment.comment_id) : null,
        uploaded_by: attachment.uploaded_by,
        file_name: attachment.file_name,
        file_path: attachment.file_path,
        file_type: attachment.file_type,
        file_size: attachment.file_size,
        created_at: attachment.createdAt,
        uploader: uploader
          ? {
              id: uploader.userId,
              full_name: uploader.full_name,
              avatar_url: uploader.avatar_url,
              role: uploader.role,
            }
          : null,
      };
    });

    return res.status(200).json({ attachments: data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching attachments" });
  }
};

exports.addAttachment = async (req, res) => {
  try {
    const ticketId = toObjectId(req.params.id);
    if (!ticketId) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    const { fileName, filePath, fileType, fileSize, commentId } = req.body;

    if (!fileName || !filePath) {
      return res.status(400).json({ message: "Missing file data" });
    }

    const attachment = await TicketAttachment.create({
      ticket_id: ticketId,
      comment_id: commentId ? toObjectId(commentId) : null,
      uploaded_by: req.user.id,
      file_name: fileName,
      file_path: filePath,
      file_type: fileType || "",
      file_size: fileSize || 0,
    });

    return res.status(201).json({
      attachment: {
        id: attachment._id,
        ticket_id: String(attachment.ticket_id),
        comment_id: attachment.comment_id ? String(attachment.comment_id) : null,
        uploaded_by: attachment.uploaded_by,
        file_name: attachment.file_name,
        file_path: attachment.file_path,
        file_type: attachment.file_type,
        file_size: attachment.file_size,
        created_at: attachment.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error saving attachment" });
  }
};
