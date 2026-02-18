// Role-based access control constants and utilities

export const ROLES = {
  CITIZEN: 'citizen',
  PATIENT: 'patient',
  STAFF: 'staff',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

export const ROLE_HIERARCHY = {
  [ROLES.CITIZEN]: 1,
  [ROLES.PATIENT]: 1,
  [ROLES.STAFF]: 3,
  [ROLES.DOCTOR]: 4,
  [ROLES.ADMIN]: 5,
};

export const PERMISSIONS = {
  // Ticket permissions
  VIEW_ALL_TICKETS: [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  CREATE_TICKET: [ROLES.CITIZEN, ROLES.PATIENT, ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  ASSIGN_TICKET: [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  CLOSE_TICKET: [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  DELETE_TICKET: [ROLES.ADMIN],
  
  // Appointment permissions
  VIEW_ALL_APPOINTMENTS: [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  CREATE_APPOINTMENT: [ROLES.PATIENT, ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  MANAGE_APPOINTMENT: [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  
  // User management
  VIEW_ALL_USERS: [ROLES.STAFF, ROLES.ADMIN],
  MANAGE_USERS: [ROLES.ADMIN],
  
  // Admin features
  VIEW_ANALYTICS: [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN],
  MANAGE_SLA: [ROLES.ADMIN],
  SYSTEM_SETTINGS: [ROLES.ADMIN],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(userRole);
};

/**
 * Check if a role is at least a certain level
 */
export const hasMinimumRole = (userRole, minimumRole) => {
  if (!userRole || !minimumRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minimumRole] || 0);
};

/**
 * Get user-friendly role name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.CITIZEN]: 'Citizen',
    [ROLES.PATIENT]: 'Patient',
    [ROLES.STAFF]: 'Staff',
    [ROLES.DOCTOR]: 'Doctor',
    [ROLES.ADMIN]: 'Administrator',
  };
  return roleNames[role] || role;
};

/**
 * Get role color for badges
 */
export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.CITIZEN]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    [ROLES.PATIENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [ROLES.STAFF]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [ROLES.DOCTOR]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [ROLES.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return roleColors[role] || roleColors[ROLES.CITIZEN];
};

/**
 * Check if user is staff member (staff, doctor, or admin)
 */
export const isStaffMember = (role) => {
  return [ROLES.STAFF, ROLES.DOCTOR, ROLES.ADMIN].includes(role);
};

/**
 * Check if user can assign tickets
 */
export const canAssignTickets = (role) => {
  return hasPermission(role, 'ASSIGN_TICKET');
};

/**
 * Check if user can view all tickets
 */
export const canViewAllTickets = (role) => {
  return hasPermission(role, 'VIEW_ALL_TICKETS');
};
