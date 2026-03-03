const express = require("express");
const router = express.Router();
const requireSupabaseAuth = require("../middleware/requireSupabaseAuth");
const hospitalController = require("../controllers/hospitalController");

// All routes require authentication
router.use(requireSupabaseAuth);

// Prescription routes
router.post("/prescriptions", hospitalController.createPrescription);
router.get("/prescriptions", hospitalController.getPatientPrescriptions);

// Token Queue routes
router.post("/tokens", hospitalController.createToken);
router.get("/tokens", hospitalController.getPatientTokens);

// Room Allocation routes
router.post("/rooms", hospitalController.allocateRoom);
router.get("/rooms", hospitalController.getPatientRoomAllocations);

// Medical Records routes
router.post("/records", hospitalController.createMedicalRecord);
router.get("/records", hospitalController.getPatientMedicalRecords);

// Billing routes
router.post("/bills", hospitalController.createBill);
router.get("/bills", hospitalController.getPatientBills);

module.exports = router;
