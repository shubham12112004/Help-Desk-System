import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

export function SystemTest() {
  const { user } = useAuth();
  const [tests, setTests] = useState({
    auth: { status: 'pending', message: '', duration: 0 },
    database: { status: 'pending', message: '', duration: 0 },
    ticket_create: { status: 'pending', message: '', duration: 0 },
    ambulance_create: { status: 'pending', message: '', duration: 0 },
    billing_fetch: { status: 'pending', message: '', duration: 0 },
  });

  const [running, setRunning] = useState(false);

  const updateTest = (key, status, message, duration = 0) => {
    setTests((prev) => ({
      ...prev,
      [key]: { status, message, duration },
    }));
  };

  const testAuth = async () => {
    const start = Date.now();
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) throw error;

      updateTest(
        'auth',
        'success',
        `Authenticated as ${authUser?.email || 'unknown'}`,
        Date.now() - start
      );
    } catch (error) {
      updateTest('auth', 'error', error.message, Date.now() - start);
    }
  };

  const testDatabase = async () => {
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;

      updateTest(
        'database',
        'success',
        `Profile loaded: ${data?.full_name || 'Unknown'}`,
        Date.now() - start
      );
    } catch (error) {
      updateTest('database', 'error', error.message, Date.now() - start);
    }
  };

  const testTicketCreate = async () => {
    const start = Date.now();
    try {
      if (!user) throw new Error('No authenticated user');

      // Generate unique ticket number
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      const ticketNumber = `TEST-${Date.now()}`;

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ticket_number: ticketNumber,
          title: 'System Test Ticket',
          description: 'This is an automated system test ticket',
          category: 'technical',
          priority: 'low',
          status: 'open',
          created_by: user.id,
          department: 'administration',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Clean up - delete the test ticket
      await supabase.from('tickets').delete().eq('id', data.id);

      updateTest(
        'ticket_create',
        'success',
        `Ticket created and deleted successfully (ID: ${data.id})`,
        Date.now() - start
      );
    } catch (error) {
      const message = error.message || 'Unknown error';
      const details = error.details || error.hint || '';
      updateTest(
        'ticket_create',
        'error',
        `${message}${details ? ` - ${details}` : ''}`,
        Date.now() - start
      );
    }
  };

  const testAmbulanceCreate = async () => {
    const start = Date.now();
    try {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('ambulance_requests')
        .insert({
          patient_id: user.id,
          pickup_location: 'Test Location',
          destination: 'Hospital',
          emergency_type: 'Test Emergency',
          contact_number: '1234567890',
          status: 'requested',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Clean up - delete the test request
      await supabase.from('ambulance_requests').delete().eq('id', data.id);

      updateTest(
        'ambulance_create',
        'success',
        `Ambulance request created and deleted successfully (ID: ${data.id})`,
        Date.now() - start
      );
    } catch (error) {
      const message = error.message || 'Unknown error';
      const details = error.details || error.hint || '';
      updateTest(
        'ambulance_create',
        'error',
        `${message}${details ? ` - ${details}` : ''}`,
        Date.now() - start
      );
    }
  };

  const testBillingFetch = async () => {
    const start = Date.now();
    try {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('billing')
        .select('*')
        .eq('patient_id', user.id)
        .limit(5);

      if (error) {
        throw error;
      }

      updateTest(
        'billing_fetch',
        'success',
        `Fetched ${data?.length || 0} billing records`,
        Date.now() - start
      );
    } catch (error) {
      const message = error.message || 'Unknown error';
      const details = error.details || error.hint || '';
      updateTest(
        'billing_fetch',
        'error',
        `${message}${details ? ` - ${details}` : ''}`,
        Date.now() - start
      );
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    // Reset all tests
    Object.keys(tests).forEach((key) => {
      updateTest(key, 'running', 'Testing...', 0);
    });

    await testAuth();
    await new Promise((resolve) => setTimeout(resolve, 300));

    await testDatabase();
    await new Promise((resolve) => setTimeout(resolve, 300));

    await testTicketCreate();
    await new Promise((resolve) => setTimeout(resolve, 300));

    await testAmbulanceCreate();
    await new Promise((resolve) => setTimeout(resolve, 300));

    await testBillingFetch();

    setRunning(false);
    toast.success('All tests completed!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">RUNNING</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">PENDING</Badge>;
      default:
        return null;
    }
  };

  const testItems = [
    { key: 'auth', label: '🔐 Authentication', icon: '🔑' },
    { key: 'database', label: '💾 Database Connection', icon: '🗄️' },
    { key: 'ticket_create', label: '🎫 Create Ticket', icon: '📝' },
    { key: 'ambulance_create', label: '🚑 Request Ambulance', icon: '🚗' },
    { key: 'billing_fetch', label: '💰 Fetch Billing', icon: '💳' },
  ];

  const allPassed = Object.values(tests).every((t) => t.status === 'success' || t.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">System Diagnostics</h1>
          </div>
          <p className="text-gray-600">Test all critical system components</p>
        </div>

        <Card className="p-6 mb-6 border-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Test Suite</h2>
              <p className="text-sm text-gray-600 mt-1">
                {Object.values(tests).filter((t) => t.status === 'success').length} /
                {' '}
                {Object.values(tests).length} tests passed
              </p>
            </div>
            <Button
              onClick={runAllTests}
              disabled={running}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {running ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {testItems.map(({ key, label, icon }) => {
              const test = tests[key];
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    test.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : test.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : test.status === 'running'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{label}</p>
                        {test.message && (
                          <p
                            className={`text-sm mt-1 ${
                              test.status === 'error'
                                ? 'text-red-700'
                                : test.status === 'success'
                                ? 'text-green-700'
                                : 'text-gray-600'
                            }`}
                          >
                            {test.message}
                          </p>
                        )}
                        {test.duration > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {test.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 border-2 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Troubleshooting Guide</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              <strong>🔐 Auth Fails:</strong> Check Supabase authentication settings and
              make sure you're logged in
            </li>
            <li>
              <strong>💾 Database Fails:</strong> Check Supabase connection and RLS policies
            </li>
            <li>
              <strong>🎫 Ticket Fails:</strong> Check if user has permission to insert tickets,
              verify RLS policies on tickets table
            </li>
            <li>
              <strong>🚑 Ambulance Fails:</strong> Check if ambulance_requests table exists
              and RLS policies are configured correctly
            </li>
            <li>
              <strong>💰 Billing Fails:</strong> Check if billing table exists and user has
              read permissions
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
