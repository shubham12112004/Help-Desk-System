import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/hooks/useTickets";
import { Search, SlidersHorizontal } from "lucide-react";
import { SpeechMicButton } from "@/components/SpeechMicButton";
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

  const appendTranscript = (currentValue, transcript) => {
    if (!transcript) return currentValue;
    return currentValue ? `${currentValue} ${transcript}` : transcript;
  };

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
        {/* Header with gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-3xl opacity-50" />
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tickets
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage and track all hospital support tickets
            </p>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search with gradient border */}
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by title, ticket ID, requester, or MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-card/80 backdrop-blur-sm pl-11 pr-14 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm hover:shadow-md"
              />
              <SpeechMicButton
                ariaLabel="Dictate search query"
                onTranscript={(transcript) =>
                  setSearch((current) => appendTranscript(current, transcript))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          {/* Enhanced Status filter tabs */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-1.5 shadow-sm">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-300",
                  statusFilter === filter.value
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket count with animation */}
        <p className="text-sm text-muted-foreground mb-6 font-medium">
          <span className="text-primary font-bold text-lg">{filteredTickets.length}</span> ticket
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