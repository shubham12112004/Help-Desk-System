export const statusConfig = {
  open: { label: "Open", className: "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/20" },
  "in-progress": { label: "In Progress", className: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 shadow-sm shadow-yellow-500/20" },
  resolved: { label: "Resolved", className: "bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400 border border-green-500/30 shadow-sm shadow-green-500/20" },
  closed: { label: "Closed", className: "bg-gradient-to-r from-gray-500/20 to-gray-600/10 text-gray-600 dark:text-gray-400 border border-gray-500/30 shadow-sm shadow-gray-500/20" },
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