import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useMemo } from "react";
import * as profilesService from "@/services/profiles";
import { PatientProfileCard } from "@/components/PatientProfileCard";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { Link } from "react-router-dom";

const PatientProfile = () => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);

  useEffect(() => {
    loadCurrentProfile();
  }, [user]);

  useEffect(() => {
    if (currentProfile?.role === "admin") {
      loadPatients();
    }
  }, [currentProfile]);

  // Compute filtered patients - moved before early return to follow Rules of Hooks
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter((p) =>
      [p.full_name, p.email, p.role].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }, [patients, searchQuery]);

  const loadCurrentProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await profilesService.getMyProfile();
      setCurrentProfile(profile);
      if (profile?.role === "admin") {
        setProfile(null);
        setEditData({});
      } else {
        setProfile(profile);
        setEditData(profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatients = async () => {
    setIsPatientsLoading(true);
    try {
      const patientsData = await profilesService.getPatients();
      setPatients(patientsData || []);
      if (!selectedPatientId && patientsData?.length) {
        setSelectedPatientId(patientsData[0].id);
        await loadPatientProfile(patientsData[0].id);
      }
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setIsPatientsLoading(false);
    }
  };

  const loadPatientProfile = async (patientId) => {
    try {
      const profile = await profilesService.getProfileById(patientId);
      setProfile(profile);
      setEditData(profile);
    } catch (error) {
      console.error("Error loading selected patient:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const targetId = currentProfile?.role === "admin" ? selectedPatientId : user.id;
      let updatedProfile;
      
      if (currentProfile?.role === "admin" && selectedPatientId) {
        // Admin updating a patient
        updatedProfile = await profilesService.updateProfile(selectedPatientId, editData);
      } else {
        // User updating their own profile
        updatedProfile = await profilesService.updateMyProfile(editData);
      }

      setProfile(updatedProfile);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const isAdmin = currentProfile?.role === "admin";
  const displayProfile = profile;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Patient Profile</h1>
              <p className="text-muted-foreground mt-1">
                {isAdmin
                  ? "Manage patient records and medical details"
                  : "Manage your personal and health information"}
              </p>
            </div>
            {displayProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Admin: Patient Records List */}
        {isAdmin && (
          <div className="rounded-lg border border-border bg-card p-6 mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">Patient Records</h2>
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-sm px-3 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            {isPatientsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={async () => {
                      setSelectedPatientId(patient.id);
                      await loadPatientProfile(patient.id);
                      setIsEditing(false);
                    }}
                    className={`rounded-lg border px-4 py-3 text-left transition-all ${
                      selectedPatientId === patient.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {patient.full_name || patient.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {patient.email || "No email"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {patient.role}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Card */}
        {displayProfile && (
          <div className="mb-8">
            <PatientProfileCard user={user} profile={displayProfile} />
          </div>
        )}

        {/* Detailed Information */}
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">
                    {displayProfile?.email || user?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">
                    {displayProfile?.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    Address
                  </label>
                  <p className="font-medium">
                    {displayProfile?.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Health Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Blood Group
                  </label>
                  <p className="font-medium text-lg">
                    {displayProfile?.blood_group || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Age</label>
                  <p className="font-medium">
                    {displayProfile?.age || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <p className="font-medium">
                    {displayProfile?.gender || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">
                    {displayProfile?.emergency_contact_name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <p className="font-medium">
                    {displayProfile?.emergency_contact_phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-6">Edit Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={editData.phone || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Blood Group
                </label>
                <select
                  value={editData.blood_group || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, blood_group: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={editData.age || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, age: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  value={editData.gender || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={editData.address || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, address: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={editData.emergency_contact_name || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      emergency_contact_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={editData.emergency_contact_phone || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      emergency_contact_phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-border">
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PatientProfile;
