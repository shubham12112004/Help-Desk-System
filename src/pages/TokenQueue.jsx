import { AppLayout } from "@/components/AppLayout";
import { TokenQueueSystem } from "@/components/TokenQueueSystem";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TokenQueue = () => {
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
            <h1 className="text-3xl font-bold">🎟️ OPD Token Queue</h1>
            <p className="text-muted-foreground mt-1">
              Manage your outpatient department tokens
            </p>
          </div>
        </div>

        {/* Token Queue System */}
        <div className="mb-8">
          <TokenQueueSystem />
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How Token System Works */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">How It Works</h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="font-bold text-primary bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <h3 className="font-medium text-sm">Select Department</h3>
                  <p className="text-xs text-muted-foreground">
                    Choose the OPD department you want to visit
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <h3 className="font-medium text-sm">Get Token</h3>
                  <p className="text-xs text-muted-foreground">
                    Click &quot;Get Token&quot; to join the queue
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <h3 className="font-medium text-sm">Track Status</h3>
                  <p className="text-xs text-muted-foreground">
                    See your token number and estimated wait time
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  4
                </span>
                <div>
                  <h3 className="font-medium text-sm">Visit OPD</h3>
                  <p className="text-xs text-muted-foreground">
                    Come when your token is about to be called
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* OPD Departments */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Available Departments</h2>
            <div className="space-y-2">
              {[
                { name: "General Medicine", max: 30 },
                { name: "Cardiology", max: 20 },
                { name: "Neurology", max: 15 },
                { name: "Orthopedics", max: 25 },
                { name: "Pediatrics", max: 20 },
                { name: "Dermatology", max: 15 },
                { name: "Psychiatry", max: 10 },
              ].map((dept, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-2.5 rounded-lg border border-border/50 bg-background/50 text-sm"
                >
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Max {dept.max} tokens
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Token Status Explained */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Understanding Your Token</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Your Token</p>
                <p className="text-lg font-bold text-primary">#42</p>
                <p className="text-xs mt-1">Your current token number</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Current Token</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  #40
                </p>
                <p className="text-xs mt-1">Being called now</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Wait Time</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ~10 min
                </p>
                <p className="text-xs mt-1">Estimated wait</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground mb-1">Queue</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  42/50
                </p>
                <p className="text-xs mt-1">Tokens issued</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
              Token Tips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                  ✓ Do&apos;s
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Come before your token is called</li>
                  <li>• Keep your token number safe</li>
                  <li>• Check estimated wait time</li>
                  <li>• Bring all required documents</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                  ✗ Don&apos;ts
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Don&apos;t miss your token number</li>
                  <li>• Don&apos;t get more than one token</li>
                  <li>• Don&apos;t share your token</li>
                  <li>• Don&apos;t waste hospital time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-primary">
                  Q: What if I miss my token?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: You can get a replacement token at the OPD counter. There may be a small charge for replacement.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-primary">
                  Q: Can I get a token for someone else?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: No, each person must get their own token from their account for identification purposes.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-primary">
                  Q: What is the maximum wait time?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: Average wait time is 15-20 minutes per patient. Peak hours may have longer waits.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-primary">
                  Q: Can I get a token online and visit later?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: Tokens are valid for the current day only. You must visit on the same day you get your token.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-primary">
                  Q: What documents should I bring?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A: Bring your ID (Aadhar/PAN), health card, previous medical records, and list of current medications.
                </p>
              </div>
            </div>
          </div>

          {/* OPD Hours */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">OPD Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-background/50">
                <p className="text-sm text-muted-foreground">Weekdays</p>
                <p className="font-bold text-lg mt-2">8:00 AM - 5:00 PM</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Monday to Friday
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-background/50">
                <p className="text-sm text-muted-foreground">Saturday</p>
                <p className="font-bold text-lg mt-2">8:00 AM - 2:00 PM</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Limited services available
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-background/50 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Closed
                </p>
                <p className="font-bold text-lg mt-2 text-red-700 dark:text-red-300">
                  Sundays & Holidays
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Emergency only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TokenQueue;
