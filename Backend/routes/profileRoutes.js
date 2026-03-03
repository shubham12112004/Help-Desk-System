const express = require("express");
const requireSupabaseAuth = require("../middleware/requireSupabaseAuth");
const {
  getMyProfile,
  updateMyProfile,
  getStaffRoster,
  assignStaffByEmail,
  updateStaffMember,
  removeStaffMember,
  getPatients,
  getProfileById,
} = require("../controllers/profileController");

const router = express.Router();

router.use(requireSupabaseAuth);

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.get("/staff", getStaffRoster);
router.post("/staff/assign", assignStaffByEmail);
router.put("/staff/:id", updateStaffMember);
router.post("/staff/:id/remove", removeStaffMember);
router.get("/patients", getPatients);
router.get("/:id", getProfileById);

module.exports = router;
