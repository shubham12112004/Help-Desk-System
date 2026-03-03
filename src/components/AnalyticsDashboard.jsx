import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getRevenueAnalytics,
  getAppointmentAnalytics,
  getTicketResolutionStats,
} from '@/services/enhance-hospital';

const AnalyticsDashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);
  const [ticketData, setTicketData] = useState([]);
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    avgResolutionRate: 0,
    admissions: 0,
    emergencies: 0,
  });

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const getDates = () => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case '7days':
        start.setDate(start.getDate() - 7);
        break;
      case '30days':
        start.setDate(start.getDate() - 30);
        break;
      case '90days':
        start.setDate(start.getDate() - 90);
        break;
      case 'ytd':
        start = new Date(end.getFullYear(), 0, 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDates();

      // Load revenue data
      const { data: revData, error: revError } = await getRevenueAnalytics(startDate, endDate);
      if (revError) throw revError;

      const formattedRevData = revData?.map(item => ({
        date: new Date(item.analytics_date).toLocaleDateString(),
        revenue: parseFloat(item.total_revenue || 0),
      })) || [];

      // Load appointment data
      const { data: aptData, error: aptError } = await getAppointmentAnalytics(startDate, endDate);
      if (aptError) throw aptError;

      const formattedAptData = aptData?.map(item => ({
        date: new Date(item.analytics_date).toLocaleDateString(),
        total: item.total_appointments || 0,
        completed: item.completed_appointments || 0,
        cancelled: item.cancelled_appointments || 0,
      })) || [];

      // Load ticket resolution data
      const { data: ticketData, error: ticketError } = await getTicketResolutionStats(startDate, endDate);
      if (ticketError) throw ticketError;

      const formattedTicketData = ticketData?.map(item => ({
        date: new Date(item.analytics_date).toLocaleDateString(),
        resolutionRate: parseFloat(item.ticket_resolution_rate || 0),
      })) || [];

      setRevenueData(formattedRevData);
      setAppointmentData(formattedAptData);
      setTicketData(formattedTicketData);

      // Calculate summary
      const totalRev = formattedRevData.reduce((sum, item) => sum + item.revenue, 0);
      const totalApt = formattedAptData.reduce((sum, item) => sum + item.total, 0);
      const completedApt = formattedAptData.reduce((sum, item) => sum + item.completed, 0);
      const avgRes = formattedTicketData.length > 0
        ? (formattedTicketData.reduce((sum, item) => sum + item.resolutionRate, 0) / formattedTicketData.length)
        : 0;

      setSummary({
        totalRevenue: totalRev,
        totalAppointments: totalApt,
        completedAppointments: completedApt,
        avgResolutionRate: avgRes,
        admissions: Math.floor(totalApt * 0.15), // Estimate
        emergencies: Math.floor(totalApt * 0.08), // Estimate
      });
    } catch (error) {
      console.error('Load analytics error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const appointmentStatusData = [
    {
      name: 'Completed',
      value: summary.completedAppointments,
      color: '#10b981',
    },
    {
      name: 'Pending',
      value: Math.max(0, summary.totalAppointments - summary.completedAppointments),
      color: '#f59e0b',
    },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <Button onClick={loadAnalyticsData} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold">₹{summary.totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Appointments</p>
              <p className="text-lg font-bold">{summary.totalAppointments}</p>
            </div>
            <Calendar className="h-6 w-6 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-lg font-bold">{summary.completedAppointments}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg Resolution</p>
              <p className="text-lg font-bold">{summary.avgResolutionRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-6 w-6 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Admissions</p>
              <p className="text-lg font-bold">{summary.admissions}</p>
            </div>
            <Users className="h-6 w-6 text-purple-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Emergencies</p>
              <p className="text-lg font-bold">{summary.emergencies}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Daily Revenue"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </Card>

        {/* Appointment Status */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Appointment Status</h3>
          {appointmentStatusData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {appointmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No appointment data
            </div>
          )}
        </Card>
      </div>

      {/* Appointment Details Chart */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Appointment Metrics</h3>
        {appointmentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total Appointments" />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No appointment data
          </div>
        )}
      </Card>

      {/* Ticket Resolution Chart */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Ticket Resolution Rate</h3>
        {ticketData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ticketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="resolutionRate"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Resolution Rate (%)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No resolution data
          </div>
        )}
      </Card>

      {/* Export Section */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Export Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">Download reports in various formats</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              📊 Download PDF
            </Button>
            <Button variant="outline" size="sm">
              📈 Download Excel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

import { AlertCircle } from 'lucide-react';

export default AnalyticsDashboard;
