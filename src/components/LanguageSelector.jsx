import { useState, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
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

export function LanguageSelector() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const languages = {
    en: { label: "English", flag: "🇬🇧" },
    hi: { label: "हिंदी (Hindi)", flag: "🇮🇳" },
    te: { label: "తెలుగు (Telugu)", flag: "🇮🇳" },
    pa: { label: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
  };

  useEffect(() => {
    localStorage.setItem("language", language);
    // Dispatch event so other components can react to language change
    window.dispatchEvent(
      new CustomEvent("languageChange", { detail: { language } })
    );
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-3"
          title="Change Language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">
            {languages[language].flag}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="font-semibold">Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {Object.entries(languages).map(([code, lang]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => setLanguage(code)}
              className="flex gap-2 cursor-pointer"
              data-state={language === code ? "checked" : ""}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {language === code && (
                <span className="text-sm font-bold text-primary">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-2 py-2 text-xs text-muted-foreground">
          Current: {languages[language].label}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
