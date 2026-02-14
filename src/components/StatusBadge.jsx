import { TicketStatus } from "@/types/ticket";
import { statusConfig } from "@/lib/ticketConfig";
import { cn } from "@/lib/utils";
export function StatusBadge({ status, className }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
