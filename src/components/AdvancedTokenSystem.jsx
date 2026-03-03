import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  generateOTPToken,
  verifyOTPToken,
  startConsultation,
  completeConsultation,
} from '@/services/enhance-hospital';

const AdvancedTokenSystem = () => {
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState('general');
  const [departments] = useState([
    'general',
    'cardiology',
    'pediatrics',
    'neurology',
    'orthopedics',
  ]);

  // Load tokens
  useEffect(() => {
    loadTokens();
    
    const subscription = supabase
      .channel('token-queue')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'token_queue'
      }, loadTokens)
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const loadTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('token_queue')
        .select(`
          *,
          patient:patient_id(id, full_name, phone)
        `)
        .in('status', ['waiting', 'verified', 'in-progress'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Load tokens error:', error);
      toast.error('Failed to load tokens');
    }
  };

  const handleGenerateToken = async (patientId) => {
    try {
      setLoading(true);
      const { data, otp, error } = await generateOTPToken(patientId, department);

      if (error) throw error;

      toast.success(`Token generated! OTP: ${otp} (Valid for 10 minutes)`);
      loadTokens();
    } catch (error) {
      toast.error(error.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await verifyOTPToken(selectedToken.id, otpInput);

      if (error) throw error;

      toast.success('OTP verified successfully!');
      setShowOTPModal(false);
      setOtpInput('');
      loadTokens();
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (tokenId) => {
    try {
      setLoading(true);
      const { data, error } = await startConsultation(tokenId);

      if (error) throw error;

      toast.success('Consultation started');
      loadTokens();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async (tokenId) => {
    try {
      setLoading(true);
      const { data, error } = await completeConsultation(tokenId);

      if (error) throw error;

      toast.success('Consultation completed');
      loadTokens();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimeRemaining = (expiryTime) => {
    if (!expiryTime) return 'N/A';
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  const activeTokens = tokens.filter(t => ['waiting', 'verified'].includes(t.status));
  const inProgressTokens = tokens.filter(t => t.status === 'in-progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Token Queue System</h2>
        </div>
        <Button onClick={loadTokens} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Generate Token */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="font-semibold mb-3">Generate New Token</h3>
        <div className="flex gap-3">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept.charAt(0).toUpperCase() + dept.slice(1)}
              </option>
            ))}
          </select>
          <Button variant="outline">Select Patient...</Button>
        </div>
      </Card>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waiting</p>
              <p className="text-2xl font-bold">
                {tokens.filter(t => t.status === 'waiting').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verified (Ready)</p>
              <p className="text-2xl font-bold">
                {tokens.filter(t => t.status === 'verified').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">
                {tokens.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <Ticket className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Active Queue */}
      <div>
        <h3 className="font-semibold mb-3">Active Queue</h3>
        <div className="space-y-3">
          {activeTokens.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No active tokens in queue
            </Card>
          ) : (
            activeTokens.map((token, idx) => (
              <Card key={token.id} className="p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-lg">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{token.patient?.full_name}</p>
                        <p className="text-sm text-gray-500">{token.department}</p>
                      </div>
                    </div>

                    {/* OTP Display if verified */}
                    {token.status === 'verified' && !token.otp_verified && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm font-semibold text-green-800">✓ OTP Verified and Ready</p>
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm border inline-block ${getStatusBadge(token.status)}`}>
                      {token.status.charAt(0).toUpperCase() + token.status.slice(1)}
                    </span>

                    {token.status === 'waiting' && token.otp_code && !token.otp_verified && (
                      <p className="text-xs text-yellow-600 font-semibold">
                        ⏱️ OTP expires in {getTimeRemaining(token.otp_expiry)}
                      </p>
                    )}

                    <div className="flex gap-2 justify-end">
                      {token.status === 'waiting' && !token.otp_verified && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedToken(token);
                            setShowOTPModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Verify OTP
                        </Button>
                      )}

                      {token.status === 'verified' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartConsultation(token.id)}
                          disabled={loading}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* In Progress Consultations */}
      <div>
        <h3 className="font-semibold mb-3">In Progress Consultations</h3>
        <div className="space-y-3">
          {inProgressTokens.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No active consultations
            </Card>
          ) : (
            inProgressTokens.map(token => (
              <Card key={token.id} className="p-4 border-l-4 border-l-yellow-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{token.patient?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      Started: {new Date(token.consultation_start_time).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      🕐 In Consultation
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteConsultation(token.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP sent to the patient
            </DialogDescription>
          </DialogHeader>

          {selectedToken && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-semibold">{selectedToken.patient?.full_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium">6-Digit OTP</label>
                <Input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl font-bold mt-2"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Valid for: {getTimeRemaining(selectedToken.otp_expiry)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={otpInput.length !== 6 || loading}
                  className="flex-1"
                >
                  Verify & Proceed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedTokenSystem;
