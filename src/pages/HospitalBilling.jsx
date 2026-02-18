import { AppLayout } from "@/components/AppLayout";
import { BillingCard } from "@/components/BillingCard";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HospitalBilling = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold">💳 Billing & Payments</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your hospital bills
            </p>
          </div>
        </div>

        {/* Billing Card */}
        <div className="mb-8">
          <BillingCard />
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <h3 className="font-medium text-sm">💳 Debit Card</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Visa, Mastercard, RuPay
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <h3 className="font-medium text-sm">💰 Credit Card</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  All major credit cards accepted
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <h3 className="font-medium text-sm">📱 UPI</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Google Pay, PhonePe, Paytm, BHIM
                </p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <h3 className="font-medium text-sm">🏦 Net Banking</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  All major Indian banks
                </p>
              </div>
            </div>
          </div>

          {/* Bill Types */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Types of Bills</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm">Admission Charges</h3>
                <p className="text-xs text-muted-foreground">
                  Room rent, bed charges, ward services
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm">Medical Services</h3>
                <p className="text-xs text-muted-foreground">
                  Doctor consultation, procedures, surgery
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm">Diagnostic Tests</h3>
                <p className="text-xs text-muted-foreground">
                  Lab tests, imaging, pathology services
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm">Medicines</h3>
                <p className="text-xs text-muted-foreground">
                  Prescription medicines and supplements
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status Guide */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Understanding Payment Status</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Pending</h3>
                  <p className="text-xs text-muted-foreground">
                    Bill not yet paid. Payment due according to hospital policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Partial</h3>
                  <p className="text-xs text-muted-foreground">
                    Some amount paid. Remaining balance due
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Paid</h3>
                  <p className="text-xs text-muted-foreground">
                    Full amount paid. Receipt available for download
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Pay */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">How to Make a Payment</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Select a Bill</p>
                  <p className="text-xs text-muted-foreground">
                    Choose the bill you want to pay from the list above
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Click &quot;Pay Now&quot;</p>
                  <p className="text-xs text-muted-foreground">
                    Open the payment dialog for that bill
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Enter Amount</p>
                  <p className="text-xs text-muted-foreground">
                    Enter the amount to pay (cannot exceed pending amount)
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-sm">Select Payment Method</p>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred payment option
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  5
                </div>
                <div>
                  <p className="font-medium text-sm">Confirm Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Review details and click Confirm Payment
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  6
                </div>
                <div>
                  <p className="font-medium text-sm">Download Receipt</p>
                  <p className="text-xs text-muted-foreground">
                    After success, download your receipt for records
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* FAQ */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  Q: Can I pay partially?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: Yes, you can make partial payments anytime. Your receipt will show the remaining balance.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  Q: Where can I get an invoice?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: Click &quot;Download Receipt&quot; after payment. You can also request one from the billing counter.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  Q: What payment deadline should I follow?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: As per hospital policy, payment should be made within 30 days of bill generation.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-blue-600 dark:text-blue-400">
                  Q: Is there a discount for advance payment?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: Yes, 5% discount available for online payments. Ask at the billing counter for other discounts.
                </p>
              </div>
            </div>
          </div>

          {/* Support Contact */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Billing Support</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Tel</p>
                <p className="font-medium text-sm mt-1">+91-9876-543-250</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-sm mt-1">billing@hospital.com</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Hours</p>
                <p className="font-medium text-sm mt-1">24/7 Available</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-sm mt-1">Main Entrance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HospitalBilling;
