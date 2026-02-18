import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Download, AlertCircle, Loader2, Calendar, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getPatientBills, makePayment } from "@/services/hospital";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function BillingCard() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadBills();
    }
  }, [user]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const { data } = await getPatientBills(user.id);
      if (data) {
        setBills(data);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedBill.pending_amount) {
      toast.error(`Payment cannot exceed pending amount of ₹${selectedBill.pending_amount}`);
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await makePayment(selectedBill.id, amount);

      if (error) {
        toast.error('Payment failed. Please try again.');
        return;
      }

      toast.success(`Payment of ₹${amount} processed successfully!`);
      setPaymentAmount('');
      setSelectedBill(null);
      loadBills();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      partial: '⚠️',
      paid: '✅'
    };
    return icons[status] || '⏳';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const totalPending = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + (b.pending_amount || 0), 0);

  const totalBilled = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

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
      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Billed */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Billed</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBilled)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400 opacity-50" />
          </div>
        </Card>

        {/* Pending Amount */}
        <Card className={`p-6 bg-gradient-to-br ${
          totalPending > 0 
            ? 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800'
            : 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pending Amount</p>
              <p className={`text-2xl font-bold ${
                totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {formatCurrency(totalPending)}
              </p>
            </div>
            <AlertCircle className={`h-8 w-8 ${
              totalPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            } opacity-50`} />
          </div>
        </Card>

        {/* Bills Count */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-foreground">{bills.length}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Bills List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Billing History
        </h3>

        {bills.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No Bills</p>
            <p className="text-sm">Your bills will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map(bill => (
              <div
                key={bill.id}
                className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-lg p-4 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(bill.status)}</span>
                      Bill #{bill.bill_number}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Services and treatment charges
                    </p>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status}
                  </Badge>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-white dark:bg-slate-950 rounded border border-border text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid Amount</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(bill.paid_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className={`font-semibold ${
                      bill.pending_amount > 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatCurrency(bill.pending_amount || 0)}
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 p-2 bg-slate-200/30 dark:bg-slate-800/30 rounded">
                  <Calendar className="h-3 w-3" />
                  <span>Generated on {formatDate(bill.created_at)}</span>
                </div>

                {/* Progress Bar */}
                {bill.status !== 'paid' && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-medium">Payment Progress</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((bill.paid_amount / bill.amount) * 100)}%
                      </p>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${(bill.paid_amount / bill.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </Button>
                  {bill.status !== 'paid' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentAmount(bill.pending_amount.toString());
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay Now
                        </Button>
                      </DialogTrigger>
                      {selectedBill?.id === bill.id && (
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Make Payment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {/* Bill Details */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded border">
                              <div className="flex justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Bill #</span>
                                <span className="font-medium">{bill.bill_number}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Pending</span>
                                <span className="font-bold text-lg">
                                  {formatCurrency(bill.pending_amount)}
                                </span>
                              </div>
                            </div>

                            {/* Payment Amount */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Payment Amount
                              </label>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold">₹</span>
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  max={bill.pending_amount}
                                  className="flex-1"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Max: {formatCurrency(bill.pending_amount)}
                              </p>
                            </div>

                            {/* Payment Method Info */}
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                💳 <span className="font-medium">Payment Methods:</span> Debit Card, Credit Card, UPI, Netbanking
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => {
                                  setSelectedBill(null);
                                  setPaymentAmount('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="flex-1 gap-2"
                                onClick={handlePayment}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Pay ₹{paymentAmount || '0'}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Payment Notice */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <span className="font-medium">Secure Payments:</span> All payments are processed through secure payment gateways. Your data is encrypted and protected.
        </p>
      </Card>
    </div>
  );
}
