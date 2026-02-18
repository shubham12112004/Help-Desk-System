import { TicketStatus } from "@/types/ticket";
import { statusConfig } from "@/lib/ticketConfig";
import { cn } from "@/lib/utils";
export function StatusBadge({ status, className }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
