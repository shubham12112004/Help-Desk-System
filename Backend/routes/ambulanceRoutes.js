const express = require("express");
const router = express.Router();
const requireSupabaseAuth = require("../middleware/requireSupabaseAuth");
const ambulanceController = require("../controllers/ambulanceController");

// All routes require authentication
router.use(requireSupabaseAuth);

// Patient routes
router.post("/", ambulanceController.createAmbulanceRequest);
router.get("/my-requests", ambulanceController.getAmbulanceRequests);

// Staff/Admin routes
router.get("/", ambulanceController.getAllAmbulanceRequests);
router.put("/:id", ambulanceController.updateAmbulanceRequest);

module.exports = router;
