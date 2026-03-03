import React, { useState } from 'react';
import {
  Users,
  Ticket,
  CreditCard,
  Truck,
  TrendingUp,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PatientMonitoringPanel from '@/components/PatientMonitoringPanel';
import AdvancedTokenSystem from '@/components/AdvancedTokenSystem';
import AppointmentManagement from '@/components/AppointmentManagement';
import BillingControl from '@/components/BillingControl';
import EmergencyDashboard from '@/components/EmergencyDashboard';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const EnhancedStaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    {
      id: 'overview',
      name: 'Dashboard Overview',
      icon: TrendingUp,
      description: 'Quick summary of hospital status',
    },
    {
      id: 'patients',
      name: 'Patient Monitoring',
      icon: Users,
      description: 'Monitor admitted & critical patients',
    },
    {
      id: 'tokens',
      name: 'Token System',
      icon: Ticket,
      description: 'OPD queue with OTP verification',
    },
    {
      id: 'appointments',
      name: 'Appointments',
      icon: Ticket,
      description: 'Manage & approve appointments',
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: CreditCard,
      description: 'Create bills & process payments',
    },
    {
      id: 'emergency',
      name: 'Emergency',
      icon: Truck,
      description: 'Ambulance requests & tracking',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      description: 'Revenue, appointments & stats',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'patients':
        return <PatientMonitoringPanel />;
      case 'tokens':
        return <AdvancedTokenSystem />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'billing':
        return <BillingControl />;
      case 'emergency':
        return <EmergencyDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              HD
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-900">Help Desk</h2>
                <p className="text-xs text-gray-500">Staff Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarOpen ? '' : tab.description}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="text-left">
                    <p className="text-sm font-medium">{tab.name}</p>
                    <p className="text-xs opacity-80 hidden lg:block">{tab.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-t from-gray-50 to-transparent">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Staff ID: #STF-001</p>
              <p className="text-xs text-gray-500">Last sync: Just now</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 text-white flex items-center justify-center font-bold">
              S
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = () => {
  const [statistics] = React.useState({
    admittedPatients: 42,
    criticalCases: 3,
    pendingAppointments: 15,
    activeTokens: 8,
    pendingPayments: 12,
    ambulanceRequests: 2,
    bedsOccupancy: '78%',
    staffOnDuty: 24,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Admitted Patients',
            value: statistics.admittedPatients,
            color: 'bg-blue-500',
            icon: '👥',
          },
          {
            label: 'Critical Cases',
            value: statistics.criticalCases,
            color: 'bg-red-500',
            icon: '⚠️',
          },
          {
            label: 'Pending Appointments',
            value: statistics.pendingAppointments,
            color: 'bg-yellow-500',
            icon: '📅',
          },
          {
            label: 'Active Tokens',
            value: statistics.activeTokens,
            color: 'bg-green-500',
            icon: '🎟️',
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              ➕ Generate OTP Token
            </Button>
            <Button className="w-full justify-start" variant="outline">
              📝 Create Bill
            </Button>
            <Button className="w-full justify-start" variant="outline">
              🚑 Request Ambulance
            </Button>
            <Button className="w-full justify-start" variant="outline">
              👤 Approve Appointment
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">System Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Supabase Database', status: 'connected', icon: '✅' },
              { name: 'Razorpay Gateway', status: 'connected', icon: '✅' },
              { name: 'Real-time Updates', status: 'active', icon: '✅' },
              { name: 'Backup Service', status: 'running', icon: '✅' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{item.name}</span>
                <span className="text-lg">{item.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold">Patient Admitted:</span> John Doe - Cardiology (10:30 AM)
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Token Generated:</span> Token #42 - Orthopedics (09:45 AM)
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Payment Received:</span> Bill #BL-2024-001 - ₹15,000 (08:20 AM)
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Ambulance Arrived:</span> Request #AMB-042 (07:15 AM)
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStaffDashboard;
