import { AppLayout } from "@/components/AppLayout";
import { AmbulanceCard } from "@/components/AmbulanceCard";
import { ArrowLeft, AlertTriangle, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Emergency = () => {
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
            <h1 className="text-3xl font-bold">🚑 Emergency & Ambulance</h1>
            <p className="text-muted-foreground mt-1">
              Request emergency ambulance services
            </p>
          </div>
        </div>

        {/* Emergency Alert */}
        <div className="mb-6 p-4 rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-950 flex gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-900 dark:text-red-100">
              EMERGENCY?
            </p>
            <p className="text-red-800 dark:text-red-200">
              For life-threatening emergencies, call
              <span className="font-bold text-lg ml-2">911</span>
              immediately
            </p>
          </div>
        </div>

        {/* Ambulance Card */}
        <div className="mb-8">
          <AmbulanceCard />
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency Types */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Emergency Types</h2>
            <div className="space-y-2">
              {[
                "🚗 Accident",
                "❤️ Chest Pain",
                "😤 Difficulty Breathing",
                "🧠 Stroke Symptoms",
                "🩸 Severe Bleeding",
                "😴 Unconscious",
                "⚠️ Severe Injury",
              ].map((type, i) => (
                <div
                  key={i}
                  className="p-2 rounded text-sm border border-border/50 bg-background/50"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          {/* Ambulance Fleet */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Our Fleet</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm">🚑 Basic Ambulance</h3>
                <p className="text-xs text-muted-foreground">
                  Transport with First Aid. Response: 8-10 min
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm">🏥 ALS Ambulance</h3>
                <p className="text-xs text-muted-foreground">
                  Advanced Life Support equipment. Response: 5-7 min
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm">🛸 Air Ambulance</h3>
                <p className="text-xs text-muted-foreground">
                  Critical cases only. By request (premium service)
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-100">
              Emergency Numbers
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    National Emergency
                  </p>
                  <p className="font-bold text-red-900 dark:text-red-100">911</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Hospital Ambulance
                  </p>
                  <p className="font-bold text-red-900 dark:text-red-100">
                    +91 9876-543-190
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Hospital Main
                  </p>
                  <p className="font-bold text-red-900 dark:text-red-100">
                    +91 9876-543-210
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Measures */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Safety Measures</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-green-600">✓</span>
                <span>Trained paramedics on every ambulance</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600">✓</span>
                <span>GPS tracking available</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600">✓</span>
                <span>Real-time driver information</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-600">✓</span>
                <span>Direct hospital communication</span>
              </li>
            </ul>
          </div>

          {/* What to do in Emergency */}
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-yellow-900 dark:text-yellow-100">
              What to Do in Emergency
            </h2>
            <ol className="space-y-3 text-sm text-yellow-800 dark:text-yellow-200">
              <li className="flex gap-3">
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  1
                </span>
                <span>Call 911 immediately for life-threatening situations</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  2
                </span>
                <span>Provide accurate location and describe the emergency</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  3
                </span>
                <span>Keep the patient calm and still</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  4
                </span>
                <span>Follow paramedic instructions upon arrival</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-yellow-900 dark:text-yellow-100">
                  5
                </span>
                <span>
                  Inform hospital staff about any allergies or medications
                </span>
              </li>
            </ol>
          </div>

          {/* Ambulance Request Tips */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
              How to Request an Ambulance
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold flex-shrink-0 text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Select Emergency Type
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Choose from the list matching your emergency
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold flex-shrink-0 text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Enter Your Location
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Provide accurate address for quick dispatch
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold flex-shrink-0 text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Provide Contact Number
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Use a number we can reach you on
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold flex-shrink-0 text-sm">
                  4
                </div>
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    Confirm Request
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    Ambulance will be dispatched to your location
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Emergency;
