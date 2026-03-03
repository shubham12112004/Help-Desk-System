import { useState, useEffect } from "react";
import { Palette, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ColorThemeSelector() {
  const [colorTheme, setColorTheme] = useState(() => {
    return localStorage.getItem("colorTheme") || "blue";
  });

  const colorThemes = {
    blue: {
      label: "Blue (Default)",
      color: "bg-blue-500",
      hex: "#3b82f6",
      hsl: "234 85% 58%",
      background: "220 50% 12%",
      secondary: "220 40% 18%",
      muted: "220 35% 22%",
      sidebarBackground: "220 45% 15%",
      foreground: "220 20% 95%",
      accent: "234 85% 96%",
      accentForeground: "234 85% 58%",
      ring: "234 85% 58%",
      sidebarPrimary: "234 85% 58%",
      sidebarAccent: "234 85% 96%",
      sidebarRing: "234 85% 58%",
      gradientSecondary: "260 80% 62%",
      description: "Professional blue theme",
    },
    purple: {
      label: "Purple",
      color: "bg-purple-500",
      hex: "#a855f7",
      hsl: "270 90% 63%",
      background: "270 50% 12%",
      secondary: "270 40% 18%",
      muted: "270 35% 22%",
      sidebarBackground: "270 45% 15%",
      foreground: "270 20% 95%",
      accent: "270 90% 95%",
      accentForeground: "270 90% 63%",
      ring: "270 90% 63%",
      sidebarPrimary: "270 90% 63%",
      sidebarAccent: "270 90% 95%",
      sidebarRing: "270 90% 63%",
      gradientSecondary: "290 85% 60%",
      description: "Vibrant purple theme",
    },
    rose: {
      label: "Rose",
      color: "bg-rose-500",
      hex: "#f43f5e",
      hsl: "350 90% 60%",
      background: "350 45% 12%",
      secondary: "350 35% 18%",
      muted: "350 30% 22%",
      sidebarBackground: "350 40% 15%",
      foreground: "350 20% 95%",
      accent: "350 90% 95%",
      accentForeground: "350 90% 60%",
      ring: "350 90% 60%",
      sidebarPrimary: "350 90% 60%",
      sidebarAccent: "350 90% 95%",
      sidebarRing: "350 90% 60%",
      gradientSecondary: "330 85% 60%",
      description: "Warm rose theme",
    },
    emerald: {
      label: "Emerald",
      color: "bg-emerald-500",
      hex: "#10b981",
      hsl: "152 60% 42%",
      background: "152 45% 12%",
      secondary: "152 35% 18%",
      muted: "152 30% 22%",
      sidebarBackground: "152 40% 15%",
      foreground: "152 20% 95%",
      accent: "152 60% 95%",
      accentForeground: "152 60% 42%",
      ring: "152 60% 42%",
      sidebarPrimary: "152 60% 42%",
      sidebarAccent: "152 60% 95%",
      sidebarRing: "152 60% 42%",
      gradientSecondary: "170 60% 45%",
      description: "Green emerald theme",
    },
    amber: {
      label: "Amber",
      color: "bg-amber-500",
      hex: "#f59e0b",
      hsl: "38 92% 50%",
      background: "38 45% 12%",
      secondary: "38 35% 18%",
      muted: "38 30% 22%",
      sidebarBackground: "38 40% 15%",
      foreground: "38 20% 95%",
      accent: "38 92% 95%",
      accentForeground: "38 92% 50%",
      ring: "38 92% 50%",
      sidebarPrimary: "38 92% 50%",
      sidebarAccent: "38 92% 95%",
      sidebarRing: "38 92% 50%",
      gradientSecondary: "24 90% 52%",
      description: "Warm amber theme",
    },
    slate: {
      label: "Slate",
      color: "bg-slate-600",
      hex: "#475569",
      hsl: "214 18% 33%",
      background: "214 35% 12%",
      secondary: "214 30% 18%",
      muted: "214 25% 22%",
      sidebarBackground: "214 32% 15%",
      foreground: "214 20% 95%",
      accent: "214 18% 92%",
      accentForeground: "214 18% 33%",
      ring: "214 18% 33%",
      sidebarPrimary: "214 18% 33%",
      sidebarAccent: "214 18% 92%",
      sidebarRing: "214 18% 33%",
      gradientSecondary: "220 12% 38%",
      description: "Cool slate theme",
    },
    cyan: {
      label: "Cyan",
      color: "bg-cyan-500",
      hex: "#06b6d4",
      hsl: "188 86% 47%",
      background: "188 50% 12%",
      secondary: "188 40% 18%",
      muted: "188 35% 22%",
      sidebarBackground: "188 45% 15%",
      foreground: "188 20% 95%",
      accent: "188 86% 95%",
      accentForeground: "188 86% 47%",
      ring: "188 86% 47%",
      sidebarPrimary: "188 86% 47%",
      sidebarAccent: "188 86% 95%",
      sidebarRing: "188 86% 47%",
      gradientSecondary: "200 80% 50%",
      description: "Modern cyan theme",
    },
    indigo: {
      label: "Indigo",
      color: "bg-indigo-500",
      hex: "#6366f1",
      hsl: "239 84% 67%",
      background: "239 50% 12%",
      secondary: "239 40% 18%",
      muted: "239 35% 22%",
      sidebarBackground: "239 45% 15%",
      foreground: "239 20% 95%",
      accent: "239 84% 95%",
      accentForeground: "239 84% 67%",
      ring: "239 84% 67%",
      sidebarPrimary: "239 84% 67%",
      sidebarAccent: "239 84% 95%",
      sidebarRing: "239 84% 67%",
      gradientSecondary: "256 78% 68%",
      description: "Deep indigo theme",
    },
  };

  useEffect(() => {
    localStorage.setItem("colorTheme", colorTheme);
    // Apply color theme - update CSS variables
    const root = document.documentElement;
    const theme = colorThemes[colorTheme];
    const hslColor = theme.hsl;
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--foreground", theme.foreground);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--sidebar-background", theme.sidebarBackground);
    root.style.setProperty("--primary", hslColor);
    root.style.setProperty("--ring", theme.ring);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-foreground", theme.accentForeground);
    root.style.setProperty("--sidebar-primary", theme.sidebarPrimary);
    root.style.setProperty("--sidebar-accent", theme.sidebarAccent);
    root.style.setProperty("--sidebar-ring", theme.sidebarRing);
    root.style.setProperty(
      "--shadow-card-hover",
      `0 4px 16px -2px hsl(${hslColor} / 0.12)`
    );
    root.style.setProperty(
      "--gradient-primary",
      `linear-gradient(135deg, hsl(${hslColor}), hsl(${theme.gradientSecondary}))`
    );
    root.style.setProperty(
      "--gradient-surface",
      `linear-gradient(180deg, hsl(${theme.background}), hsl(${theme.secondary}))`
    );
    
    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("themeColorChange", {
        detail: { colorTheme, hsl: hslColor, hex: theme.hex },
      })
    );
  }, [colorTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Change Color Theme"
          className="relative"
        >
          <Palette className="h-5 w-5 text-foreground" />
          <div
            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
              colorThemes[colorTheme].color
            }`}
            style={{ backgroundColor: colorThemes[colorTheme].hex }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-semibold">Color Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-64 overflow-y-auto">
          {Object.entries(colorThemes).map(([code, theme]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setColorTheme(code)}
              className="flex gap-3 cursor-pointer py-2"
            >
              <div
                className={`h-4 w-4 rounded-full border-2 border-border flex-shrink-0 ${theme.color}`}
                style={{ backgroundColor: theme.hex }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">
                  {theme.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {theme.description}
                </div>
              </div>
              {colorTheme === code && (
                <span className="text-sm font-bold text-primary ml-2">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          Current: {colorThemes[colorTheme].label}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
