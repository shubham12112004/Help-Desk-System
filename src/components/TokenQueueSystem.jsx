import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, AlertCircle, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  createToken,
  getPatientTokens,
  getCurrentToken,
  subscribeToTokenQueue
} from "@/services/hospital";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS = [
  'OPD General',
  'Emergency',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Radiology',
  'Pathology'
];

export function TokenQueueSystem() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [currentTokens, setCurrentTokens] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (user) {
      loadTokens();
      loadCurrentTokens();
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscriptions = [];
    
    DEPARTMENTS.forEach(dept => {
      const sub = subscribeToTokenQueue(dept, (payload) => {
        console.log('Token update:', payload);
        if (payload.eventType === 'UPDATE') {
          setCurrentTokens(prev => ({
            ...prev,
            [dept]: payload.new
          }));
        }
        // Reload patient tokens
        if (payload.new?.patient_id === user?.id) {
          loadTokens();
        }
      });
      subscriptions.push(sub);
    });

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user]);

  const loadTokens = async () => {
    setLoading(true);
    const { data } = await getPatientTokens(user.id);
    if (data) {
      // Filter today's tokens
      const today = new Date().toISOString().split('T')[0];
      const todayTokens = data.filter(t => 
        t.issue_date.startsWith(today) && t.status !== 'cancelled'
      );
      setTokens(todayTokens);
    }
    setLoading(false);
  };

  const loadCurrentTokens = async () => {
    const promises = DEPARTMENTS.map(async (dept) => {
      const { data } = await getCurrentToken(dept);
      return { dept, data };
    });
    
    const results = await Promise.all(promises);
    const tokensMap = {};
    results.forEach(({ dept, data }) => {
      if (data) {
        tokensMap[dept] = data;
      }
    });
    setCurrentTokens(tokensMap);
  };

  const handleRequestToken = async () => {
    if (!selectedDepartment) {
      toast.error('Please select a department');
      return;
    }

    setIsRequesting(true);
    try {
      const { data, error } = await createToken(user.id, selectedDepartment);
      
      if (error) {
        toast.error('Failed to create token');
        return;
      }

      toast.success(`Token ${data.token_number} issued for ${selectedDepartment}!`);
      setSelectedDepartment('');
      loadTokens();
    } catch (error) {
      console.error('Token creation error:', error);
      toast.error('Failed to create token');
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-yellow-500',
      called: 'bg-blue-500 animate-pulse',
      'in-progress': 'bg-purple-500',
      completed: 'bg-green-500',
      cancelled: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusBadge = (status) => {
    const variants = {
      waiting: 'secondary',
      called: 'default',
      'in-progress': 'default',
      completed: 'outline',
      cancelled: 'outline'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Request New Token */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Request OPD Token</h3>
        <div className="flex gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleRequestToken} 
            disabled={isRequesting || !selectedDepartment}
            className="gap-2"
          >
            {isRequesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Get Token
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* My Tokens Today */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">My Tokens (Today)</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tokens issued today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokens.map(token => {
              const currentToken = currentTokens[token.department];
              const isYourTurn = currentToken?.token_number === token.token_number;
              
              return (
                <Card 
                  key={token.id} 
                  className={`p-4 ${isYourTurn ? 'ring-2 ring-primary bg-primary/5 animate-pulse' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{token.department}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(token.issue_date).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant={getStatusBadge(token.status)} className="capitalize">
                      {token.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Your Token</p>
                      <p className="text-3xl font-bold text-primary">
                        {token.token_number}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Current Token</p>
                      <p className="text-3xl font-bold text-muted-foreground">
                        {currentToken?.token_number || '-'}
                      </p>
                    </div>
                  </div>

                  {token.status === 'waiting' && (
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-muted-foreground">
                          Est. wait: {token.estimated_wait_minutes} mins
                        </span>
                      </div>
                      {isYourTurn && (
                        <div className="mt-2 p-2 bg-primary/10 rounded text-sm font-semibold text-primary">
                          🔔 It's your turn! Please proceed to the counter.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Department-wise Queue Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Live Queue Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEPARTMENTS.map(dept => {
            const current = currentTokens[dept];
            return (
              <div key={dept} className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm mb-2 truncate">{dept}</h4>
                <div className="text-2xl font-bold">
                  {current?.token_number || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Current Token</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
