import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  MoreVertical,
  LogOut,
  Settings,
  Plus,
  LifeBuoy,
  MessageSquare,
  Zap,
  ChevronDown,
  Hospital,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ColorThemeSelector } from "@/components/ColorThemeSelector";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProfessionalHeader = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [profile, setProfile] = useState(null);
  const { t } = useTranslation();

  // Load user profile from database
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
    };

    loadProfile();
  }, [user]);

  // Role colors and labels
  const roleConfig = {
    admin: { color: "destructive", label: "Administrator" },
    staff: { color: "default", label: "Support Staff" },
    doctor: { color: "secondary", label: "Doctor" },
    nurse: { color: "outline", label: "Nurse" },
    citizen: { color: "secondary", label: "Patient" },
  };

  // Use profile role from database only (avoid stale metadata)
  const userRole = profile?.role ?? "citizen";
  const roleInfo = roleConfig[userRole] || roleConfig.citizen;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDialog(false);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const quickActions = [
    {
      label: t("header.createTicket"),
      icon: Plus,
      action: () => navigate("/create"),
      color: "text-emerald-500",
    },
    {
      label: t("header.viewTickets"),
      icon: LifeBuoy,
      action: () => navigate("/tickets"),
      color: "text-blue-500",
    },
    {
      label: t("header.chatSupport"),
      icon: MessageSquare,
      action: () => setShowSearchDialog(true),
      color: "text-purple-500",
    },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "shadow-sm"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md">
              <Hospital className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-foreground">MedDesk</h1>
              <p className="text-xs text-muted-foreground">Hospital Portal</p>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("header.search")}
                className="w-full bg-muted/50 pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            {/* Mobile search button */}
            <button
              onClick={() => setShowSearchDialog(true)}
              className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Actions & Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Actions Dropdown - Desktop only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden sm:flex"
                  title="Quick Actions"
                >
                  <Zap className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-semibold">
                  {t("header.quickActions")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={action.label}
                        onClick={action.action}
                        className="flex gap-2 cursor-pointer"
                      >
                        <Icon className={cn("h-4 w-4", action.color)} />
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* Language Selector */}
            <LanguageSelector />

            {/* Color Theme Selector */}
            <ColorThemeSelector />

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Profile Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  title="Profile Menu"
                >
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {roleInfo.label}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                    {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <span className="font-semibold text-foreground">
                    {user?.user_metadata?.full_name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground py-1">
                    Role
                  </DropdownMenuLabel>
                  <div className="px-2 py-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{roleInfo.label}</span>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Theme Toggle */}
            <div className="sm:hidden">
              <ThemeToggle />
            </div>

            {/* More Menu - Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden"
                  title="More Options"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Customization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Language Selector - Mobile */}
                <div className="px-2 py-2">
                  <LanguageSelector />
                </div>
                <DropdownMenuSeparator />
                
                {/* Color Theme Selector - Mobile */}
                <div className="px-2 py-2">
                  <ColorThemeSelector />
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{t("header.quickActions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={action.action}
                      className="cursor-pointer"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Search Dialog for Mobile */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("header.searchTitle")}</DialogTitle>
            <DialogDescription>
              {t("header.searchDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("header.search")}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              {t("common.search")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfessionalHeader;
