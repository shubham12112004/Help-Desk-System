const TokenQueue = require("../models/TokenQueue");
const RoomAllocation = require("../models/RoomAllocation");
const PatientMedicalRecord = require("../models/PatientMedicalRecord");
const Billing = require("../models/Billing");
const Prescription = require("../models/Prescription");
const Notification = require("../models/Notification");

// =====================================================
// PRESCRIPTIONS CONTROLLERS
// =====================================================

exports.createPrescription = async (req, res) => {
  try {
    const {
      doctor_name,
      medications,
      diagnosis,
      notes,
      valid_until,
    } = req.body;

    const prescription = await Prescription.create({
      patient_id: req.user.id,
      doctor_name,
      medications,
      diagnosis,
      notes,
      valid_until,
      status: "active",
    });

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
      error: error.message,
    });
  }
};

exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { status, patient_id } = req.query;
    const query = { patient_id: patient_id || req.user.id };
    
    if (status) query.status = status;

    const prescriptions = await Prescription.find(query).sort({ issued_date: -1 });

    res.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
      error: error.message,
    });
  }
};

// =====================================================
// TOKEN QUEUE CONTROLLERS
// =====================================================

exports.createToken = async (req, res) => {
  try {
    const { department } = req.body;

    // Get last token number for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastToken = await TokenQueue.findOne({
      department,
      issue_date: { $gte: today },
    }).sort({ token_number: -1 });

    const tokenNumber = (lastToken?.token_number || 0) + 1;

    const token = await TokenQueue.create({
      patient_id: req.user.id,
      department,
      token_number: tokenNumber,
      status: "waiting",
      estimated_wait_minutes: tokenNumber * 10,
      issue_date: new Date(),
    });

    res.status(201).json({
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Create token error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create token",
      error: error.message,
    });
  }
};

exports.getPatientTokens = async (req, res) => {
  try {
    const tokens = await TokenQueue.find({
      patient_id: req.user.id,
    }).sort({ issue_date: -1 });

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    console.error("Get tokens error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tokens",
      error: error.message,
    });
  }
};

// ======================================================
// ROOM ALLOCATION CONTROLLERS
// =====================================================

exports.allocateRoom = async (req, res) => {
  try {
    const {
      room_number,
      room_type,
      bed_number,
      floor,
      daily_rate,
      notes,
    } = req.body;

    const allocation = await RoomAllocation.create({
      patient_id: req.user.id,
      room_number,
      room_type,
      bed_number,
      floor,
      daily_rate: daily_rate || 0,
      notes,
      status: "active",
    });

    res.status(201).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    console.error("Allocate room error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to allocate room",
      error: error.message,
    });
  }
};

exports.getPatientRoomAllocations = async (req, res) => {
  try {
    const allocations = await RoomAllocation.find({
      patient_id: req.user.id,
    }).sort({ admission_date: -1 });

    res.json({
      success: true,
      data: allocations,
    });
  } catch (error) {
    console.error("Get room allocations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch room allocations",
      error: error.message,
    });
  }
};

// =====================================================
// MEDICAL RECORDS CONTROLLERS
// =====================================================

exports.createMedicalRecord = async (req, res) => {
  try {
    const {
      record_type,
      title,
      description,
      diagnosis,
      treatment_plan,
      medications,
      doctor_name,
      vital_signs,
      notes,
    } = req.body;

    const record = await PatientMedicalRecord.create({
      patient_id: req.user.id,
      record_type,
      title,
      description,
      diagnosis,
      treatment_plan,
      medications,
      doctor_name,
      vital_signs,
      notes,
      date_recorded: new Date(),
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Create medical record error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create medical record",
      error: error.message,
    });
  }
};

exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const { record_type } = req.query;
    const query = { patient_id: req.user.id };
    
    if (record_type) query.record_type = record_type;

    const records = await PatientMedicalRecord.find(query).sort({ date_recorded: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Get medical records error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical records",
      error: error.message,
    });
  }
};

// =====================================================
// BILLING CONTROLLERS
// =====================================================

exports.createBill = async (req, res) => {
  try {
    const {
      description,
      amount,
      bill_type,
      due_date,
    } = req.body;

    // Generate bill number
    const billNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const bill = await Billing.create({
      patient_id: req.user.id,
      bill_number: billNumber,
      description,
      amount,
      balance: amount,
      bill_type: bill_type || "consultation",
      due_date,
      status: "pending",
    });

    // Create notification
    await Notification.create({
      user_id: req.user.id,
      type: "billing",
      message: `New bill generated: ₹${amount}`,
    });

    res.status(201).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error("Create bill error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create bill",
      error: error.message,
    });
  }
};

exports.getPatientBills = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { patient_id: req.user.id };
    
    if (status) query.status = status;

    const bills = await Billing.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
      error: error.message,
    });
  }
};
