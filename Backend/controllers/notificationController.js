const Notification = require("../models/Notification");
const Ticket = require("../models/Ticket");

function formatNotification(notification, ticketMap) {
  const data = notification.toObject();
  const ticket = data.ticket_id ? ticketMap.get(String(data.ticket_id)) : null;

  return {
    id: data._id,
    user_id: data.user_id,
    ticket_id: data.ticket_id ? String(data.ticket_id) : null,
    type: data.type,
    message: data.message,
    is_read: data.is_read,
    read_at: data.read_at,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    ticket: ticket
      ? {
          id: ticket._id,
          ticket_number: ticket.ticket_number,
          title: ticket.title,
          status: ticket.status,
        }
      : null,
  };
}

exports.getNotifications = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    const ticketIds = notifications
      .map((n) => n.ticket_id)
      .filter(Boolean);

    const tickets = await Ticket.find({ _id: { $in: ticketIds } });
    const ticketMap = new Map(
      tickets.map((ticket) => [String(ticket._id), ticket])
    );

    const data = notifications.map((n) => formatNotification(n, ticketMap));
    return res.status(200).json({ notifications: data });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching notifications" });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user_id: req.user.id,
      is_read: false,
    });
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching unread count" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { $set: { is_read: true, read_at: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      notification: formatNotification(notification, new Map()),
    });
  } catch (error) {
    return res.status(500).json({ message: "Error updating notification" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { $set: { is_read: true, read_at: new Date() } }
    );
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Error updating notifications" });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting notification" });
  }
};
