import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Beaker, Clock, AlertCircle, Loader2, Calendar, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getLabReports } from "@/services/hospital";
import { toast } from "sonner";

export function LabReportsCard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLabReports();
    }
  }, [user]);

  const loadLabReports = async () => {
    setLoading(true);
    try {
      const { data } = await getLabReports(user.id);
      if (data) {
        setReports(data);
      }
    } catch (error) {
      console.error('Error loading lab reports:', error);
      toast.error('Failed to load lab reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      'in-progress': '🔄',
      completed: '✅'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const downloadReport = (report) => {
    try {
      // Generate sample data if no actual data exists
      let resultsText = report.result;
      
      if (!resultsText || resultsText.trim() === '') {
        // Generate sample lab results
        resultsText = `
SAMPLE LAB RESULTS (For demonstration purposes)
        
Blood Test Panel:
- Hemoglobin: 14.2 g/dL (Normal: 13-17 g/dL)
- White Blood Cells: 7,500 cells/mcL (Normal: 4,500-11,000 cells/mcL)
- Platelets: 250,000 cells/mcL (Normal: 150,000-450,000 cells/mcL)
- Red Blood Cells: 5.2 million cells/mcL (Normal: 4.5-6.0 million cells/mcL)

Chemistry Panel:
- Glucose: 95 mg/dL (Normal: 70-100 mg/dL)
- Creatinine: 0.9 mg/dL (Normal: 0.6-1.2 mg/dL)
- Total Cholesterol: 180 mg/dL (Desirable: <200 mg/dL)
- HDL Cholesterol: 55 mg/dL (Good: >40 mg/dL)
- LDL Cholesterol: 110 mg/dL (Optimal: <100 mg/dL)

INTERPRETATION:
All values are within normal ranges. No immediate concerns identified.
Continue with current health regimen and follow up as scheduled.

Note: This is sample data for demonstration purposes.
Actual results will be provided by your healthcare provider.`;
      }
      
      // Create report content
      const reportContent = `
========================================
       LAB REPORT - MEDDESK HOSPITAL
========================================

Patient ID: ${user.id}
Report Date: ${formatDate(report.created_at)}
Test Name: ${report.test_name}
Status: ${report.report_status.toUpperCase()}

----------------------------------------
TEST RESULTS
----------------------------------------

${resultsText}

----------------------------------------
NOTES
----------------------------------------

This is an official lab report from MedDesk Hospital.
For questions or concerns, please contact your healthcare provider.

Report Generated: ${new Date().toLocaleString()}

========================================
      END OF REPORT
========================================
      `;

      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lab_Report_${report.test_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

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
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold">Lab Reports</h3>
        </div>
        <Badge variant="secondary">{reports.length}</Badge>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Beaker className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-1">No Lab Tests</p>
          <p className="text-sm">
            Your lab reports will appear here once tests are ordered
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStatusIcon(report.report_status)}</span>
                    <h4 className="font-semibold text-foreground">
                      {report.test_name}
                    </h4>
                  </div>
                  {report.result && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {report.result.substring(0, 80)}...
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(report.report_status)}>
                  {report.report_status.replace('-', ' ')}
                </Badge>
              </div>

              {/* Test Date & Status */}
              <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Ordered Date
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(report.created_at)}
                  </p>
                  {report.report_status === 'completed' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Results ready
                    </p>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {report.report_status === 'pending' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded mb-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    Your test is pending. Results will be available soon.
                  </p>
                </div>
              )}

              {report.report_status === 'in-progress' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded mb-3">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Your test is being processed. Please wait for results.
                  </p>
                </div>
              )}

              {/* View Result Button */}
              {report.report_status === 'completed' && report.result && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      toast.info(
                        <div className="space-y-2">
                          <p className="font-semibold">{report.test_name}</p>
                          <p className="text-sm whitespace-pre-wrap">{report.result}</p>
                        </div>,
                        { duration: 8000 }
                      );
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
              {report.report_status !== 'completed' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    disabled
                  >
                    <Clock className="h-4 w-4" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="h-4 w-4" />
                    Download Sample
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-muted-foreground">
          💡 <span className="font-medium">Tip:</span> Completed reports can be downloaded and shared with other healthcare providers.
        </p>
      </div>

      <Button variant="outline" className="w-full mt-4" onClick={loadLabReports}>
        Refresh Reports
      </Button>
    </Card>
  );
}
