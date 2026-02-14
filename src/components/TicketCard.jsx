import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { PriorityIndicator } from "./PriorityIndicator";
import { categoryLabels, departmentLabels, typeConfig } from "@/lib/ticketConfig";
import { Clock, User, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function TicketCard({ ticket }) {
  const ticketId = `TK-${String(ticket.ticket_number).padStart(4, "0")}`;

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="group block rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono text-muted-foreground">
              {ticketId}
            </span>

            <StatusBadge status={ticket.status} />

            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                typeConfig[ticket.type].color
              }`}
            >
              {typeConfig[ticket.type].label}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
            {ticket.title}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
            {ticket.description}
          </p>
        </div>

        <PriorityIndicator priority={ticket.priority} showLabel={false} />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="inline-flex items-center gap-1">
          <User className="h-3 w-3" />
          {ticket.requester?.full_name ?? "Unknown"}
        </span>

        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {departmentLabels[ticket.department]}
        </span>

        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
        </span>

        {ticket.patient_mrn && (
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            MRN: {ticket.patient_mrn}
          </span>
        )}

        <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {categoryLabels[ticket.category]}
        </span>
      </div>
    </Link>
  );
}