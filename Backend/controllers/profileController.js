const Profile = require("../models/Profile");

function formatProfile(profile) {
  const data = profile.toObject();
  return {
    id: data.userId,
    user_id: data.userId,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    phone: data.phone,
    avatar_url: data.avatar_url,
    department: data.department,
    address: data.address,
    emergency_contact: data.emergency_contact,
    is_active: data.is_active,
    is_on_duty: data.is_on_duty,
    current_tickets_count: data.current_tickets_count,
    employee_id: data.employee_id,
    last_login_at: data.last_login_at,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  };
}

function requireAdmin(profile) {
  return profile?.role === "admin";
}

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    return res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "full_name",
      "phone",
      "avatar_url",
      "department",
      "address",
      "emergency_contact",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile" });
  }
};

exports.getStaffRoster = async (req, res) => {
  try {
    if (!requireAdmin(req.profile)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const staff = await Profile.find({
      role: { $in: ["staff", "doctor", "admin"] },
    }).sort({ is_on_duty: -1, full_name: 1 });

    return res.status(200).json({
      staff: staff.map(formatProfile),
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching staff roster" });
  }
};

exports.assignStaffByEmail = async (req, res) => {
  try {
    if (!requireAdmin(req.profile)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { email, full_name, role, department, phone } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const profile = await Profile.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        $set: {
          full_name: full_name || undefined,
          role: role || "staff",
          department: department || "",
          phone: phone || "",
        },
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        message: "User profile not found. Ask the user to sign in first.",
      });
    }

    return res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    return res.status(500).json({ message: "Error assigning staff member" });
  }
};

exports.updateStaffMember = async (req, res) => {
  try {
    if (!requireAdmin(req.profile)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const updateFields = ["full_name", "email", "role", "department", "phone"];
    const updateData = {};

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.id },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    return res.status(500).json({ message: "Error updating staff member" });
  }
};

exports.removeStaffMember = async (req, res) => {
  try {
    if (!requireAdmin(req.profile)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.id },
      { $set: { role: "citizen", department: "", is_on_duty: false } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    return res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    return res.status(500).json({ message: "Error removing staff member" });
  }
};

exports.getPatients = async (req, res) => {
  try {
    if (!requireAdmin(req.profile)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const patients = await Profile.find({
      role: { $in: ["patient", "citizen"] },
    }).sort({ full_name: 1 });

    return res.status(200).json({ patients: patients.map(formatProfile) });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching patients" });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const targetId = req.params.id;
    const isSelf = req.user.id === targetId;

    if (!isSelf && !requireAdmin(req.profile)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const profile = await Profile.findOne({ userId: targetId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile: formatProfile(profile) });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile" });
  }
};
