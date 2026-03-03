/**
 * Admin Dashboard with Analytics
 * Comprehensive dashboard for staff/admin with realtime metrics
 */

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToNewTickets } from '@/services/realtime';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import * as ticketsService from '@/services/tickets';
import {
  Activity,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  Zap,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [ambulanceRequests, setAmbulanceRequests] = useState([]);

  const userRole = user?.user_metadata?.role || 'citizen';
  const canViewAdmin = ['staff', 'doctor', 'admin'].includes(userRole);

  useEffect(() => {
    if (canViewAdmin) {
      loadDashboardData();
      loadAmbulanceRequests();
      
      // Subscribe to new tickets
      const ticketSubscription = subscribeToNewTickets((newTicket) => {
        toast.success(`New ticket: ${newTicket.title}`, {
          description: `Priority: ${newTicket.priority}`,
          duration: 5000,
        });
        loadDashboardData(); // Refresh stats
      });

      // Refresh data every 30 seconds
      const interval = setInterval(loadDashboardData, 30000);

      return () => {
        ticketSubscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [canViewAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load overall statistics using tickets service
      const statsData = await ticketsService.getTicketStats();
      setStats(statsData);

      // Load recent tickets
      const ticketsData = await ticketsService.getTickets({ status: 'all' });
      
      // Process category breakdown from tickets data
      if (ticketsData && ticketsData.length > 0) {
        const categoryCounts = ticketsData.reduce((acc, ticket) => {
          const cat = ticket.category || 'other';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
          name: name.replace(/_/g, ' '),
          value,
        }));

        setCategoryStats(chartData);
        
        // Get recent 10 tickets
        setRecentTickets(ticketsData.slice(0, 10));
      }

      // Performance data would come from a separate endpoint
      // For now, we'll skip it or use ticket data to compute basic performance metrics
      if (userRole === 'admin') {
        // TODO: Add backend endpoint for user performance stats
        // For now, we can compute this from tickets data
        setPerformanceData([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t('admin.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const loadAmbulanceRequests = async () => {
    try {
      // TODO: Add ambulance requests service when backend endpoint is created
      // For now, set empty list
      setAmbulanceRequests([]);
    } catch (error) {
      console.error('Error loading ambulance requests:', error);
    }
  };

  if (!canViewAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('admin.accessDenied')}</p>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const resolutionRate = stats?.total_tickets > 0
    ? Math.round(((stats.resolved_tickets + stats.closed_tickets) / stats.total_tickets) * 100)
    : 0;

  const slaCompliance = stats?.total_tickets > 0
    ? Math.round(((stats.total_tickets - stats.overdue_tickets) / stats.total_tickets) * 100)
    : 100;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('admin.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('admin.subtitle')}
            </p>
          </div>
          <Badge variant="outline" className="h-6">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            {t('admin.live')}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('admin.totalTickets')}
            value={stats?.total_tickets || 0}
            icon={<BarChart3 className="h-5 w-5" />}
            trend={t('admin.totalTicketsTrend')}
            accentClassName="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            title={t('admin.activeQueue')}
            value={stats?.active_tickets || 0}
            icon={<Activity className="h-5 w-5" />}
            trend={t('admin.activeQueueTrend')}
            accentClassName="bg-orange-500/10 text-orange-500"
          />
          <StatCard
            title={t('admin.resolutionRate')}
            value={`${resolutionRate}%`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend={t('admin.resolutionRateTrend')}
            accentClassName="bg-green-500/10 text-green-500"
          />
          <StatCard
            title={t('admin.criticalAlerts')}
            value={stats?.critical_tickets || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend={t('admin.criticalAlertsTrend')}
            accentClassName="bg-red-500/10 text-red-500"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('admin.responseTime')}
              </CardTitle>
              <CardDescription>
                {t('admin.avgResolutionLabel')}: {stats?.avg_resolution_hours?.toFixed(1) || '0'} {t('common.hours')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{t('admin.slaCompliance')}</span>
                    <span className="text-sm font-bold text-primary">{slaCompliance}%</span>
                  </div>
                  <Progress value={slaCompliance} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-foreground">{stats?.open_tickets || 0}</div>
                    <div className="text-xs text-muted-foreground">{t('admin.open')}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-orange-500">{stats?.overdue_tickets || 0}</div>
                    <div className="text-xs text-muted-foreground">{t('admin.overdue')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                {t('admin.ticketDistribution')}
              </CardTitle>
              <CardDescription>{t('admin.categoryBreakdown')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance (Admin only) */}
        {userRole === 'admin' && performanceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('admin.teamPerformance')}
              </CardTitle>
              <CardDescription>{t('admin.topStaff')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="full_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved_tickets" fill="#3b82f6" name={t('admin.resolved')} />
                  <Bar dataKey="overdue_tickets" fill="#ef4444" name={t('admin.overdue')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Emergency Ambulance Requests */}
        {ambulanceRequests.length > 0 && (
          <Card className="border-red-200 dark:border-red-900/50">
            <CardHeader className="bg-red-50 dark:bg-red-950/20">
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Zap className="h-5 w-5" />
                🚑 Emergency Ambulance Requests ({ambulanceRequests.length})
              </CardTitle>
              <CardDescription>Active emergency requests</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {ambulanceRequests.slice(0, 10).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100/50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">
                          {request.emergency_type}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>📍 {request.pickup_location}</span>
                        <span>•</span>
                        <span>📞 {request.contact_number}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}\n\n        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.recentTickets')}</CardTitle>
            <CardDescription>{t('admin.latestSubmissions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {ticket.title}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{ticket.creator?.full_name}</span>
                      <span>•</span>
                      <span>{ticket.category?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
