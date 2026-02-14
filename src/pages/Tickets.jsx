import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/hooks/useTickets";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const statusFilters = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const Tickets = () => {
  const { tickets, isLoading } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        `TK-${String(t.ticket_number).padStart(4, "0")}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (t.requester?.full_name ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (t.patient_mrn ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all hospital support tickets
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, ticket ID, requester, or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                  statusFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredTickets.length} ticket
          {filteredTickets.length !== 1 ? "s" : ""} found
        </p>

        {/* Tickets list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SlidersHorizontal className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No tickets found
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Tickets;