import { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function StatCard({ title, value, icon, accentClassName }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold text-foreground group-hover:scale-110 transition-transform duration-300 origin-left">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500",
            accentClassName
          )}
        >
          {icon}
        </div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
    </div>
  );
}
