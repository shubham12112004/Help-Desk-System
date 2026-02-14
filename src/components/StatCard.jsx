import { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function StatCard({ title, value, icon, accentClassName }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            accentClassName || "bg-accent text-accent-foreground"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
