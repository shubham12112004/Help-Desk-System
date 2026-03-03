import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileText,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  RefreshCw,
  Download,
  CheckCircle,
  Coins,
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
  createBill,
  applyInsuranceDiscount,
  getBillDetails,
} from '@/services/enhance-hospital';
import { initiateRazorpayPayment, isRazorpayConfigured } from '@/services/razorpay';
import { useAuth } from '@/hooks/useAuth';

const BillingControl = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [demoPin, setDemoPin] = useState('');
  const [demoPaying, setDemoPaying] = useState(false);
  const [showDemoPrompt, setShowDemoPrompt] = useState(false);
  const [demoStage, setDemoStage] = useState('input');
  const isDemoMode = import.meta.env.DEV;
  const [filterStatus, setFilterStatus] = useState('all');
  const [newBillData, setNewBillData] = useState({
    patientId: '',
    items: [
      { type: 'consultation', name: '', description: '', quantity: 1, unitPrice: 0 }
    ],
    insuranceDiscount: 0,
  });
  const [itemBillingTypes] = useState([
    'consultation',
    'procedure',
    'medication',
    'room',
    'lab',
    'imaging',
    'surgery',
    'emergency',
  ]);

  // Load bills
  useEffect(() => {
    loadBills();

    const subscription = supabase
      .channel('bills')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'billing'
      }, loadBills)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [filterStatus]);

  // Handle URL parameters for auto-opening payment modal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billId = params.get('billId');
    const action = params.get('action');

    if (billId && action === 'pay' && bills.length > 0) {
      const bill = bills.find(b => b.id === billId);
      if (bill) {
        handleInitiatePayment(bill);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [bills]);

  const loadBills = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('billing')
        .select(`
          id,
          bill_number,
          patient_id,
          amount,
          status,
          bill_date,
          patient:patient_id(id, full_name, email, phone)
        `)
        .order('bill_date', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Load bills error:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const addBillItem = () => {
    setNewBillData({
      ...newBillData,
      items: [
        ...newBillData.items,
        { type: 'consultation', name: '', description: '', quantity: 1, unitPrice: 0 }
      ]
    });
  };

  const removeBillItem = (index) => {
    setNewBillData({
      ...newBillData,
      items: newBillData.items.filter((_, i) => i !== index)
    });
  };

  const updateBillItem = (index, field, value) => {
    const updatedItems = [...newBillData.items];
    updatedItems[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
    updatedItems[index].totalPrice = (updatedItems[index].quantity || 1) * (updatedItems[index].unitPrice || 0);
    setNewBillData({ ...newBillData, items: updatedItems });
  };

  const calculateTotals = () => {
    const subtotal = newBillData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const tax = subtotal * 0.05; // 5% tax
    const discountAmount = (subtotal + tax) * (newBillData.insuranceDiscount / 100);
    const total = subtotal + tax - discountAmount;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const handleCreateBill = async () => {
    if (!newBillData.patientId || newBillData.items.length === 0) {
      toast.error('Please select patient and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await createBill(
        newBillData.patientId,
        null, // medicalRecordId - can be added later
        newBillData.items,
        user.id
      );

      if (error) throw error;

      toast.success('Bill created successfully');
      setShowCreateModal(false);
      setNewBillData({
        patientId: '',
        items: [{ type: 'consultation', name: '', description: '', quantity: 1, unitPrice: 0 }],
        insuranceDiscount: 0,
      });
      loadBills();
    } catch (error) {
      toast.error(error.message || 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiatePayment = (bill) => {
    setSelectedBill(bill);
    setDemoPin('');
    setDemoStage('input');
    // Show demo prompt immediately in demo mode
    setShowDemoPrompt(isDemoMode || !isRazorpayConfigured());
    setShowPaymentModal(true);
  };

  const getPendingAmount = (bill) => (
    bill?.status === 'paid' ? 0 : (bill?.amount || 0)
  );

  const handleProcessPayment = async () => {
    if (!selectedBill) return;

    if (isDemoMode || !isRazorpayConfigured()) {
      setShowDemoPrompt(true);
      toast.info('Demo mode: enter any PIN to simulate payment.');
      return;
    }

    try {
      const patientEmail = selectedBill.patient?.email || 'patient@hospital.com';
      const patientPhone = selectedBill.patient?.phone || '9999999999';

      await initiateRazorpayPayment({
        amount: parseFloat(getPendingAmount(selectedBill)),
        billId: selectedBill.id,
        billNumber: selectedBill.bill_number,
        userName: selectedBill.patient?.full_name,
        userEmail: patientEmail,
        userPhone: patientPhone,
        description: `Hospital Bill #${selectedBill.bill_number}`,
        onSuccess: async (paymentData) => {
          // Update bill status
          const { error } = await supabase
            .from('billing')
            .update({
              status: 'paid',
              payment_method: 'razorpay',
              updated_at: new Date().toISOString()
            })
            .eq('id', selectedBill.id);

          if (!error) {
            toast.success('Payment successful!');
            setShowPaymentModal(false);
            loadBills();
          }
        },
        onFailure: (error) => {
          toast.error('Payment failed: ' + error);
        }
      });
    } catch (error) {
      toast.error(error.message);
    }
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
      await new Promise((resolve) => setTimeout(resolve, 700));

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
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success('Payment successful (demo)!');
      setShowPaymentModal(false);
      setDemoPin('');
      setDemoStage('input');
      loadBills();
    } catch (error) {
      toast.error(error.message || 'Demo payment failed');
      setDemoStage('input');
    } finally {
      setDemoPaying(false);
    }
  };

  const handleApplyInsurance = async () => {
    if (!selectedBill) return;

    try {
      setLoading(true);
      const discountAmount = parseFloat(getPendingAmount(selectedBill)) * 0.3; // 30% insurance coverage

      const { data, error } = await applyInsuranceDiscount(selectedBill.id, discountAmount);

      if (error) throw error;

      toast.success(`Insurance discount of ₹${discountAmount.toFixed(2)} applied`);
      loadBills();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'overdue':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totals = calculateTotals();
  const unpaidAmount = bills.reduce((sum, bill) => 
    bill.status !== 'paid' ? sum + getPendingAmount(bill) : sum, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Billing Management</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBills} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold">{bills.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Bills</p>
              <p className="text-2xl font-bold">
                {bills.filter(b => b.status === 'paid').length}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unpaid Amount</p>
              <p className="text-2xl font-bold">₹{unpaidAmount.toFixed(2)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payment</p>
              <p className="text-2xl font-bold">
                {bills.filter(b => b.status !== 'paid').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'paid', 'pending', 'partial'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            onClick={() => setFilterStatus(status)}
            size="sm"
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading bills...</p>
          </Card>
        ) : bills.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No bills found
          </Card>
        ) : (
          bills.map(bill => (
            <Card key={bill.id} className="p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{bill.bill_number}</p>
                      <p className="text-sm text-gray-500">{bill.patient?.full_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-semibold">₹{bill.amount}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Patient Owes:</span>
                      <p className="font-semibold">₹{getPendingAmount(bill)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-semibold">
                        {new Date(bill.bill_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs border inline-block mt-1 ${getStatusColor(bill.status)}`}>
                        {bill.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {bill.status !== 'paid' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleInitiatePayment(bill)}
                        disabled={loading}
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBill(bill);
                          handleApplyInsurance();
                        }}
                        disabled={loading}
                      >
                        <Percent className="h-4 w-4 mr-1" />
                        Insurance
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Bill Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Bill</DialogTitle>
            <DialogDescription>
              Add items and create an itemized bill
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="text-sm font-medium">Select Patient</label>
              <Input
                placeholder="Search patient..."
                onChange={(e) => setNewBillData({ ...newBillData, patientId: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Bill Items */}
            <div>
              <label className="text-sm font-medium mb-2 block">Bill Items</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newBillData.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end p-2 bg-gray-50 rounded">
                    <select
                      value={item.type}
                      onChange={(e) => updateBillItem(idx, 'type', e.target.value)}
                      className="text-sm px-2 py-1 border rounded"
                    >
                      {itemBillingTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateBillItem(idx, 'name', e.target.value)}
                      className="text-sm flex-1 h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateBillItem(idx, 'quantity', e.target.value)}
                      className="text-sm w-16 h-9"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateBillItem(idx, 'unitPrice', e.target.value)}
                      className="text-sm w-24 h-9"
                    />
                    <span className="text-sm font-semibold min-w-20">
                      ₹{(item.totalPrice || 0).toFixed(2)}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeBillItem(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={addBillItem}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {/* Insurance Discount */}
            <div>
              <label className="text-sm font-medium">Insurance Discount (%)</label>
              <Input
                type="number"
                value={newBillData.insuranceDiscount}
                onChange={(e) => setNewBillData({ ...newBillData, insuranceDiscount: parseFloat(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>

            {/* Totals */}
            <div className="p-3 bg-gray-50 rounded space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (5%):</span>
                <span>₹{totals.tax}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-₹{totals.discountAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{totals.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleCreateBill} disabled={loading} className="flex-1">
                Create Bill
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Complete payment via Razorpay
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-gray-600">Bill Number</p>
                <p className="font-semibold">{selectedBill.bill_number}</p>
                <p className="text-sm text-gray-600 mt-2">Patient</p>
                <p className="font-semibold">{selectedBill.patient?.full_name}</p>
              </div>

              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm text-gray-600">Amount to Pay</p>
                <p className="text-2xl font-bold">₹{getPendingAmount(selectedBill)}</p>
              </div>

              {/* Only show Razorpay button when NOT in demo mode */}
              {!isDemoMode && isRazorpayConfigured() && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleProcessPayment}
                    disabled={loading}
                    className="flex-1"
                  >
                    Pay Now (Razorpay)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Demo Payment Section */}
              {(isDemoMode || !isRazorpayConfigured()) && showDemoPrompt && (
                <div className="space-y-3 p-4">
                  {demoStage === 'input' && (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                        <p className="text-xs font-medium text-blue-900">🎭 Demo Mode</p>
                        <p className="text-xs text-blue-700 mt-1">Enter any 4-digit PIN to simulate payment</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Enter PIN</label>
                        <Input
                          type="password"
                          placeholder="Enter 4-digit PIN"
                          value={demoPin}
                          onChange={(e) => setDemoPin(e.target.value)}
                          maxLength={4}
                          className="mt-2 text-center text-lg tracking-widest"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDemoPayment}
                          disabled={demoPaying || demoPin.length < 4}
                          className="flex-1"
                        >
                          {demoPaying ? 'Processing...' : 'Pay Now'}
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
                    <div className="flex flex-col items-center gap-3 py-3">
                      <div className="relative h-16 w-16">
                        <div className="absolute inset-0 rounded-full bg-amber-200/60 blur" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Coins className="h-10 w-10 text-amber-500 animate-bounce" />
                        </div>
                        <div className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-amber-400 animate-ping" />
                      </div>
                      <p className="text-sm text-muted-foreground">Processing payment...</p>
                    </div>
                  )}

                  {demoStage === 'success' && (
                    <div className="flex flex-col items-center gap-2 py-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-7 w-7 text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-green-700">Payment Successful</p>
                      <p className="text-xs text-muted-foreground">Receipt generated</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingControl;
