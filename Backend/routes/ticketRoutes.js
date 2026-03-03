const express = require("express");
const requireSupabaseAuth = require("../middleware/requireSupabaseAuth");
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  deleteTicket,
  getTicketStats,
  searchTickets,
  getTicketComments,
  postComment,
  getAttachments,
  addAttachment,
} = require("../controllers/ticketController");

const router = express.Router();

router.use(requireSupabaseAuth);

router.get("/stats", getTicketStats);
router.get("/search", searchTickets);
router.get("/", getTickets);
router.post("/", createTicket);
router.get("/:id", getTicketById);
router.put("/:id/status", updateTicketStatus);
router.put("/:id/assign", assignTicket);
router.put("/:id/priority", updateTicketPriority);
router.delete("/:id", deleteTicket);
router.get("/:id/comments", getTicketComments);
router.post("/:id/comments", postComment);
router.get("/:id/attachments", getAttachments);
router.post("/:id/attachments", addAttachment);

module.exports = router;
