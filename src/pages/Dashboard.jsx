import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/hooks/useTickets";
import {
  Inbox,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { tickets, stats, isLoading } = useTickets();

  const recentTickets = tickets.slice(0, 5);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hospital help desk overview
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Open"
            value={stats.open}
            icon={<Inbox className="h-5 w-5" />}
            accentClassName="bg-status-open-bg text-status-open"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<Loader2 className="h-5 w-5" />}
            accentClassName="bg-status-in-progress-bg text-status-in-progress"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentClassName="bg-status-resolved-bg text-status-resolved"
          />
          <StatCard
            title="Closed"
            value={stats.closed}
            icon={<XCircle className="h-5 w-5" />}
            accentClassName="bg-status-closed-bg text-status-closed"
          />
        </div>

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
