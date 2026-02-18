import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Inbox,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
  Activity,
  ShieldCheck,
  Users,
  User,
  Bed,
  Pill,
  Microscope,
  Calendar,
  Ambulance,
  CreditCard,
  Ticket,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { tickets, stats, isLoading } = useTickets();
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";
  const [profile, setProfile] = useState(null);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };
    loadProfile();
  }, [user]);

  const recentTickets = tickets.slice(0, 5);
  const myTickets = tickets.filter((ticket) => ticket.requester_id === user?.id);
  const urgentCount = tickets.filter((ticket) => ticket.priority === "urgent").length;
  
  // Safe stats to prevent NaN
  const safeStats = {
    open: stats?.open ?? 0,
    in_progress: stats?.in_progress ?? 0,
    resolved: stats?.resolved ?? 0,
    closed: stats?.closed ?? 0,
  };
  const activeQueue = safeStats.open + safeStats.in_progress;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header with gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-3xl opacity-50" />
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Hospital help desk overview
            </p>
          </div>
        </div>

        {/* Patient Hospital Services - Only for patients */}
        {!isStaff && (
          <>
            {/* Hospital Services Navigation */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">🏥 Hospital Services</h2>
                <p className="text-muted-foreground mt-2">
                  Quick access to all your hospital and medical services
                </p>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Patient Profile */}
                <Link
                  to="/patient-profile"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200">
                      <User className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Patient Profile</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Personal & health information
                  </p>
                </Link>

                {/* Token Queue */}
                <Link
                  to="/token-queue"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">OPD Token Queue</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get and track your token
                  </p>
                </Link>

                {/* Medical */}
                <Link
                  to="/medical"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200">
                      <Bed className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Medical Info</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Room allocation & bed info
                  </p>
                </Link>

                {/* Pharmacy */}
                <Link
                  to="/pharmacy"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200">
                      <Pill className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Pharmacy</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Medicine & prescriptions
                  </p>
                </Link>

                {/* Lab Tests */}
                <Link
                  to="/lab-tests"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200">
                      <Microscope className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Lab Reports</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Test results & reports
                  </p>
                </Link>

                {/* Appointments */}
                <Link
                  to="/appointments"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-cyan-200 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-200">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Appointments</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Book doctor appointments
                  </p>
                </Link>

                {/* Emergency */}
                <Link
                  to="/emergency"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-200">
                      <Ambulance className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Emergency</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ambulance services
                  </p>
                </Link>

                {/* Billing */}
                <Link
                  to="/billing"
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 p-5 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-sm">Billing</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bills & payments
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Stats grid with stagger animation - clickable cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => navigate('/tickets?status=open')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Open</h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.open}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Inbox className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">Click to view open tickets</p>
            </button>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => navigate('/tickets?status=in_progress')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">In Progress</h3>
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.in_progress}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-600 dark:text-yellow-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">Click to view in-progress tickets</p>
            </button>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={() => navigate('/tickets?status=resolved')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Resolved</h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.resolved}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">Click to view resolved tickets</p>
            </button>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <button
              onClick={() => navigate('/tickets?status=closed')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Closed</h3>
                  <p className="text-4xl font-bold text-gray-600 dark:text-gray-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.closed}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 text-gray-600 dark:text-gray-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">Click to view closed tickets</p>
            </button>
          </div>
        </div>

        {isStaff ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => navigate('/tickets')}
              className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Live Operations</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Active Queue</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : activeQueue}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                Click to view all open + in-progress tickets
              </p>
            </button>

            <button
              onClick={() => navigate('/tickets?priority=urgent')}
              className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Urgent Alerts</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : urgentCount}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                Click to view high priority issues
              </p>
            </button>

            <button
              onClick={() => navigate('/staff-roster')}
              className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Staffing</p>
                  <h3 className="text-lg font-semibold text-foreground mt-2">On Duty</h3>
                  <p className="text-3xl font-bold text-foreground mt-2">12</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Click to view active agents and roster
              </p>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">My Requests</p>
                  <h3 className="text-lg font-semibold text-foreground mt-2">Total Tickets</h3>
                  <p className="text-3xl font-bold text-foreground mt-2">{myTickets.length}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Ticket className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Track your requests and status updates
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Next Step</p>
                  <h3 className="text-lg font-semibold text-foreground mt-2">Create Ticket</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Submit a new request for staff review
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
                  <h3 className="text-lg font-semibold text-foreground mt-2">In Progress</h3>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {myTickets.filter((ticket) => ticket.status === "in-progress").length}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Currently handled by hospital staff
              </p>
            </div>
          </div>
        )}

        {/* Recent tickets */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Recent Tickets
            </h2>
          </div>
          <Link
            to="/tickets"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No tickets yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create your first support ticket to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
