import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Truck, Plus, AlertCircle, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getActivePrescriptions,
  getMedicineRequests,
  createMedicineRequest
} from "@/services/hospital";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function MedicineCard() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicineRequests, setMedicineRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prescResult, requestResult] = await Promise.all([
        getActivePrescriptions(user.id),
        getMedicineRequests(user.id)
      ]);

      if (prescResult.data) {
        setPrescriptions(prescResult.data);
      }
      if (requestResult.data) {
        setMedicineRequests(requestResult.data);
      }
    } catch (error) {
      console.error('Error loading medicine data:', error);
      toast.error('Failed to load medicine information');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMedicine = async (prescription) => {
    setIsRequesting(true);
    try {
      const { error } = await createMedicineRequest(
        user.id,
        prescription.id,
        'delivery'
      );

      if (error) {
        toast.error('Failed to request medicine');
        return;
      }

      toast.success(`Medicine request placed for ${prescription.medicine_name}`);
      setSelectedPrescription(null);
      loadData();
    } catch (error) {
      console.error('Error requesting medicine:', error);
      toast.error('Failed to place request');
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getDeliveryColor = (status) => {
    const colors = {
      pending: 'bg-orange-500',
      in_transit: 'bg-blue-500',
      delivered: 'bg-green-500',
      completed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Prescriptions */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold">Active Prescriptions</h3>
          </div>
          <Badge variant="secondary">{prescriptions.length}</Badge>
        </div>

        {prescriptions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active prescriptions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map(prescription => (
              <div
                key={prescription.id}
                className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {prescription.medicine_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage} • {prescription.schedule}
                    </p>
                  </div>
                  <Badge className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  Duration: {prescription.days} days
                </p>

                {prescription.instructions && (
                  <p className="text-xs bg-blue-50 dark:bg-blue-950/50 p-2 rounded mb-3 text-muted-foreground">
                    📝 {prescription.instructions}
                  </p>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      <Plus className="h-4 w-4" />
                      Request Medicine
                    </Button>
                  </DialogTrigger>
                  {selectedPrescription?.id === prescription.id && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Medicine from Pharmacy</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <p className="font-semibold mb-1">{prescription.medicine_name}</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            {prescription.dosage} • {prescription.schedule}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            The pharmacy will prepare your medicine and deliver it to your room.
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedPrescription(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 gap-2"
                            onClick={() => handleRequestMedicine(prescription)}
                            disabled={isRequesting}
                          >
                            {isRequesting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Requesting...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Request Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Medicine Requests & Delivery Status */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold">Delivery Status</h3>
          </div>
          <Badge variant="secondary">{medicineRequests.length}</Badge>
        </div>

        {medicineRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pending deliveries</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medicineRequests.map(request => (
              <div
                key={request.id}
                className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {request.prescription?.medicine_name || 'Medicine'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {request.delivery_type === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                    </p>
                  </div>
                  <Badge className={`${getDeliveryColor(request.delivery_status)} text-white`}>
                    {request.delivery_status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {request.delivery_address && (
                  <p className="text-xs bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded text-muted-foreground">
                    📍 {request.delivery_address}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
