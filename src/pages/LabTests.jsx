import { AppLayout } from "@/components/AppLayout";
import { LabReportsCard } from "@/components/LabReportsCard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const LabTests = () => {
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
            <h1 className="text-3xl font-bold">🧪 Lab Reports & Tests</h1>
            <p className="text-muted-foreground mt-1">
              View your test results and medical reports
            </p>
          </div>
        </div>

        {/* Lab Reports Card */}
        <div className="mb-8">
          <LabReportsCard />
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Understanding Test Status */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Test Status Guide</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-lg">⏳</span>
                <div>
                  <h3 className="font-medium text-sm">Pending</h3>
                  <p className="text-xs text-muted-foreground">
                    Test scheduled or waiting to start
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">🔄</span>
                <div>
                  <h3 className="font-medium text-sm">In Progress</h3>
                  <p className="text-xs text-muted-foreground">
                    Sample processing in laboratory
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-lg">✅</span>
                <div>
                  <h3 className="font-medium text-sm">Completed</h3>
                  <p className="text-xs text-muted-foreground">
                    Results ready, you can download the report
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lab Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Lab Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Lab Location</label>
                <p className="font-medium">First Floor, Building A</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Contact</label>
                <p className="font-medium">+91 9876-543-215</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Hours</label>
                <p className="font-medium">6:00 AM - 9:00 PM Daily</p>
              </div>
            </div>
          </div>

          {/* Common Tests */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Common Tests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Blood Test", code: "CBC" },
                { name: "Diabetes Test", code: "FBS" },
                { name: "Liver Function", code: "LFT" },
                { name: "Kidney Function", code: "RFT" },
                { name: "Thyroid Test", code: "TSH" },
                { name: "Lipid Profile", code: "LDP" },
              ].map((test) => (
                <div
                  key={test.code}
                  className="p-3 rounded-lg border border-border/50 bg-background/50"
                >
                  <p className="font-medium text-sm">{test.name}</p>
                  <p className="text-xs text-muted-foreground">{test.code}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Report Instructions */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">How to Download Reports</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">1</span>
                <span className="text-sm">
                  Scroll to completed tests in the list above
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">2</span>
                <span className="text-sm">
                  Click the &quot;Download&quot; button next to the test
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">3</span>
                <span className="text-sm">
                  PDF will open in your browser
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-6">4</span>
                <span className="text-sm">
                  Save or print for your records
                </span>
              </li>
            </ol>
          </div>

          {/* Important Notes */}
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-yellow-900 dark:text-yellow-100">
              Important Notes
            </h2>
            <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
              <li>
                • Keep your reports safe. You may need them for future treatment
              </li>
              <li>
                • Consult your doctor to understand test results
              </li>
              <li>
                • Do not self-diagnose based on reports
              </li>
              <li>
                • Reports are valid for medical purposes as per hospital policy
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LabTests;
