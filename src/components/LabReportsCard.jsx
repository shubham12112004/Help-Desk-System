import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Beaker, Download, AlertCircle, Loader2, Calendar, FileText } from "lucide-react";
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

  const handleDownload = (reportUrl, testName) => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
      toast.success(`Opening ${testName} report...`);
    } else {
      toast.error('Report file not available');
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
                    <span className="text-lg">{getStatusIcon(report.status)}</span>
                    <h4 className="font-semibold text-foreground">
                      {report.test_name}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {report.test_type}
                  </p>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status.replace('-', ' ')}
                </Badge>
              </div>

              {/* Test & Result Dates */}
              <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Test Date
                  </p>
                  <p className="text-sm font-medium">
                    {formatDate(report.test_date)}
                  </p>
                </div>
                {report.result_date && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Result Date
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(report.result_date)}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {report.status === 'pending' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded mb-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    Your test is pending. Results will be available soon.
                  </p>
                </div>
              )}

              {report.status === 'in-progress' && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded mb-3">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    Your test is being processed. Please wait for results.
                  </p>
                </div>
              )}

              {/* Download Button */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleDownload(report.report_file_url, report.test_name)}
                  disabled={report.status !== 'completed' || !report.report_file_url}
                >
                  <Download className="h-4 w-4" />
                  {report.status === 'completed' ? 'Download Report' : 'Waiting for Results'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View
                </Button>
              </div>
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
