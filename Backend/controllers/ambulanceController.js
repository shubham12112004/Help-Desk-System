const AmbulanceRequest = require("../models/AmbulanceRequest");
const Notification = require("../models/Notification");

// Create ambulance request
exports.createAmbulanceRequest = async (req, res) => {
  try {
    const {
      pickup_location,
      destination,
      emergency_type,
      contact_number,
      user_latitude,
      user_longitude,
    } = req.body;

    const ambulanceRequest = await AmbulanceRequest.create({
      patient_id: req.user.id,
      pickup_location,
      destination: destination || "Hospital",
      emergency_type,
      contact_number,
      user_latitude: user_latitude || null,
      user_longitude: user_longitude || null,
      status: "requested",
    });

    // Create notification
    await Notification.create({
      user_id: req.user.id,
      type: "ambulance",
      message: "Your ambulance request has been submitted",
    });

    res.status(201).json({
      success: true,
      data: ambulanceRequest,
    });
  } catch (error) {
    console.error("Create ambulance request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ambulance request",
      error: error.message,
    });
  }
};

// Get ambulance requests for patient
exports.getAmbulanceRequests = async (req, res) => {
  try {
    const requests = await AmbulanceRequest.find({
      patient_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get ambulance requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ambulance requests",
      error: error.message,
    });
  }
};

// Get all ambulance requests (staff/admin)
exports.getAllAmbulanceRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const requests = await AmbulanceRequest.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get all ambulance requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ambulance requests",
      error: error.message,
    });
  }
};

// Update ambulance request (staff/admin)
exports.updateAmbulanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ambulanceRequest = await AmbulanceRequest.findByIdAndUpdate(
      id,
      {
        ...updateData,
        last_location_update: new Date(),
      },
      { new: true }
    );

    if (!ambulanceRequest) {
      return res.status(404).json({
        success: false,
        message: "Ambulance request not found",
      });
    }

    // Create notification for patient
    await Notification.create({
      user_id: ambulanceRequest.patient_id,
      type: "ambulance",
      message: `Your ambulance request has been ${updateData.status}`,
    });

    res.json({
      success: true,
      data: ambulanceRequest,
    });
  } catch (error) {
    console.error("Update ambulance request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ambulance request",
      error: error.message,
    });
  }
};
