import { AppLayout } from "@/components/AppLayout";
import PatientMonitoringPanel from "@/components/PatientMonitoringPanel";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PatientMonitoring = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold">🏥 Patient Monitoring</h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of admitted patients and critical cases
            </p>
          </div>
        </div>

        {/* Patient Monitoring Panel */}
        <PatientMonitoringPanel />
      </div>
    </AppLayout>
  );
};

export default PatientMonitoring;
