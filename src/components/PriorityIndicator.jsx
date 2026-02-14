import { cn } from "@/lib/utils";

const priorityConfig = {
  low: {
    label: "Low",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border border-orange-200",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
};

export function PriorityIndicator({ priority }) {
  const config = priorityConfig[priority] || priorityConfig["medium"];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}