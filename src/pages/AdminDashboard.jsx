/**
 * Admin Dashboard with Analytics
 * Comprehensive dashboard for staff/admin with realtime metrics
 */

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { subscribeToNewTickets } from '@/services/realtime';
import { toast } from 'sonner';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  const userRole = user?.user_metadata?.role || 'citizen';
  const canViewAdmin = ['staff', 'doctor', 'admin'].includes(userRole);

  useEffect(() => {
    if (canViewAdmin) {
      loadDashboardData();
      
      // Subscribe to new tickets
      const subscription = subscribeToNewTickets((newTicket) => {
        toast.success(`New ticket: ${newTicket.title}`, {
          description: `Priority: ${newTicket.priority}`,
          duration: 5000,
        });
        loadDashboardData(); // Refresh stats
      });

      // Refresh data every 30 seconds
      const interval = setInterval(loadDashboardData, 30000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, [canViewAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load overall statistics
      const { data: statsData, error: statsError } = await supabase
        .from('ticket_statistics')
        .select('*')
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Load category breakdown
      const { data: categoryData, error: categoryError } = await supabase
        .from('tickets')
        .select('category, priority, status');

      if (!categoryError) {
        const categoryCounts = categoryData.reduce((acc, ticket) => {
          const cat = ticket.category || 'other';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
          name: name.replace(/_/g, ' '),
          value,
        }));

        setCategoryStats(chartData);
      }

      // Load user performance data (for admins only)
      if (userRole === 'admin') {
        const { data: perfData, error: perfError } = await supabase
          .from('user_performance')
          .select('*')
          .order('resolved_tickets', { ascending: false })
          .limit(5);

        if (!perfError) {
          setPerformanceData(perfData);
        }
      }

      // Load recent tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          creator:created_by (full_name, role),
          assignee:assigned_to (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!ticketsError) {
        setRecentTickets(ticketsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!canViewAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
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
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time analytics and system overview
            </p>
          </div>
          <Badge variant="outline" className="h-6">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tickets"
            value={stats?.total_tickets || 0}
            icon={<BarChart3 className="h-5 w-5" />}
            trend="+12% from last week"
            accentClassName="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            title="Active Queue"
            value={stats?.active_tickets || 0}
            icon={<Activity className="h-5 w-5" />}
            trend="Currently in progress"
            accentClassName="bg-orange-500/10 text-orange-500"
          />
          <StatCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend="Last 30 days"
            accentClassName="bg-green-500/10 text-green-500"
          />
          <StatCard
            title="Critical Alerts"
            value={stats?.critical_tickets || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="Needs immediate attention"
            accentClassName="bg-red-500/10 text-red-500"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Response Time
              </CardTitle>
              <CardDescription>Average resolution time: {stats?.avg_resolution_hours?.toFixed(1) || '0'} hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">SLA Compliance</span>
                    <span className="text-sm font-bold text-primary">{slaCompliance}%</span>
                  </div>
                  <Progress value={slaCompliance} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-foreground">{stats?.open_tickets || 0}</div>
                    <div className="text-xs text-muted-foreground">Open</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold text-orange-500">{stats?.overdue_tickets || 0}</div>
                    <div className="text-xs text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Ticket Distribution
              </CardTitle>
              <CardDescription>By category breakdown</CardDescription>
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
                Team Performance
              </CardTitle>
              <CardDescription>Top performing staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="full_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved_tickets" fill="#3b82f6" name="Resolved" />
                  <Bar dataKey="overdue_tickets" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Latest ticket submissions</CardDescription>
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
