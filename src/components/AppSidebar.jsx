import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Settings,
  Hospital,
  LogOut,
  X,
  Users,
  BarChart3,
  User,
  Bed,
  Pill,
  Microscope,
  Calendar,
  Ambulance,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

export function AppSidebar({ isOpen = true, onClose = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { t } = useTranslation();

  // Load user profile from database
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setProfileLoading(true);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
        setProfileLoading(false);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Use profile role from database only (avoid stale metadata)
  const userRole = profile?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";
  const showPatientServices = !profileLoading && !isStaff;

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    {
      to: "/tickets",
      icon: Ticket,
      label: isStaff ? t("nav.allTickets") : t("nav.myTickets"),
    },
    { to: "/create", icon: PlusCircle, label: t("nav.newTicket") },
    ...(userRole === "admin"
      ? [
          { to: "/analytics", icon: BarChart3, label: t("nav.monitoring") },
          { to: "/staff-roster", icon: Users, label: t("nav.staffManagement") },
          { to: "/patient-profile", icon: User, label: t("nav.patients") },
          { to: "/appointments", icon: Calendar, label: t("nav.appointments") },
          { to: "/billing", icon: CreditCard, label: t("nav.billing") },
          { to: "/pharmacy", icon: Pill, label: t("nav.pharmacy") },
          { to: "/lab-tests", icon: Microscope, label: t("nav.labReports") },
          { to: "/emergency", icon: Ambulance, label: t("nav.ambulance") },
          { to: "/token-queue", icon: Ticket, label: t("nav.tokenQueue") },
          { to: "/medical", icon: Bed, label: t("nav.medicalInfo") },
        ]
      : isStaff
        ? [
            { to: "/analytics", icon: BarChart3, label: t("nav.analytics") },
            { to: "/staff-roster", icon: Users, label: t("nav.staffRoster") },
            { to: "/patient-profile", icon: User, label: t("nav.patientLookup") },
            { to: "/appointments", icon: Calendar, label: t("nav.appointments") },
            { to: "/lab-tests", icon: Microscope, label: t("nav.labReports") },
            { to: "/emergency", icon: Ambulance, label: t("nav.emergency") },
            { to: "/pharmacy", icon: Pill, label: t("nav.pharmacy") },
            { to: "/billing", icon: CreditCard, label: t("nav.billing") },
            { to: "/medical", icon: Bed, label: t("nav.medicalInfo") },
            { to: "/token-queue", icon: Ticket, label: t("nav.tokenQueue") },
          ]
        : []),
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  const roleLabel = {
    admin: t("role.admin"),
    staff: t("role.staff"),
    patient: t("role.patient"),
    citizen: t("role.citizen"),
    user: t("role.citizen"),
  }[userRole];

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Hospital className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">MedDesk</h1>
            <p className="text-xs text-muted-foreground">{t("sidebar.helpDesk")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Hospital Services - For patients */}
      {showPatientServices && (
        <div className="border-t border-border px-3 py-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-3">
            {t("sidebar.hospitalServices")}
          </p>
          <nav className="space-y-1">
            {[
              { to: "/patient-profile", icon: User, label: t("sidebar.myProfile") },
              { to: "/token-queue", icon: Ticket, label: t("sidebar.opdToken") },
              { to: "/medical", icon: Bed, label: t("nav.medicalInfo") },
              { to: "/pharmacy", icon: Pill, label: t("nav.pharmacy") },
              { to: "/lab-tests", icon: Microscope, label: t("nav.labReports") },
              { to: "/appointments", icon: Calendar, label: t("nav.appointments") },
              { to: "/emergency", icon: Ambulance, label: t("nav.emergency") },
              { to: "/billing", icon: CreditCard, label: t("nav.billing") },
            ].map((item) => {
              const isActive = location.pathname === item.to;
              const Icon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* User info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {roleLabel || "Citizen"}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}