const express = require("express");
const router = express.Router();
const requireSupabaseAuth = require("../middleware/requireSupabaseAuth");
const medicineController = require("../controllers/medicineController");

// All routes require authentication
router.use(requireSupabaseAuth);

// Patient routes
router.post("/", medicineController.createMedicineRequest);
router.get("/my-requests", medicineController.getMedicineRequests);

// Pharmacy staff routes
router.get("/", medicineController.getAllMedicineRequests);
router.put("/:id", medicineController.updateMedicineRequest);

module.exports = router;
