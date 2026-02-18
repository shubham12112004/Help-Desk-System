import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { TicketCard } from "@/components/TicketCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Filter,
  Download,
  FileText,
  Inbox,
} from "lucide-react";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const STATUSES = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const SORT_OPTIONS = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "Priority" },
];

const Tickets = () => {
  const { tickets, isLoading } = useTickets();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const userRole = user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";

  const statusParam = searchParams.get("status") || "all";
  const priorityParam = searchParams.get("priority") || "all";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "latest";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [localSearch, setLocalSearch] = useState(searchParam);
  const [localStatus, setLocalStatus] = useState(statusParam);
  const [localPriority, setLocalPriority] = useState(priorityParam);
  const [localSort, setLocalSort] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  const ITEMS_PER_PAGE = 10;

  const appendTranscript = (currentValue, transcript) => {
    if (!transcript) return currentValue;
    return currentValue ? `${currentValue} ${transcript}` : transcript;
  };

  const filteredTickets = useMemo(() => {
    let result = isStaff
      ? tickets
      : tickets.filter((t) => t.requester_id === user?.id);

    if (localStatus !== "all") {
      result = result.filter((t) => t.status === localStatus);
    }

    if (localPriority !== "all") {
      result = result.filter((t) => t.priority === localPriority);
    }

    if (localSearch) {
      const query = localSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.ticket_number?.toString().includes(query) ||
          (t.requester?.full_name ?? "").toLowerCase().includes(query) ||
          (t.patient_mrn ?? "").toLowerCase().includes(query)
      );
    }

    if (localSort === "latest") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (localSort === "oldest") {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (localSort === "priority") {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      result.sort(
        (a, b) =>
          (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
      );
    }

    return result;
  }, [tickets, localStatus, localPriority, localSearch, localSort, user?.id, isStaff]);

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set("page", "1");
    setSearchParams(params);
    setCurrentPage(1);

    switch (key) {
      case "status":
        setLocalStatus(value);
        break;
      case "priority":
        setLocalPriority(value);
        break;
      case "search":
        setLocalSearch(value);
        break;
      case "sort":
        setLocalSort(value);
        break;
      default:
        break;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    setSearchParams(params);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Title", "Status", "Priority", "Created", "Updated"];
    const data = filteredTickets.map((t) => [
      t.ticket_number,
      t.title,
      t.status,
      t.priority,
      new Date(t.created_at).toLocaleDateString(),
      new Date(t.updated_at).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(","),
      ...data.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent blur-3xl opacity-50" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Support Tickets
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Manage and track {isStaff ? "all" : "your"} hospital support requests
              </p>
            </div>
            {filteredTickets.length > 0 && (
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="gap-2 h-fit"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-6 p-4 bg-card border border-border/50 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Filters & Search</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search with speech input */}
            <div className="relative flex-1 group lg:col-span-2">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                <Input
                  placeholder="Search by title, ID, requester, or MRN..."
                  value={localSearch}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-9 pr-10 h-10"
                />
                <SpeechMicButton
                  ariaLabel="Dictate search query"
                  onTranscript={(transcript) =>
                    handleFilterChange("search", appendTranscript(localSearch, transcript))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>

            {/* Status filter */}
            <Select value={localStatus} onValueChange={(v) => handleFilterChange("status", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select value={localPriority} onValueChange={(v) => handleFilterChange("priority", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort filter */}
            <Select value={localSort} onValueChange={(v) => handleFilterChange("sort", v)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchParams({});
                setLocalSearch("");
                setLocalStatus("all");
                setLocalPriority("all");
                setLocalSort("latest");
                setCurrentPage(1);
              }}
              className="h-10 lg:col-span-1"
            >
              Reset
            </Button>
          </div>

          {/* Results count */}
          <p className="text-xs text-muted-foreground mt-3">
            Showing {paginatedTickets.length} of {filteredTickets.length} tickets
            {filteredTickets.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tickets list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : paginatedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-border bg-card p-8">
            {filteredTickets.length === 0 ? (
              <>
                <Inbox className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1 text-lg">No tickets found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchParam || statusParam !== "all" || priorityParam !== "all"
                    ? "Try adjusting your filters"
                    : isStaff
                    ? "No tickets have been created yet"
                    : "You haven't created any tickets yet"}
                </p>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1 text-lg">No results on this page</h3>
                <p className="text-sm text-muted-foreground">
                  Try navigating to a different page
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Tickets;