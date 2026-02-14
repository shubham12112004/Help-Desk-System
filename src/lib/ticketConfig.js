export const statusConfig = {
  open: { label: "Open", className: "bg-blue-500 text-white" },
  "in-progress": { label: "In Progress", className: "bg-yellow-500 text-black" },
  resolved: { label: "Resolved", className: "bg-green-500 text-white" },
  closed: { label: "Closed", className: "bg-gray-500 text-white" },
};

export const priorityConfig = {
  low: { label: "Low", color: "text-green-500" },
  medium: { label: "Medium", color: "text-yellow-500" },
  high: { label: "High", color: "text-orange-500" },
  urgent: { label: "Urgent", color: "text-red-500" },
};

export const typeConfig = {
  "it-support": { label: "IT Support", color: "bg-blue-100 text-blue-700" },
  "patient-support": { label: "Patient Support", color: "bg-purple-100 text-purple-700" },
  "internal-operations": { label: "Internal Ops", color: "bg-orange-100 text-orange-700" },
};

export const categoryLabels = {
  technical: "Technical",
  billing: "Billing",
  appointment: "Appointment",
  general: "General",
};

export const departmentLabels = {
  emergency: "Emergency",
  cardiology: "Cardiology",
  radiology: "Radiology",
  reception: "Reception",
  pharmacy: "Pharmacy",
  administration: "Administration",
};

export const categoriesByType = {
  "it-support": ["technical", "general"],
  "patient-support": ["appointment", "billing", "general"],
  "internal-operations": ["general"],
};