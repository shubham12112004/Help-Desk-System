const MedicineRequest = require("../models/MedicineRequest");
const Notification = require("../models/Notification");

// Create medicine request
exports.createMedicineRequest = async (req, res) => {
  try {
    const {
      medicine_name,
      dosage,
      quantity,
      priority,
      delivery_method,
      delivery_address,
      notes,
    } = req.body;

    const medicineRequest = await MedicineRequest.create({
      patient_id: req.user.id,
      medicine_name,
      dosage,
      quantity,
      priority: priority || "medium",
      delivery_method: delivery_method || "pickup",
      delivery_address,
      notes,
      status: "pending",
    });

    // Create notification
    await Notification.create({
      user_id: req.user.id,
      type: "medicine",
      message: "Your medicine request has been submitted",
    });

    res.status(201).json({
      success: true,
      data: medicineRequest,
    });
  } catch (error) {
    console.error("Create medicine request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create medicine request",
      error: error.message,
    });
  }
};

// Get medicine requests for patient
exports.getMedicineRequests = async (req, res) => {
  try {
    const requests = await MedicineRequest.find({
      patient_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get medicine requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medicine requests",
      error: error.message,
    });
  }
};

// Get all medicine requests (pharmacy staff)
exports.getAllMedicineRequests = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const requests = await MedicineRequest.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get all medicine requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medicine requests",
      error: error.message,
    });
  }
};

// Update medicine request (pharmacy staff)
exports.updateMedicineRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const medicineRequest = await MedicineRequest.findByIdAndUpdate(
      id,
      {
        ...updateData,
        dispensed_by: updateData.status === "dispensed" ? req.user.id : undefined,
        dispensed_at: updateData.status === "dispensed" ? new Date() : undefined,
      },
      { new: true }
    );

    if (!medicineRequest) {
      return res.status(404).json({
        success: false,
        message: "Medicine request not found",
      });
    }

    // Create notification for patient
    await Notification.create({
      user_id: medicineRequest.patient_id,
      type: "medicine",
      message: `Your medicine request is ${updateData.status}`,
    });

    res.json({
      success: true,
      data: medicineRequest,
    });
  } catch (error) {
    console.error("Update medicine request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update medicine request",
      error: error.message,
    });
  }
};
