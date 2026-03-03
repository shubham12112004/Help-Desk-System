import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Clock, 
  User, 
  Package, 
  Truck, 
  CheckCircle, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getAllMedicineRequests,
  updateMedicineRequestStatus
} from "@/services/hospital";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PharmacyControl() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadRequests();

    // Subscribe to real-time updates for ALL medicine requests
    const subscription = subscribeToAllMedicineRequests((payload) => {
      console.log('Pharmacy: Medicine request change', payload);
      loadRequests();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [statusFilter]);

  const subscribeToAllMedicineRequests = (callback) => {
    return supabase
      .channel('pharmacy-all-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medicine_requests'
        },
        callback
      )
      .subscribe();
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data, error } = await getAllMedicineRequests(filters);

      if (error) {
        toast.error('Failed to load medicine requests');
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading medicine requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      const { error } = await updateMedicineRequestStatus(requestId, newStatus);

      if (error) {
        toast.error('Failed to update status');
        return;
      }

      toast.success(`Status updated to ${newStatus}`);
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update request');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-500 text-white',
      processing: 'bg-blue-500 text-white',
      ready: 'bg-purple-500 text-white',
      delivered: 'bg-green-500 text-white'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      processing: Package,
      ready: CheckCircle,
      delivered: Truck
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'processing',
      processing: 'ready',
      ready: 'delivered',
      delivered: 'delivered'
    };
    return statusFlow[currentStatus];
  };

  const canAdvanceStatus = (status) => {
    return status !== 'delivered';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const pendingCount = requests.filter(r => r.delivery_status === 'pending').length;
  const processingCount = requests.filter(r => r.delivery_status === 'processing').length;
  const readyCount = requests.filter(r => r.delivery_status === 'ready').length;
  const deliveredCount = requests.filter(r => r.delivery_status === 'delivered').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Pharmacy Medicine Requests
              </CardTitle>
              <CardDescription>
                Manage and track all patient medicine requests in real-time
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadRequests}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('pending')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('processing')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{processingCount}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('ready')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold">{readyCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('delivered')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{deliveredCount}</p>
              </div>
              <Truck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            {statusFilter !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setStatusFilter('all')}>
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardContent className="pt-6">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No medicine requests found</p>
              <p className="text-sm">
                {statusFilter !== 'all' 
                  ? `No requests with status: ${statusFilter}` 
                  : 'All requests will appear here when patients make requests'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card 
                  key={request.id} 
                  className="border-l-4"
                  style={{
                    borderLeftColor: 
                      request.delivery_status === 'pending' ? '#f97316' :
                      request.delivery_status === 'processing' ? '#3b82f6' :
                      request.delivery_status === 'ready' ? '#a855f7' :
                      '#22c55e'
                  }}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Patient Info */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {request.patient?.full_name || 'Unknown'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {request.patient?.email}
                        </p>
                      </div>

                      {/* Medicine Info */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Pill className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            {request.prescription?.medicine_name || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {request.prescription?.dosage} • {request.prescription?.schedule}
                        </p>
                      </div>

                      {/* Delivery Info */}
                      <div className="col-span-2">
                        <Badge variant="outline" className="mb-1">
                          {request.delivery_type === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                        </Badge>
                        {request.delivery_address && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📍 {request.delivery_address}
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge className={`gap-1 ${getStatusColor(request.delivery_status)}`}>
                          {getStatusIcon(request.delivery_status)}
                          {request.delivery_status?.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end">
                        {canAdvanceStatus(request.delivery_status) ? (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(
                              request.id, 
                              getNextStatus(request.delivery_status)
                            )}
                            disabled={updatingId === request.id}
                            className="gap-2"
                          >
                            {updatingId === request.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                Move to {getNextStatus(request.delivery_status)}
                              </>
                            )}
                          </Button>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
