import { AppLayout } from "@/components/AppLayout";
import { RoomAllocationCard } from "@/components/RoomAllocationCard";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Medical = () => {
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
            <h1 className="text-3xl font-bold">🛏️ Medical Information</h1>
            <p className="text-muted-foreground mt-1">
              Room allocation and bed information
            </p>
          </div>
        </div>

        {/* Room Allocation Card */}
        <div className="mb-8">
          <RoomAllocationCard />
        </div>

        {/* Additional Medical Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Info */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Hospital Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Main Reception
                </label>
                <p className="font-medium">+91 9876-543-210</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Emergency Ward
                </label>
                <p className="font-medium">+91 9876-543-211</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Nurse Call
                </label>
                <p className="font-medium">Press call button by your bed</p>
              </div>
            </div>
          </div>

          {/* Visiting Hours */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Visiting Hours</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Morning</span>
                <span className="font-medium">10:00 AM - 12:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Evening</span>
                <span className="font-medium">4:00 PM - 6:00 PM</span>
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                Maximum 2 visitors per time slot
              </div>
            </div>
          </div>

          {/* Health Tips */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Recovery Recommendations</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm">Follow your doctor&apos;s treatment plan strictly</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm">Take prescribed medications on time</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm">Inform nurses of any pain or discomfort immediately</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm">Maintain hygiene and rest as advised</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">✓</span>
                <span className="text-sm">Wear hospital-provided gown and equipment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Medical;
