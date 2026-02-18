import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";

  useEffect(() => {
    if (!isStaff) {
      navigate("/dashboard");
      return;
    }

    fetchStaffRoster();
  }, [isStaff, navigate]);

  const fetchStaffRoster = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,role,email,department,is_on_duty,current_tickets_count")
        .in("role", ["staff", "doctor", "admin"])
        .order("is_on_duty", { ascending: false })
        .order("full_name");

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff roster:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (isOnDuty) => {
    return isOnDuty
      ? "bg-green-500/10 text-green-600"
      : "bg-gray-500/10 text-gray-600";
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
