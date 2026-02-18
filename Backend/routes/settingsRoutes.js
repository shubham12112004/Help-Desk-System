const express = require("express");
const router = express.Router();
const {
  getUserSettings,
  updateUserSettings,
  getUserProfile,
  updateUserProfile,
  exportUserData,
  deactivateAccount,
} = require("../controllers/settingsController");

// Settings routes
router.get("/settings", getUserSettings);
router.put("/settings", updateUserSettings);

// Profile routes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

// Data export and account management
router.get("/export", exportUserData);
router.post("/deactivate", deactivateAccount);

module.exports = router;
