const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const {
      department,
      appointment_date,
      appointment_time,
      time_slot,
      reason,
    } = req.body;

    const appointment = await Appointment.create({
      patient_id: req.user.id,
      department,
      appointment_date,
      appointment_time,
      time_slot,
      reason,
      status: "scheduled",
    });

    // Create notification
    await Notification.create({
      user_id: req.user.id,
      type: "appointment",
      message: `Appointment scheduled for ${department} on ${appointment_date}`,
    });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};

// Get appointments for patient
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient_id: req.user.id,
    }).sort({ appointment_date: 1 });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// Get all appointments (staff/admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const { department, status, date } = req.query;
    const query = {};
    
    if (department) query.department = department;
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointment_date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query).sort({ appointment_date: 1 });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Create notification
    await Notification.create({
      user_id: appointment.patient_id,
      type: "appointment",
      message: `Your appointment has been ${updateData.status}`,
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Create notification
    await Notification.create({
      user_id: appointment.patient_id,
      type: "appointment",
      message: "Your appointment has been cancelled",
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};
