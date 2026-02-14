import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityIndicator } from "@/components/PriorityIndicator";
import { useTickets, useTicketDetail } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import {
  categoryLabels,
  statusConfig,
  departmentLabels,
  typeConfig,
} from "@/lib/ticketConfig";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  Send,
  UserCircle,
  Hospital,
  Building2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TicketDetail = () => {
  const { id } = useParams();
  const { updateTicketStatus, addMessage } = useTickets();
  const { isAdmin } = useAuth();

  const { data: ticket, isLoading } = useTicketDetail(id || "");
  const [reply, setReply] = useState("");

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-muted-foreground">
            Ticket not found
          </p>
          <Link
            to="/tickets"
            className="mt-4 text-sm text-primary hover:underline"
          >
            ← Back to tickets
          </Link>
        </div>
      </AppLayout>
    );
  }

  const ticketId = `TK-${String(ticket.ticket_number).padStart(4, "0")}`;
  const messages = ticket.ticket_messages ?? [];

  const handleSendReply = () => {
    if (!reply.trim()) return;

    addMessage.mutate(
      {
        ticketId: ticket.id,
        content: reply.trim(),
        isAgent: isAdmin,
      },
      {
        onSuccess: () => {
          setReply("");
          toast.success("Reply sent successfully");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleStatusChange = (newStatus) => {
    updateTicketStatus.mutate(
      { id: ticket.id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(`Status updated to ${statusConfig[newStatus].label}`),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Back button */}
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>

        {/* Ticket header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-mono text-muted-foreground">
                  {ticketId}
                </span>
                <StatusBadge status={ticket.status} />
                <PriorityIndicator priority={ticket.priority} />
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    typeConfig[ticket.type]?.color || ""
                  }`}
                >
                  {typeConfig[ticket.type]?.label || ticket.type}
                </span>
              </div>

              <h1 className="text-xl font-bold text-card-foreground">
                {ticket.title}
              </h1>

              <p className="text-sm text-muted-foreground mt-2">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requester</p>
                <p className="font-medium text-foreground">
                  {ticket.requester?.full_name ?? "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium text-foreground">
                  {departmentLabels[ticket.department] || ticket.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">
                  {format(new Date(ticket.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium text-foreground">
                  {categoryLabels[ticket.category] || ticket.category}
                </p>
              </div>
            </div>
          </div>

          {/* Patient info */}
          {(ticket.patient_mrn || ticket.patient_name) && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <FileText className="h-4 w-4 text-primary" />
              <div className="flex items-center gap-4 text-sm">
                {ticket.patient_name && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Patient:{" "}
                    </span>
                    <span className="font-medium text-foreground">
                      {ticket.patient_name}
                    </span>
                  </div>
                )}
                {ticket.patient_mrn && (
                  <div>
                    <span className="text-xs text-muted-foreground">MRN: </span>
                    <span className="font-medium text-primary">
                      {ticket.patient_mrn}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
            <span className="text-xs text-muted-foreground mr-2">
              Update status:
            </span>

            {["open", "in-progress", "resolved", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={ticket.status === status}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  ticket.status === status
                    ? "bg-primary text-primary-foreground cursor-default"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                {statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-card-foreground">
              Conversation ({messages.length})
            </h2>
          </div>

          <div className="divide-y divide-border">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      msg.is_agent
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {msg.is_agent ? (
                      <Hospital className="h-3.5 w-3.5" />
                    ) : (
                      <UserCircle className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {msg.sender?.full_name ?? "Unknown"}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(msg.created_at),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </span>

                      {msg.is_agent && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                          Staff
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                maxLength={2000}
              />
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSendReply}
                disabled={!reply.trim() || addMessage.isPending}
                className="inline-flex items-center gap-2 rounded-lg gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TicketDetail;