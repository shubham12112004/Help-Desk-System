import { AppLayout } from "@/components/AppLayout";
import { AppointmentsCard } from "@/components/AppointmentsCard";
import { ArrowLeft, Clock, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const HospitalAppointments = () => {
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
            <h1 className="text-3xl font-bold">📅 Doctor Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage your doctor appointments
            </p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className="mb-8">
          <AppointmentsCard />
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departments */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Our Departments</h2>
            <div className="space-y-3">
              {[
                { name: "General Medicine", doctor: "Dr. Rajesh Singh" },
                { name: "Cardiology", doctor: "Dr. Priya Sharma" },
                { name: "Neurology", doctor: "Dr. Vikram Kumar" },
                { name: "Orthopedics", doctor: "Dr. Anjali Patel" },
              ].map((dept, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50 bg-background/50">
                  <p className="font-medium text-sm">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{dept.doctor}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Tips */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Appointment Tips</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-sm">Come 10 minutes early</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-sm">Carry your ID and insurance card</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-sm">Bring medical history documents</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-sm">List of current medications</span>
              </li>
            </ul>
          </div>

          {/* Department Contact Info */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Department Contacts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">General Medicine</p>
                <p className="font-medium text-sm mt-1">+91-9876-543-201</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Cardiology</p>
                <p className="font-medium text-sm mt-1">+91-9876-543-202</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Neurology</p>
                <p className="font-medium text-sm mt-1">+91-9876-543-203</p>
              </div>
              <div className="p-3 rounded-lg border border-border/50 bg-background/50">
                <p className="text-xs text-muted-foreground">Orthopedics</p>
                <p className="font-medium text-sm mt-1">+91-9876-543-204</p>
              </div>
            </div>
          </div>

          {/* Appointment Process */}
          <div className="rounded-lg border border-border bg-card p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">How to Book an Appointment</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Select Department</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the medical specialty you need
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Pick Date</h3>
                  <p className="text-sm text-muted-foreground">
                    Select from available dates (minimum next day)
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Choose Time Slot</h3>
                  <p className="text-sm text-muted-foreground">
                    Pick from available morning or evening slots
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Add Reason (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Briefly describe your health concern for the doctor
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="font-medium">Confirm Booking</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive confirmation and appointment details
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation & Rescheduling */}
          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
              Cancellation & Rescheduling
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                  ✓ Allowed
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Cancel up to 2 hours before</li>
                  <li>• Reschedule anytime</li>
                  <li>• No cancellation fee</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                  ✗ Not Allowed
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Cancel within 2 hours</li>
                  <li>• No-show without notice</li>
                  <li>• Frequent cancellations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default HospitalAppointments;
