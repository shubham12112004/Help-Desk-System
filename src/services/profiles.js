/**
 * Profiles Service
 * Handles all profile and staff roster operations via backend API
 */

import APIClient from './api';

/**
 * Get current user's profile
 * @returns {Promise<Object>} Current user's profile
 */
export async function getMyProfile() {
  try {
    const response = await APIClient.get('/profiles/me');
    return response.profile;
  } catch (error) {
    console.error('Error getting my profile:', error);
    throw error;
  }
}

/**
 * Update current user's profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export async function updateMyProfile(profileData) {
  try {
    const response = await APIClient.put('/profiles/me', profileData);
    return response.profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Update any profile by ID (admin only)
 * @param {string} profileId - Profile ID to update
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 */
export async function updateProfile(profileId, profileData) {
  try {
    const response = await APIClient.put(`/profiles/${profileId}`, profileData);
    return response.profile;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Get staff roster (admin only)
 * @param {string} department - Optional department filter
 * @returns {Promise<Array>} List of staff members
 */
export async function getStaffRoster(department = null) {
  try {
    let endpoint = '/profiles/staff';
    if (department) {
      endpoint += `?department=${encodeURIComponent(department)}`;
    }
    const response = await APIClient.get(endpoint);
    return response.staff || [];
  } catch (error) {
    console.error('Error getting staff roster:', error);
    throw error;
  }
}

/**
 * Assign staff member by email (admin only)
 * @param {string} email - Staff member email
 * @param {Object} assignmentData - Assignment data (role, department, etc)
 * @returns {Promise<Object>} Updated profile
 */
export async function assignStaffByEmail(email, assignmentData) {
  try {
    const response = await APIClient.post('/profiles/staff/assign', {
      email,
      ...assignmentData,
    });
    return response.profile;
  } catch (error) {
    console.error('Error assigning staff:', error);
    throw error;
  }
}

/**
 * Update staff member (admin only)
 * @param {string} staffId - Staff member ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated profile
 */
export async function updateStaffMember(staffId, updateData) {
  try {
    const response = await APIClient.put(`/profiles/staff/${staffId}`, updateData);
    return response.profile;
  } catch (error) {
    console.error('Error updating staff member:', error);
    throw error;
  }
}

/**
 * Remove staff member (admin only)
 * @param {string} staffId - Staff member ID
 * @returns {Promise<void>}
 */
export async function removeStaffMember(staffId) {
  try {
    await APIClient.post(`/profiles/staff/${staffId}/remove`);
  } catch (error) {
    console.error('Error removing staff member:', error);
    throw error;
  }
}

/**
 * Get list of patients (admin/staff only)
 * @returns {Promise<Array>} List of patients
 */
export async function getPatients() {
  try {
    const response = await APIClient.get('/profiles/patients');
    return response.patients || [];
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
}

/**
 * Get profile by ID
 * @param {string} profileId - Profile ID
 * @returns {Promise<Object>} Profile data
 */
export async function getProfileById(profileId) {
  try {
    const response = await APIClient.get(`/profiles/${profileId}`);
    return response.profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}
