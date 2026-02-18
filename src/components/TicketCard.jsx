import { useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { PriorityIndicator } from "./PriorityIndicator";
import { AssignmentDialog } from "./AssignmentDialog";
import { categoryLabels, departmentLabels, typeConfig } from "@/lib/ticketConfig";
import { Clock, User, Building2, UserPlus, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TicketCard({ ticket, onUpdate }) {
  const { user } = useAuth();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const userRole = user?.user_metadata?.role || 'citizen';
  const isStaff = ['admin', 'staff', 'doctor'].includes(userRole);
  
  const ticketId = ticket.ticket_number || `TK-${String(ticket.id).slice(0, 8)}`;
  const commentCount = ticket.comments?.[0]?.count || 0;

  const handleAssignClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAssignDialog(true);
  };

  return (
    <>
      <Link
        to={`/tickets/${ticket.id}`}
        className="group block rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:border-primary/30 hover:-translate-y-1 animate-slide-up backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                {ticketId}
              </span>

              <StatusBadge status={ticket.status} />

              {ticket.category && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-sm"
                  )}
                >
                  {categoryLabels[ticket.category] || ticket.category}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1 mb-2">
              {ticket.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <div className="flex-shrink-0">
            <PriorityIndicator priority={ticket.priority} showLabel={false} />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-4 border-t border-border/50">
          <span className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
            <User className="h-3.5 w-3.5" />
            <span className="font-medium">{ticket.creator?.full_name || ticket.requester?.full_name || "Unknown"}</span>
          </span>

          {ticket.department && (
            <span className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Building2 className="h-3.5 w-3.5" />
              {departmentLabels[ticket.department] || ticket.department}
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
          </span>

          {commentCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount}
            </span>
          )}

          {isStaff && !ticket.assigned_to && (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto h-8 text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
              onClick={handleAssignClick}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Assign
            </Button>
          )}

          {ticket.assignee && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
              <User className="h-3.5 w-3.5" />
              {ticket.assignee.full_name}
            </span>
          )}
        </div>
      </Link>

      {isStaff && (
        <AssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          ticket={ticket}
          onAssigned={onUpdate}
        />
      )}
    </>
  );
}