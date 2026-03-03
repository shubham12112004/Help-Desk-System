import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import * as profilesService from "@/services/profiles";
import {
  Users,
  Calendar,
  Clock,
  PhoneOff,
  CheckCircle,
  ArrowLeft,
  Activity,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

const StaffRoster = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "staff",
    department: "",
    phone: "",
  });
  const [editingId, setEditingId] = useState(null);

  const userRole = profile?.role ?? "citizen";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const profile = await profilesService.getMyProfile();
        setProfile(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!isAdmin && profile) {
      navigate("/dashboard");
      return;
    }

    if (profile) {
      fetchStaffRoster();
    }
  }, [isAdmin, navigate, profile]);

  const fetchStaffRoster = async () => {
    try {
      setIsLoading(true);
      const staffData = await profilesService.getStaffRoster();
      setStaff(staffData || []);
    } catch (error) {
      console.error("Error fetching staff roster:", error);
      setErrorMessage("Failed to fetch staff roster");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (isOnDuty) => {
    return isOnDuty
      ? "bg-green-500/10 text-green-600"
      : "bg-gray-500/10 text-gray-600";
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      role: "staff",
      department: "",
      phone: "",
    });
    setEditingId(null);
    setErrorMessage("");
  };

  const handleEdit = (member) => {
    setFormData({
      full_name: member.full_name || "",
      email: member.email || "",
      role: member.role || "staff",
      department: member.department || "",
      phone: member.phone || "",
    });
    setEditingId(member.id);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = async (member) => {
    setErrorMessage("");
    try {
      setIsSaving(true);
      await profilesService.removeStaffMember(member.id);
      await fetchStaffRoster();
    } catch (error) {
      console.error("Error removing staff member:", error);
      setErrorMessage("Failed to remove staff member");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.full_name) {
      setErrorMessage("Name and email are required.");
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await profilesService.updateStaffMember(editingId, {
          full_name: formData.full_name,
          role: formData.role,
          department: formData.department || null,
          phone: formData.phone || null,
        });
      } else {
        // Assign new staff member by email
        await profilesService.assignStaffByEmail(formData.email, {
          full_name: formData.full_name,
          role: formData.role,
          department: formData.department || null,
          phone: formData.phone || null,
        });
      }

      resetForm();
      await fetchStaffRoster();
    } catch (error) {
      console.error("Error saving staff member:", error);
      setErrorMessage(error.message || "Failed to save staff member.");
    } finally {
      setIsSaving(false);
    }
  };

  const getDepartmentColor = (dept) => {
    const colors = {
      emergency: "bg-red-500/10 text-red-600",
      icu: "bg-purple-500/10 text-purple-600",
      surgery: "bg-blue-500/10 text-blue-600",
      nursing: "bg-pink-500/10 text-pink-600",
      radiology: "bg-cyan-500/10 text-cyan-600",
      pharmacy: "bg-yellow-500/10 text-yellow-600",
      laboratory: "bg-green-500/10 text-green-600",
      administration: "bg-slate-500/10 text-slate-600",
    };
    return colors[dept] || "bg-muted text-muted-foreground";
  };

  const onDutyCount = staff.filter((s) => s.is_on_duty).length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <Button
          onClick={() => navigate("/dashboard")}
          variant="ghost"
          size="sm"
          className="gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Staff Roster</h1>
          <p className="text-sm text-muted-foreground">
            Hospital staff availability and assignment status
          </p>
        </div>

        {/* Staff Management Form (Admin Only) */}
        {profile?.role === "admin" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingId ? "Edit Staff Member" : "Add Staff Member"}
              </CardTitle>
              <CardDescription>
                {editingId
                  ? "Update staff member details below"
                  : "Add a new staff member to the system. User must sign up first."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john.doe@hospital.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isSaving || editingId}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                    {editingId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="staff">Staff</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., emergency, cardiology"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isSaving} className="gap-2">
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Saving...
                      </>
                    ) : editingId ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Update Staff
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
                        Add Staff
                      </>
                    )}
                  </Button>

                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{staff.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                On Duty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{onDutyCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((onDutyCount / staff.length) * 100)}% availability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                Off Duty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{staff.length - onDutyCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(((staff.length - onDutyCount) / staff.length) * 100)}% offline
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-base">{member.full_name}</CardTitle>
                    <CardDescription className="text-xs">
                      {member.role?.charAt(0).toUpperCase() + member.role?.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getStatusColor(member.is_on_duty)} gap-1`}
                    >
                      {member.is_on_duty ? (
                        <>
                          <Activity className="h-3 w-3" />
                          Online
                        </>
                      ) : (
                        <>
                          <PhoneOff className="h-3 w-3" />
                          Offline
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Admin Actions */}
                {profile?.role === "admin" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(member)}
                      disabled={isSaving}
                      className="flex-1 gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to remove ${member.full_name} from staff? They will be demoted to citizen role.`
                          )
                        ) {
                          handleRemove(member);
                        }
                      }}
                      disabled={isSaving}
                      className="flex-1 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Email */}
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Email
                  </p>
                  <p className="text-sm text-foreground break-all">{member.email}</p>
                </div>

                {/* Department */}
                {member.department && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase">
                      Department
                    </p>
                    <Badge className={`${getDepartmentColor(member.department)}`}>
                      {member.department
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </Badge>
                  </div>
                )}

                {/* Tickets */}
                {member.current_tickets_count !== undefined && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-semibold uppercase">
                        Active Tickets
                      </p>
                      <Badge variant="outline">
                        {member.current_tickets_count || 0}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Workload indicator */}
                {member.current_tickets_count > 5 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-600 font-medium">
                      High workload
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {staff.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-foreground font-medium">No staff members found</p>
              <p className="text-sm text-muted-foreground">
                Try again later or contact your administrator
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default StaffRoster;
