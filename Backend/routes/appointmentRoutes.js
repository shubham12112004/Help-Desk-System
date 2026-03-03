const express = require("express");
const router = express.Router();
const requireSupabaseAuth = require("../middleware/requireSupabaseAuth");
const appointmentController = require("../controllers/appointmentController");

// All routes require authentication
router.use(requireSupabaseAuth);

// Patient routes
router.post("/", appointmentController.createAppointment);
router.get("/my-appointments", appointmentController.getAppointments);
router.delete("/:id", appointmentController.cancelAppointment);

// Staff/Admin routes
router.get("/", appointmentController.getAllAppointments);
router.put("/:id", appointmentController.updateAppointment);

module.exports = router;
