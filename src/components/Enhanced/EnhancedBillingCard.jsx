import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, DollarSign, Download, AlertCircle, Loader2, 
  Calendar, Check, TrendingDown, Eye, EyeOff, Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getPatientBills, makePayment } from "@/services/hospital";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  { id: 'card', label: '💳 Credit/Debit Card', icon: '💳' },
  { id: 'upi', label: '📱 UPI (Google Pay, PhonePe)', icon: '📱' },
  { id: 'netbanking', label: '🏦 Net Banking', icon: '🏦' },
  { id: 'wallet', label: '💰 Digital Wallet', icon: '💰' }
];

export function EnhancedBillingCard() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [visibleAmounts, setVisibleAmounts] = useState({});

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
      toast.error(`Payment cannot exceed ₹${selectedBill.pending_amount}`);
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await makePayment(selectedBill.id, amount, paymentMethod);

      if (error) {
        toast.error('Payment failed. Please try again.');
        return;
      }

      toast.success(`✅ Payment of ₹${amount} processed successfully!`);
      setPaymentAmount('');
      setPaymentMethod('card');
      setShowPaymentDialog(false);
      setSelectedBill(null);
      loadBills();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300',
      partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-300'
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
  const totalPaid = bills.reduce((sum, b) => sum + (b.paid_amount || 0), 0);

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="flex flex-col items-center justify-center gap-3 h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-muted-foreground">Loading billing information...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Billed */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Billed</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(totalBilled)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{bills.length} invoice{bills.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Total Paid */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-900/40 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Amount Paid</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalPaid)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                ✓ {Math.round((totalPaid / totalBilled) * 100)}% paid
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-500/20 dark:bg-green-500/30 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Pending Amount */}
        <Card className={`p-6 bg-gradient-to-br ${
          totalPending > 0 
            ? 'from-red-50 to-orange-100 dark:from-red-950/40 dark:to-orange-900/40 border-red-200 dark:border-red-800'
            : 'from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/40 border-emerald-200 dark:border-emerald-800'
        } hover:shadow-lg transition-shadow`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pending Amount</p>
              <p className={`text-3xl font-bold ${
                totalPending > 0 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                {formatCurrency(totalPending)}
              </p>
              {totalPending > 0 ? (
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white h-8">
                  <Zap className="h-3 w-3 mr-1" />
                  Pay Now
                </Button>
              ) : (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ All paid</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-lg bg-yellow-500/20 dark:bg-yellow-500/30 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Bills Table */}
      {bills.length > 0 ? (
        <div>
          <h3 className="font-bold text-lg mb-4">📋 Your Invoices</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {bills.map((bill) => (
              <Card key={bill.id} className="p-5 border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">Invoice #{bill.invoice_number || 'N/A'}</h4>
                      <Badge className={getStatusColor(bill.status)}>
                        {getStatusIcon(bill.status)} {bill.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(bill.bill_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                </div>

                {/* Bill Details */}
                {bill.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {bill.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Payment Progress</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(bill.paid_amount)} / {formatCurrency(bill.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        bill.status === 'paid'
                          ? 'bg-green-500'
                          : bill.status === 'partial'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(bill.paid_amount / bill.amount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {bill.status !== 'paid' && (
                    <Dialog open={showPaymentDialog && selectedBill?.id === bill.id} onOpenChange={(open) => {
                      if (open) {
                        setSelectedBill(bill);
                        setShowPaymentDialog(true);
                      } else {
                        setShowPaymentDialog(false);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentAmount((bill.pending_amount || bill.amount - (bill.paid_amount || 0)).toString());
                          }}
                        >
                          💳 Pay {formatCurrency(bill.pending_amount || bill.amount - (bill.paid_amount || 0))}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>💳 Complete Payment</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                          {/* Amount Display */}
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">Invoice Amount</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(selectedBill.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              Already Paid: {formatCurrency(selectedBill.paid_amount || 0)}
                            </p>
                          </div>

                          {/* Payment Amount */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Payment Amount</label>
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-lg font-bold">₹</span>
                              <Input
                                type="number"
                                placeholder={`Enter amount (₹0-${selectedBill.pending_amount || selectedBill.amount})`}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="pl-8"
                              />
                            </div>
                            {paymentAmount && (
                              <p className="text-xs text-muted-foreground mt-2">
                                After payment: {formatCurrency(
                                  (selectedBill.paid_amount || 0) + parseFloat(paymentAmount)
                                )} / {formatCurrency(selectedBill.amount)}
                              </p>
                            )}
                          </div>

                          {/* Payment Method */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Payment Method</label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem key={method.id} value={method.id}>
                                    {method.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Pay Button */}
                          <Button
                            onClick={handlePayment}
                            disabled={isProcessing || !paymentAmount}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-5 w-5 mr-2" />
                                Proceed to Payment
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed bg-gray-50 dark:bg-gray-900/50">
          <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="font-semibold mb-1">No Invoices</h3>
          <p className="text-sm text-muted-foreground">
            You don't have any billing records yet
          </p>
        </Card>
      )}
    </div>
  );
}
