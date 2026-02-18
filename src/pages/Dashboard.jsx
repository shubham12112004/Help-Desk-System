import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import {
  Inbox,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
  Activity,
  ShieldCheck,
  Users,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { tickets, stats, isLoading } = useTickets();
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";

  const recentTickets = tickets.slice(0, 5);
  const myTickets = tickets.filter((ticket) => ticket.requester_id === user?.id);
  const urgentCount = tickets.filter((ticket) => ticket.priority === "urgent").length;
  const activeQueue = stats.open + stats.inProgress;

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

        {/* Stats grid with stagger animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <StatCard
              title="Open"
              value={stats.open}
              icon={<Inbox className="h-6 w-6" />}
              accentClassName="bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <StatCard
              title="In Progress"
              value={stats.in_progress}
              icon={<Loader2 className="h-6 w-6 animate-spin" />}
              accentClassName="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-600 dark:text-yellow-400"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <StatCard
              title="Resolved"
              value={stats.resolved}
              icon={<CheckCircle2 className="h-6 w-6" />}
              accentClassName="bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <StatCard
              title="Closed"
              value={stats.closed}
              icon={<XCircle className="h-6 w-6" />}
              accentClassName="bg-gradient-to-br from-gray-500/20 to-gray-600/20 text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>

        {isStaff ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Live Operations</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Active Queue</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-3 group-hover:scale-110 transition-transform origin-left">{activeQueue}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                Open + in-progress tickets across departments
              </p>
            </div>

            <div className="group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">Urgent Alerts</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mt-3 group-hover:scale-110 transition-transform origin-left">{urgentCount}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                High priority issues needing review
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Staffing</p>
                  <h3 className="text-lg font-semibold text-foreground mt-2">On Duty</h3>
                  <p className="text-3xl font-bold text-foreground mt-2">12</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Active agents for triage and routing
              </p>
            </div>
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
                  <Stethoscope className="h-5 w-5" />
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
