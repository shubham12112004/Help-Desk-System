import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Download, AlertCircle, Loader2, Calendar, Check, CheckCircle, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getPatientBills, makePayment } from "@/services/hospital";
import { initiateRazorpayPayment, isRazorpayConfigured } from "@/services/razorpay";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function BillingCard() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [demoPin, setDemoPin] = useState('');
  const [demoPaying, setDemoPaying] = useState(false);
  const [demoStage, setDemoStage] = useState('input');
  const isDemoMode = import.meta.env.DEV;

  useEffect(() => {
    if (user) {
      loadBills();
      loadUserProfile();
    }
  }, [user]);

  useEffect(() => {
    // Check if Razorpay is configured
    setRazorpayEnabled(isRazorpayConfigured());
  }, []);

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

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handlePayNowRedirect = (bill) => {
    setSelectedBill(bill);
    setDemoPin('');
    setDemoStage('input');
    setShowPaymentModal(true);
  };

  const handleDemoPayment = async () => {
    if (!selectedBill) return;

    if (!demoPin.trim()) {
      toast.error('Please enter a PIN to continue.');
      return;
    }

    try {
      setDemoPaying(true);
      setDemoStage('processing');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const { error } = await supabase
        .from('billing')
        .update({
          status: 'paid',
          payment_method: 'demo',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBill.id);

      if (error) throw error;

      setDemoStage('success');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('💳 Payment Successful! Bill marked as PAID ✓', {
        duration: 4000
      });
      setShowPaymentModal(false);
      setDemoPin('');
      setDemoStage('input');
      loadBills();
    } catch (error) {
      console.error('Demo payment error:', error);
      toast.error(error.message || 'Demo payment failed. Please try again.');
      setDemoStage('input');
    } finally {
      setDemoPaying(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > getPendingAmount(selectedBill)) {
      toast.error(`Payment cannot exceed pending amount of ₹${getPendingAmount(selectedBill)}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Redirect to UPI payment
      handlePayNowRedirect(selectedBill);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment', {
        description: error.message || 'Please try again later',
      });
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

  const handleDownloadReceipt = (bill) => {
    // Generate HTML receipt
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${bill.bill_number}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      color: #000;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 32px;
    }
    .header p {
      color: #64748b;
      margin: 5px 0;
    }
    .receipt-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .detail-group {
      margin-bottom: 10px;
    }
    .detail-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      font-size: 16px;
      color: #1e293b;
      font-weight: 600;
      margin-top: 4px;
    }
    .amount-section {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .amount-section h2 {
      margin: 0 0 10px 0;
      font-size: 18px;
      opacity: 0.9;
    }
    .amount-section .amount {
      font-size: 48px;
      font-weight: bold;
      margin: 0;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 15px;
    }
    .status-paid {
      background: #10b981;
      color: white;
    }
    .status-pending {
      background: #ef4444;
      color: white;
    }
    .status-partial {
      background: #f59e0b;
      color: white;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 2px solid #e2e8f0;
      color: #64748b;
      font-size: 14px;
    }
    .print-button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin-bottom: 20px;
    }
    .print-button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print Receipt</button>
  
  <div class="header">
    <h1>🏥 MedDesk Hospital</h1>
    <p>Payment Receipt</p>
    <p style="font-size: 14px; margin-top: 10px;">Receipt #${bill.bill_number}</p>
  </div>

  <div class="receipt-details">
    <div>
      <div class="detail-group">
        <div class="detail-label">Patient Name</div>
        <div class="detail-value">${userProfile?.full_name || 'N/A'}</div>
      </div>
      <div class="detail-group">
        <div class="detail-label">Patient Email</div>
        <div class="detail-value">${userProfile?.email || 'N/A'}</div>
      </div>
      <div class="detail-group">
        <div class="detail-label">Bill Date</div>
        <div class="detail-value">${formatDate(bill.created_at)}</div>
      </div>
    </div>
    <div>
      <div class="detail-group">
        <div class="detail-label">Bill Number</div>
        <div class="detail-value">${bill.bill_number}</div>
      </div>
      <div class="detail-group">
        <div class="detail-label">Description</div>
        <div class="detail-value">${bill.description || 'Hospital Services'}</div>
      </div>
      <div class="detail-group">
        <div class="detail-label">Payment Method</div>
        <div class="detail-value">${bill.payment_method ? bill.payment_method.toUpperCase() : 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="amount-section">
    <h2>Total Amount</h2>
    <p class="amount">₹${bill.amount.toFixed(2)}</p>
    <div class="status-badge status-${bill.status}">
      ${bill.status === 'paid' ? '✓ PAID' : bill.status === 'partial' ? '⚠ PARTIAL' : '⏳ PENDING'}
    </div>
  </div>

  <div class="footer">
    <p><strong>Thank you for your payment!</strong></p>
    <p>This is a computer-generated receipt and does not require a signature.</p>
    <p style="margin-top: 15px; font-size: 12px;">
      MedDesk Hospital · 📞 +91-1800-XXX-XXXX · 📧 billing@meddesk.com
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
      Generated on ${new Date().toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })}
    </p>
  </div>
</body>
</html>
    `.trim();

    // Create blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${bill.bill_number}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully!', {
      description: 'Open the HTML file to view or print your receipt'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getPaidAmount = (bill) => (bill?.status === 'paid' ? (bill?.amount || 0) : 0);
  const getPendingAmount = (bill) => (bill?.status === 'paid' ? 0 : (bill?.amount || 0));

  const totalPending = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + getPendingAmount(b), 0);

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
    <>
      {/* Demo Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Process Payment
            </DialogTitle>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">💰 BILL AMOUNT</p>
                <p className="text-4xl font-bold text-blue-900 mt-2">₹{selectedBill.amount}</p>
                <p className="text-xs text-blue-600 mt-2">Patient: {selectedBill.patient_id}</p>
              </div>

              {demoStage === 'input' && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-yellow-50 border-2 border-yellow-200 p-3">
                    <p className="text-xs font-bold text-yellow-900">🎭 DEMO MODE ENABLED</p>
                    <p className="text-xs text-yellow-700 mt-1">Enter any 4-digit PIN to complete demo payment</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Enter 4-Digit PIN</label>
                    <Input
                      type="password"
                      placeholder="• • • •"
                      value={demoPin}
                      onChange={(e) => setDemoPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="mt-2 text-center text-2xl tracking-[0.5em] font-bold border-2 py-6"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDemoPayment}
                      disabled={demoPaying || demoPin.length < 4}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                    >
                      {demoPaying ? '⏳ Processing...' : '✓ Pay Now'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {demoStage === 'processing' && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="relative h-20 w-20">
                    <div className="absolute inset-0 rounded-full bg-blue-200/40 animate-ping" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Coins className="h-12 w-12 text-blue-600 animate-bounce" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Processing Payment...</p>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-600 h-1 rounded-full w-full animate-pulse" />
                  </div>
                </div>
              )}

              {demoStage === 'success' && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-green-200/30 scale-110" />
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 relative z-10">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-bold text-green-700">✓ Payment Successful!</p>
                    <p className="text-sm text-gray-600">Your bill has been marked as PAID</p>
                    <p className="text-xs text-blue-600 font-semibold mt-2">Receipt: #{selectedBill.id}</p>
                  </div>
                  <div className="w-full pt-2 border-t border-gray-200">
                    <Button
                      onClick={() => {
                        setShowPaymentModal(false);
                        setDemoPin('');
                        setDemoStage('input');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Billed */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Billed</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(totalBilled)}</p>
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
                totalPending > 0 ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'
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
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{bills.length}</p>
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
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Paid Amount</p>
                    <p className="font-bold text-lg text-green-700 dark:text-green-300">
                      {formatCurrency(getPaidAmount(bill))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className={`font-bold text-lg ${
                      getPendingAmount(bill) > 0 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-green-700 dark:text-green-300'
                    }`}>
                      {formatCurrency(getPendingAmount(bill))}
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
                        {Math.round((getPaidAmount(bill) / bill.amount) * 100)}%
                      </p>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${(getPaidAmount(bill) / bill.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    onClick={() => handleDownloadReceipt(bill)}
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </Button>
                  {bill.status !== 'paid' && (
                    <Button
                      size="sm"
                      className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                      onClick={() => handlePayNowRedirect(bill)}
                    >
                      <CreditCard className="h-4 w-4" />
                      💳 Pay Now
                    </Button>
                  )}
                  {bill.status !== 'paid' && false && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex-1 gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                          onClick={() => {
                            setSelectedBill(bill);
                            setPaymentAmount(getPendingAmount(bill).toString());
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                          💳 Pay Now (Old)
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
                                  {formatCurrency(getPendingAmount(bill))}
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
                                  max={getPendingAmount(bill)}
                                  className="flex-1"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Max: {formatCurrency(getPendingAmount(bill))}
                              </p>
                            </div>

                            {/* Payment Method Info */}
                            <div className="space-y-2">
                              <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 rounded-lg border-2 border-purple-300 dark:border-purple-700 shadow-sm animate-pulse-slow">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl animate-bounce">📱</span>
                                  <span className="font-bold text-purple-700 dark:text-purple-300 text-base">
                                    UPI Payment - INSTANT & FREE
                                  </span>
                                  <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold">⚡ Fastest</Badge>
                                </div>
                                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                                  ✅ Google Pay • PhonePe • Paytm • BHIM UPI
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                  No card details needed • Scan QR or enter UPI ID
                                </p>
                              </div>
                              
                              <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                  💳 <span className="font-bold">Also Supports:</span> Credit/Debit Cards • Net Banking • Wallets
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                  Visa, Mastercard, RuPay • All Major Banks
                                </p>
                              </div>

                              {razorpayEnabled ? (
                                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-300 dark:border-green-700">
                                  <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                                    🔒 <span className="font-bold">Secure Payment by Razorpay</span>
                                  </p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    ✅ PCI-DSS Compliant • Bank-level encryption • Trusted by millions
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                                  <p className="text-xs text-amber-700 dark:text-amber-300">
                                    ⚠️ Razorpay not configured. Using basic payment mode.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                className="flex-1 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 transition-all"
                                onClick={() => {
                                  setSelectedBill(null);
                                  setPaymentAmount('');
                                }}
                                disabled={isProcessing}
                              >
                                ✕ Cancel
                              </Button>
                              <Button
                                className="flex-1 gap-2 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handlePayment}
                                disabled={isProcessing || !paymentAmount || parseFloat(paymentAmount) <= 0}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing Payment...
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-5 w-5" />
                                    💸 Pay ₹{paymentAmount || '0'}
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
          💡 <span className="font-medium">Secure Payments powered by Razorpay:</span> All payments are processed through encrypted and PCI-DSS compliant payment gateways. Your financial data is completely secure.
        </p>
      </Card>
      </div>
    </>
  );
}
