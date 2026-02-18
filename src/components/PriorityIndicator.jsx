import { cn } from "@/lib/utils";

const priorityConfig = {
  low: {
    label: "Low",
    className: "bg-gradient-to-br from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400 border-green-500/30 shadow-sm shadow-green-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 shadow-sm shadow-yellow-500/20",
  },
  high: {
    label: "High",
    className: "bg-gradient-to-br from-orange-500/20 to-orange-600/10 text-orange-600 dark:text-orange-400 border-orange-500/30 shadow-sm shadow-orange-500/20",
  },
  urgent: {
    label: "Urgent",
    className: "bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-600 dark:text-red-400 border-red-500/30 shadow-sm shadow-red-500/20 animate-pulse-slow",
  },
};

export function PriorityIndicator({ priority }) {
  const config = priorityConfig[priority] || priorityConfig["medium"];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}