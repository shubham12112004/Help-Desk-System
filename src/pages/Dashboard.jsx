import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { TicketCard } from "@/components/TicketCard";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Inbox,
  Loader2,
  CheckCircle2,
  XCircle,
  BarChart3,
  Activity,
  ShieldCheck,
  Users,
  User,
  UserCheck,
  Bed,
  Pill,
  Microscope,
  Calendar,
  Ambulance,
  CreditCard,
  Ticket,
  ArrowRight,
  Mic,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { tickets, stats, isLoading, refetch: refetchTickets } = useTickets();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);

  // Load user profile
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

  // Setup real-time subscriptions for new tickets
  useEffect(() => {
    if (!user) return;

    // Subscribe to new tickets
    const ticketChannel = supabase
      .channel('dashboard-tickets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tickets',
        },
        (payload) => {
          // Refresh tickets when new one is created
          refetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
    };
  }, [user, refetchTickets]);

  // Use profile role (from database), fallback to user_metadata role, then citizen
  const userRole = profile?.role ?? user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";
  const isAdmin = userRole === "admin";

  const recentTickets = tickets.slice(0, 5);
  const myTickets = tickets.filter((ticket) => ticket.requester_id === user?.id);
  const urgentCount = tickets.filter((ticket) => ticket.priority === "urgent").length;
  
  // Safe stats to prevent NaN
  const safeStats = {
    open: stats?.open ?? 0,
    in_progress: stats?.in_progress ?? 0,
    resolved: stats?.resolved ?? 0,
    closed: stats?.closed ?? 0,
  };
  const activeQueue = safeStats.open + safeStats.in_progress;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header with gradient - Themed by Role */}
        <div className="mb-8 relative animate-fade-in">
          <div className={`absolute inset-0 blur-3xl opacity-50 animate-pulse-slow ${
            isAdmin 
              ? 'bg-gradient-to-r from-yellow-300/20 via-amber-400/10 to-yellow-300/20'
              : isStaff
              ? 'bg-gradient-to-r from-blue-300/20 via-cyan-400/10 to-blue-300/20'
              : 'bg-gradient-to-r from-purple-300/20 via-violet-400/10 to-purple-300/20'
          }`} />
          <div className="relative">
            {isAdmin ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg glow-gold animate-pulse-slow">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-bold text-gradient-gold animate-slide-up">
                    {t("dashboard.executiveTitle")}
                  </h1>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 font-medium animate-slide-up ml-14" style={{animationDelay: '0.1s'}}>
                  {t("dashboard.executiveSubtitle")}
                </p>
              </>
            ) : isStaff ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg glow-blue animate-pulse-slow">
                    <Users className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-bold text-gradient-blue animate-slide-up">
                    {t("dashboard.staffTitle")}
                  </h1>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 font-medium animate-slide-up ml-14" style={{animationDelay: '0.1s'}}>
                  {t("dashboard.staffSubtitle")}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg glow-purple animate-pulse-slow">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-bold text-gradient-purple animate-slide-up">
                    {t("dashboard.patientTitle")}
                  </h1>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2 font-medium animate-slide-up ml-14" style={{animationDelay: '0.1s'}}>
                  {t("dashboard.patientSubtitle")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Patient Hospital Services - Only for patients */}
        {!isStaff && (
          <>
            {/* Hospital Services Navigation */}
            <div className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">{t("dashboard.hospitalServicesTitle")}</h2>
                <p className="text-muted-foreground mt-2">
                  {t("dashboard.hospitalServicesSubtitle")}
                </p>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Patient Profile */}
                <Link
                  to="/patient-profile"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <User className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.patientProfileTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.patientProfileDesc")}
                  </p>
                </Link>

                {/* Token Queue */}
                <Link
                  to="/token-queue"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.opdTokenTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.opdTokenDesc")}
                  </p>
                </Link>

                {/* Medical */}
                <Link
                  to="/medical"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Bed className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.medicalInfoTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.medicalInfoDesc")}
                  </p>
                </Link>

                {/* Pharmacy */}
                <Link
                  to="/pharmacy"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Pill className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.pharmacyTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.pharmacyDesc")}
                  </p>
                </Link>

                {/* Lab Tests */}
                <Link
                  to="/lab-tests"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Microscope className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.labReportsTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.labReportsDesc")}
                  </p>
                </Link>

                {/* Appointments */}
                <Link
                  to="/appointments"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-cyan-200 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.appointmentsTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.appointmentsDesc")}
                  </p>
                </Link>

                {/* Emergency */}
                <Link
                  to="/emergency"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Ambulance className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.emergencyTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.emergencyDesc")}
                  </p>
                </Link>

                {/* Billing */}
                <Link
                  to="/billing"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.billingTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.billingDesc")}
                  </p>
                </Link>

                {/* Voice Input Demo */}
                <Link
                  to="/voice-demo"
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-pink-200 dark:bg-pink-800 text-pink-700 dark:text-pink-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Mic className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.voiceInputTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.voiceInputDesc")}
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Stats grid with stagger animation - clickable cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
            <button
              onClick={() => navigate('/tickets?status=open')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("dashboard.statusLabel")}</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">{t("dashboard.statusOpen")}</h3>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.open}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Inbox className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">{t("dashboard.openTicketsHint")}</p>
            </button>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <button
              onClick={() => navigate('/tickets?status=in_progress')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("dashboard.statusLabel")}</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">{t("dashboard.statusInProgress")}</h3>
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.in_progress}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 text-yellow-600 dark:text-yellow-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">{t("dashboard.inProgressTicketsHint")}</p>
            </button>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={() => navigate('/tickets?status=resolved')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("dashboard.statusLabel")}</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">{t("dashboard.statusResolved")}</h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.resolved}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">{t("dashboard.resolvedTicketsHint")}</p>
            </button>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <button
              onClick={() => navigate('/tickets?status=closed')}
              className="w-full group rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-card/80 p-6 shadow-lg hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("dashboard.statusLabel")}</p>
                  <h3 className="text-lg font-bold text-foreground mt-2">{t("dashboard.statusClosed")}</h3>
                  <p className="text-4xl font-bold text-gray-600 dark:text-gray-400 mt-3 group-hover:scale-110 transition-transform origin-left">{isLoading ? '...' : safeStats.closed}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 text-gray-600 dark:text-gray-400 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">{t("dashboard.closedTicketsHint")}</p>
            </button>
          </div>
        </div>

        {isStaff ? (
          <>
            {/* Admin Dashboard - Premium Golden Theme Container */}
            {isAdmin ? (
              <div className="p-6 rounded-3xl gradient-gold-card mb-8 relative overflow-hidden">
                {/* Luxury Background Effects */}
                <div className="absolute inset-0 opacity-20 dark:opacity-30">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-300 via-amber-400 to-transparent rounded-full blur-3xl animate-float"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-300 via-yellow-400 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-200 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
                </div>

                <div className="relative">
                  {/* Premium Admin Cards Section */}
                  <div className="mb-10">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg glow-gold animate-pulse-slow">
                          <ShieldCheck className="h-7 w-7" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gradient-gold flex items-center gap-2 animate-slide-up">
                            {t("dashboard.adminControlsTitle")}
                          </h2>
                          <p className="text-amber-700 dark:text-amber-300 mt-1 font-medium animate-slide-up" style={{animationDelay: '0.1s'}}>
                            {t("dashboard.adminControlsSubtitle")}
                          </p>
                        </div>
                      </div>
                      <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full"></div>
                    </div>

                    {/* Admin Management Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  {/* Staff Management */}
                  <button
                    onClick={() => navigate("/staff-roster")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Users className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminStaffManagementTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminStaffManagementDesc")}
                    </p>
                  </button>

                  {/* Patient Management */}
                  <button
                    onClick={() => navigate("/patient-profile")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <User className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminPatientRecordsTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminPatientRecordsDesc")}
                    </p>
                  </button>

                  {/* Patient Monitoring */}
                  <button
                    onClick={() => navigate("/patient-monitoring")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Activity className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-rose-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-rose-900 dark:text-rose-100 mb-1">{t("dashboard.adminPatientMonitoringTitle")}</h3>
                    <p className="text-xs text-rose-700 dark:text-rose-300">
                      {t("dashboard.adminPatientMonitoringDesc")}
                    </p>
                  </button>

                  {/* Appointments */}
                  <button
                    onClick={() => navigate("/appointments")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminAppointmentsTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminAppointmentsDesc")}
                    </p>
                  </button>

                  {/* Billing Management */}
                  <button
                    onClick={() => navigate("/billing")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminBillingTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminBillingDesc")}
                    </p>
                  </button>

                  {/* Pharmacy */}
                  <button
                    onClick={() => navigate("/pharmacy")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Pill className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminPharmacyTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminPharmacyDesc")}
                    </p>
                  </button>

                  {/* Lab Reports */}
                  <button
                    onClick={() => navigate("/lab-tests")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Microscope className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminLabAnalyticsTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminLabAnalyticsDesc")}
                    </p>
                  </button>

                  {/* Ambulance Tracking */}
                  <button
                    onClick={() => navigate("/emergency")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <Ambulance className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminEmergencyFleetTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminEmergencyFleetDesc")}
                    </p>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => navigate("/settings")}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-3 hover:scale-105 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-12">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-2 transition-smooth" />
                    </div>
                    <h3 className="font-bold text-base text-amber-900 dark:text-amber-100 mb-1">{t("dashboard.adminSystemConfigTitle")}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t("dashboard.adminSystemConfigDesc")}
                    </p>
                  </button>
                    </div>
                  </div>

                  {/* Golden Stats Section - Admin */}
                  <div className="mt-8">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gradient-gold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-amber-600" />
                        {t("dashboard.adminLiveOpsTitle")}
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-medium">{t("dashboard.adminLiveOpsSubtitle")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <button
                        onClick={() => navigate('/tickets')}
                        className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">{t("dashboard.adminLiveOpsLabel")}</p>
                            <h3 className="text-base font-bold text-amber-900 dark:text-amber-100 mt-1">{t("dashboard.activeQueue")}</h3>
                            <p className="text-4xl font-bold text-gradient-gold mt-3">{isLoading ? '...' : activeQueue}</p>
                          </div>
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <Activity className="h-7 w-7" />
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate('/tickets?priority=urgent')}
                        className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">{t("dashboard.adminCriticalAlertsLabel")}</p>
                            <h3 className="text-base font-bold text-amber-900 dark:text-amber-100 mt-1">{t("dashboard.adminUrgentCases")}</h3>
                            <p className="text-4xl font-bold text-gradient-gold mt-3">{isLoading ? '...' : urgentCount}</p>
                          </div>
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <ShieldCheck className="h-7 w-7" />
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => navigate('/tickets?status=resolved')}
                        className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-gold glow-gold-hover gold-shine overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">{t("dashboard.adminPerformanceLabel")}</p>
                            <h3 className="text-base font-bold text-amber-900 dark:text-amber-100 mt-1">{t("dashboard.statusResolved")}</h3>
                            <p className="text-4xl font-bold text-gradient-gold mt-3">{isLoading ? '...' : safeStats.resolved}</p>
                          </div>
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <CheckCircle2 className="h-7 w-7" />
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Staff Control Panel (Non-Admin Staff) - Premium Blue Theme */
              <div className="p-6 rounded-3xl gradient-blue-card mb-8 relative overflow-hidden">
                {/* Blue Background Effects */}
                <div className="absolute inset-0 opacity-20 dark:opacity-30">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-300 via-cyan-400 to-transparent rounded-full blur-3xl animate-float"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-300 via-blue-400 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
                </div>

                <div className="relative">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg glow-blue animate-pulse-slow">
                        <Users className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gradient-blue flex items-center gap-2 animate-slide-up">
                          {t("dashboard.staffOpsTitle")}
                        </h2>
                        <p className="text-blue-700 dark:text-blue-300 mt-1 font-medium animate-slide-up" style={{animationDelay: '0.1s'}}>
                          {t("dashboard.staffOpsSubtitle")}
                        </p>
                      </div>
                    </div>
                    <div className="h-1 w-32 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 rounded-full"></div>
                  </div>

                  {/* Staff Action Grid - 12 Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-in">
                {/* My Tickets */}
                <button
                  onClick={() => navigate('/tickets?assigned=me')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffMyAssignedTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffMyAssignedDesc")}
                  </p>
                </button>

                {/* All Tickets */}
                <button
                  onClick={() => navigate('/tickets')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffAllTicketsTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffAllTicketsDesc")}
                  </p>
                </button>

                {/* Priority Queue */}
                <button
                  onClick={() => navigate('/tickets?priority=urgent')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffUrgentQueueTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffUrgentQueueDesc")}
                  </p>
                </button>

                {/* Patient Lookup */}
                <button
                  onClick={() => navigate('/patient-profile')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <User className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffPatientLookupTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffPatientLookupDesc")}
                  </p>
                </button>

                {/* Analytics */}
                <button
                  onClick={() => navigate('/analytics')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-cyan-200 dark:bg-cyan-800 text-cyan-700 dark:text-cyan-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffAnalyticsTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffAnalyticsDesc")}
                  </p>
                </button>

                {/* Staff Roster */}
                <button
                  onClick={() => navigate('/staff-roster')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Users className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffRosterTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffRosterDesc")}
                  </p>
                </button>

                {/* Appointments */}
                <button
                  onClick={() => navigate('/appointments')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffAppointmentsTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffAppointmentsDesc")}
                  </p>
                </button>

                {/* Lab Reports */}
                <button
                  onClick={() => navigate('/lab-tests')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Microscope className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffLabReportsTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffLabReportsDesc")}
                  </p>
                </button>

                {/* Emergency */}
                <button
                  onClick={() => navigate('/emergency')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Ambulance className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffEmergencyTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffEmergencyDesc")}
                  </p>
                </button>

                {/* Pharmacy */}
                <button
                  onClick={() => navigate('/pharmacy')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-teal-200 dark:bg-teal-800 text-teal-700 dark:text-teal-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Pill className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffPharmacyTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffPharmacyDesc")}
                  </p>
                </button>

                {/* Billing */}
                <button
                  onClick={() => navigate('/billing')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffBillingTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffBillingDesc")}
                  </p>
                </button>

                {/* Medical Info */}
                <button
                  onClick={() => navigate('/medical')}
                  className="group rounded-xl border border-border/50 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50 p-5 hover:shadow-2xl transition-smooth hover:-translate-y-2 hover:scale-[1.02] cursor-pointer text-left w-full card-elevated gradient-shine overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-pink-200 dark:bg-pink-800 text-pink-700 dark:text-pink-200 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Bed className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-smooth" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.staffMedicalInfoTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.staffMedicalInfoDesc")}
                  </p>
                </button>
              </div>

              {/* Blue Stats Section - Staff */}
              <div className="mt-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gradient-blue flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    {t("dashboard.staffPerformanceTitle")}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium">{t("dashboard.staffPerformanceSubtitle")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <button
                    onClick={() => navigate('/tickets')}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-blue glow-blue-hover blue-shine overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{t("dashboard.staffLiveQueueLabel")}</p>
                        <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 mt-1">{t("dashboard.activeQueue")}</h3>
                        <p className="text-4xl font-bold text-gradient-blue mt-3">{isLoading ? '...' : activeQueue}</p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Activity className="h-7 w-7" />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/tickets?priority=urgent')}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-blue glow-blue-hover blue-shine overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{t("dashboard.staffPriorityCasesLabel")}</p>
                        <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 mt-1">{t("dashboard.staffUrgentAlerts")}</h3>
                        <p className="text-4xl font-bold text-gradient-blue mt-3">{isLoading ? '...' : urgentCount}</p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <ShieldCheck className="h-7 w-7" />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/tickets?status=resolved')}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-blue glow-blue-hover blue-shine overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{t("dashboard.staffCompletedLabel")}</p>
                        <h3 className="text-base font-bold text-blue-900 dark:text-blue-100 mt-1">{t("dashboard.statusResolved")}</h3>
                        <p className="text-4xl font-bold text-gradient-blue mt-3">{isLoading ? '...' : safeStats.resolved}</p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
            )}
          </>
        ) : (
          /* Patient Dashboard - Premium Purple Theme */
          <div className="p-6 rounded-3xl gradient-purple-card mb-8 relative overflow-hidden">
            {/* Purple Background Effects */}
            <div className="absolute inset-0 opacity-20 dark:opacity-30">
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300 via-violet-400 to-transparent rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-violet-300 via-purple-400 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-200 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
            </div>

            <div className="relative space-y-6">
              {/* Patient Dashboard */}
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg glow-purple animate-pulse-slow">
                      <Activity className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gradient-purple flex items-center gap-2 animate-slide-up">
                        {t("dashboard.patientDashboardTitle")}
                      </h2>
                      <p className="text-purple-700 dark:text-purple-300 mt-1 font-medium animate-slide-up" style={{animationDelay: '0.1s'}}>
                        {t("dashboard.patientDashboardSubtitle")}
                      </p>
                    </div>
                  </div>
                  <div className="h-1 w-32 bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                  <button
                    onClick={() => navigate('/tickets')}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-purple glow-purple-hover purple-shine overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">{t("dashboard.patientRequestsLabel")}</p>
                        <h3 className="text-base font-bold text-purple-900 dark:text-purple-100 mt-1">{t("dashboard.totalTickets")}</h3>
                        <p className="text-4xl font-bold text-gradient-purple mt-3">{myTickets.length}</p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Ticket className="h-7 w-7" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-3">
                      {t("dashboard.patientRequestsDesc")}
                    </p>
                  </button>

                  <button
                    onClick={() => navigate('/create')}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-purple glow-purple-hover purple-shine overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">{t("dashboard.nextStepLabel")}</p>
                        <h3 className="text-base font-bold text-purple-900 dark:text-purple-100 mt-1">{t("dashboard.createTicketTitle")}</h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                          {t("dashboard.createTicketDesc")}
                        </p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Users className="h-7 w-7" />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/tickets?status=in-progress')}
                    className="group relative rounded-2xl bg-white dark:bg-gray-900 p-6 hover:shadow-2xl transition-smooth hover:-translate-y-2 cursor-pointer text-left w-full border-purple glow-purple-hover purple-shine overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">{t("dashboard.statusLabel")}</p>
                        <h3 className="text-base font-bold text-purple-900 dark:text-purple-100 mt-1">{t("dashboard.statusInProgress")}</h3>
                        <p className="text-4xl font-bold text-gradient-purple mt-3">
                          {myTickets.filter((ticket) => ticket.status === "in-progress").length}
                        </p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Activity className="h-7 w-7" />
                      </div>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-3">
                      {t("dashboard.inProgressDesc")}
                    </p>
                  </button>
                </div>
              </div>

              {/* Recent Tickets Section */}
              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-md">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <h3 className="text-xl font-bold text-gradient-purple">
                      {t("dashboard.recentRequestsTitle")}
                    </h3>
                  </div>
                  <Link
                    to="/tickets"
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    {t("dashboard.viewAllRequests")}
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                  </div>
                ) : recentTickets.length === 0 ? (
                  <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-12 text-center">
                    <Inbox className="h-10 w-10 text-purple-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      {t("dashboard.noTickets")}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      {t("dashboard.noTicketsDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
