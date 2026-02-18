import { AppLayout } from "@/components/AppLayout";
import { MedicineCard } from "@/components/MedicineCard";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Pharmacy = () => {
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
            <h1 className="text-3xl font-bold">💊 Pharmacy & Medicine</h1>
            <p className="text-muted-foreground mt-1">
              Manage your prescriptions and medicine requests
            </p>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mb-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Important: Do not skip medications
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Take all prescribed medicines on time as directed. Contact your
              doctor immediately if you experience any side effects.
            </p>
          </div>
        </div>

        {/* Medicine Card */}
        <div className="mb-8">
          <MedicineCard />
        </div>

        {/* Medicine Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How to Request Medicine */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">How to Request Medicine</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1</span>
                <span className="text-sm">
                  Find your active prescription in the list above
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2</span>
                <span className="text-sm">Click &quot;Request Medicine&quot; button</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3</span>
                <span className="text-sm">
                  Choose delivery or pickup option
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4</span>
                <span className="text-sm">
                  Confirm your request and track status
                </span>
              </li>
            </ol>
          </div>

          {/* Delivery Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-1">🚚 Home Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Free delivery within 24 hours. Medicine delivered to your
                  room or home address.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">🏪 Hospital Pickup</h3>
                <p className="text-sm text-muted-foreground">
                  Collect from pharmacy counter. Available 24/7 for patients and
                  attendants.
                </p>
              </div>
            </div>
          </div>

          {/* Medicine Safety */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Medicine Safety Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm mb-2">✓ Do&apos;s</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Take medicine with water</li>
                  <li>• Set reminders for doses</li>
                  <li>• Store in cool dry place</li>
                  <li>• Read package instructions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-2">✗ Don&apos;ts</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Don&apos;t miss doses</li>
                  <li>• Don&apos;t share medicine</li>
                  <li>• Don&apos;t mix with alcohol</li>
                  <li>• Don&apos;t take expired medicine</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pharmacy Contact */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Contact Pharmacy</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <label className="text-sm text-muted-foreground">Pharmacy</label>
                <p className="font-medium">+91 9876-543-220</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Hours</label>
                <p className="font-medium">24/7 Available</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <p className="font-medium">Ground Floor, Block B</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Pharmacy;
