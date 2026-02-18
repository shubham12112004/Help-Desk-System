import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const HospitalAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [slaData, setSLAData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";

  useEffect(() => {
    if (!isStaff) {
      navigate("/dashboard");
      return;
    }

    fetchAnalytics();
  }, [isStaff, navigate]);

  const fetchAnalytics = async () => {
    try {
      // Fetch ticket statistics
      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("id, status, priority, created_at, updated_at, department");

      if (ticketsError) throw ticketsError;

      // Calculate analytics
      const stats = {
        total: tickets.length,
        byStatus: {
          open: tickets.filter((t) => t.status === "open").length,
          in_progress: tickets.filter((t) => t.status === "in_progress").length,
          resolved: tickets.filter((t) => t.status === "resolved").length,
          closed: tickets.filter((t) => t.status === "closed").length,
        },
        byPriority: {
          low: tickets.filter((t) => t.priority === "low").length,
          medium: tickets.filter((t) => t.priority === "medium").length,
          high: tickets.filter((t) => t.priority === "high").length,
          urgent: tickets.filter((t) => t.priority === "urgent").length,
        },
        avgResolutionTime: calculateAvgResolutionTime(tickets),
        overdueSLA: calculateOverdueSLA(tickets),
      };

      // Calculate SLA compliance by department
      const depts = new Set(tickets.map((t) => t.department).filter(Boolean));
      const slaByDept = Array.from(depts).map((dept) => {
        const deptTickets = tickets.filter((t) => t.department === dept);
        return {
          name: dept,
          compliance: calculateSLACompliance(deptTickets),
          tickets: deptTickets.length,
        };
      });

      setAnalytics(stats);
      setSLAData(slaByDept);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAvgResolutionTime = (tickets) => {
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
    if (resolved.length === 0) return 0;
    const sum = resolved.reduce((acc, t) => {
      const created = new Date(t.created_at);
      const updated = new Date(t.updated_at);
      return acc + (updated - created) / (1000 * 60 * 60); // hours
    }, 0);
    return Math.round(sum / resolved.length);
  };

  const calculateOverdueSLA = (tickets) => {
    const opened = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved");
    const now = new Date();
    return opened.filter((t) => {
      const created = new Date(t.created_at);
      const hours = (now - created) / (1000 * 60 * 60);
      const slaHours = t.priority === "urgent" ? 2 : t.priority === "high" ? 8 : 24;
      return hours > slaHours;
    }).length;
  };

  const calculateSLACompliance = (tickets) => {
    if (tickets.length === 0) return 100;
    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
    if (resolved.length === 0) return 0;
    const compliant = resolved.filter((t) => {
      const created = new Date(t.created_at);
      const updated = new Date(t.updated_at);
      const hours = (updated - created) / (1000 * 60 * 60);
      const slaHours = t.priority === "urgent" ? 2 : t.priority === "high" ? 8 : 24;
      return hours <= slaHours;
    }).length;
    return Math.round((compliant / resolved.length) * 100);
  };

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
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Hospital Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Real-time helpdesk performance and SLA compliance metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics?.total || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Avg Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{analytics?.avgResolutionTime || 0}h</p>
              <p className="text-xs text-muted-foreground mt-1">hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Overdue SLA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{analytics?.overdueSLA || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">tickets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {analytics?.byStatus ? calculateSLACompliance([]) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">overall</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tickets by Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.byStatus && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Open</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-blue-500/20 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${
                                (analytics.byStatus.open / analytics.total) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {analytics.byStatus.open}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">In Progress</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-yellow-500/20 rounded-full">
                          <div
                            className="h-full bg-yellow-500 rounded-full"
                            style={{
                              width: `${
                                (analytics.byStatus.in_progress / analytics.total) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {analytics.byStatus.in_progress}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resolved</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-green-500/20 rounded-full">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${
                                (analytics.byStatus.resolved / analytics.total) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {analytics.byStatus.resolved}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Closed</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-500/20 rounded-full">
                          <div
                            className="h-full bg-gray-500 rounded-full"
                            style={{
                              width: `${
                                (analytics.byStatus.closed / analytics.total) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">
                          {analytics.byStatus.closed}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tickets by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.byPriority && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Urgent</span>
                      <Badge className="bg-red-500/10 text-red-600">
                        {analytics.byPriority.urgent}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">High</span>
                      <Badge className="bg-orange-500/10 text-orange-600">
                        {analytics.byPriority.high}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Medium</span>
                      <Badge className="bg-yellow-500/10 text-yellow-600">
                        {analytics.byPriority.medium}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Low</span>
                      <Badge className="bg-green-500/10 text-green-600">
                        {analytics.byPriority.low}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department SLA Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              SLA Compliance by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slaData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3">Department</th>
                      <th className="text-center py-2 px-3">Tickets</th>
                      <th className="text-right py-2 px-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaData.map((dept) => (
                      <tr key={dept.name} className="border-b border-border/50">
                        <td className="py-3 px-3 font-medium">{dept.name}</td>
                        <td className="text-center py-3 px-3">{dept.tickets}</td>
                        <td className="text-right py-3 px-3">
                          <Badge
                            className={
                              dept.compliance >= 80
                                ? "bg-green-500/10 text-green-600"
                                : dept.compliance >= 60
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-red-500/10 text-red-600"
                            }
                          >
                            {dept.compliance}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No department data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default HospitalAnalytics;
