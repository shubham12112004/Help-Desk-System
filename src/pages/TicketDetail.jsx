import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityIndicator } from "@/components/PriorityIndicator";
import { RealtimeChat } from "@/components/RealtimeChat";
import { AssignmentDialog } from "@/components/AssignmentDialog";
import { useTickets, useTicketDetail } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getTicketComments } from "@/services/realtime";
import { getTicketAttachments, getSignedUrl } from "@/services/storage";
import {
  categoryLabels,
  statusConfig,
  departmentLabels,
  typeConfig,
} from "@/lib/ticketConfig";
import { format } from "date-fns";
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  UserCircle,
  Hospital,
  Building2,
  FileText,
  Image,
  Download,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TicketDetail = () => {
  const { id } = useParams();
  const { updateTicketStatus } = useTickets();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const userRole = user?.user_metadata?.role ?? "citizen";
  const isAgent = userRole === "admin" || userRole === "staff" || userRole === "doctor";

  const { data: ticket, isLoading, refetch } = useTicketDetail(id || "");

  // Load comments and attachments
  useEffect(() => {
    if (id) {
      loadTicketData();
    }
  }, [id]);

  const loadTicketData = async () => {
    try {
      setLoadingComments(true);
      const [commentsData, attachmentsData] = await Promise.all([
        getTicketComments(id),
        getTicketAttachments(id),
      ]);
      
      setComments(commentsData);
      setAttachments(attachmentsData);
    } catch (error) {
      console.error('Error loading ticket data:', error);
      toast.error('Failed to load ticket data');
    } finally {
      setLoadingComments(false);
    }
  };

  if (isLoading || loadingComments) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!ticket) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-muted-foreground">
            Ticket not found
          </p>
          <Link
            to="/tickets"
            className="mt-4 text-sm text-primary hover:underline"
          >
            ← Back to tickets
          </Link>
        </div>
      </AppLayout>
    );
  }

  const ticketId = `TK-${String(ticket.ticket_number).padStart(4, "0")}`;

  const handleStatusChange = (newStatus) => {
    updateTicketStatus.mutate(
      { id: ticket.id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(`Status updated to ${statusConfig[newStatus].label}`),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const signedUrl = await getSignedUrl(attachment.file_path);
      window.open(signedUrl, '_blank');
    } catch (error) {
      toast.error('Failed to download attachment');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Back button */}
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tickets
        </Link>

        {/* Ticket header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-mono text-muted-foreground">
                  {ticketId}
                </span>
                <StatusBadge status={ticket.status} />
                <PriorityIndicator priority={ticket.priority} />
                {ticket.category && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground">
                    {categoryLabels[ticket.category] || ticket.category}
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold text-card-foreground">
                {ticket.title}
              </h1>

              <p className="text-sm text-muted-foreground mt-2">
                {ticket.description}
              </p>
            </div>

            {/* Quick actions for staff */}
            {isAgent && (
              <div className="flex flex-col gap-2">
                {!ticket.assigned_to && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                )}
                {ticket.assignee && (
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Assigned to</p>
                    <p className="font-medium">{ticket.assignee.full_name}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attachments from ticket */}
          {ticket.attachment_url && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Image className="h-4 w-4 text-primary" />
                Attached photo
              </div>
              <a
                href={ticket.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-sm font-medium text-primary hover:underline"
              >
                {ticket.attachment_name || "View attachment"}
              </a>
              <img
                src={ticket.attachment_url}
                alt={ticket.attachment_name || "Ticket attachment"}
                className="mt-3 w-full max-w-md rounded-lg border border-border object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Meta info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Requester</p>
                <p className="font-medium text-foreground">
                  {ticket.requester?.full_name ?? "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium text-foreground">
                  {departmentLabels[ticket.department] || ticket.department}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">
                  {format(new Date(ticket.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium text-foreground">
                  {categoryLabels[ticket.category] || ticket.category}
                </p>
              </div>
            </div>
          </div>

          {/* Patient info */}
          {(ticket.patient_mrn || ticket.patient_name) && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <FileText className="h-4 w-4 text-primary" />
              <div className="flex items-center gap-4 text-sm">
                {ticket.patient_name && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Patient:{" "}
                    </span>
                    <span className="font-medium text-foreground">
                      {ticket.patient_name}
                    </span>
                  </div>
                )}
                {ticket.patient_mrn && (
                  <div>
                    <span className="text-xs text-muted-foreground">MRN: </span>
                    <span className="font-medium text-primary">
                      {ticket.patient_mrn}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border flex-wrap">
            <span className="text-xs text-muted-foreground mr-2">
              Update status:
            </span>

            {["open", "in-progress", "resolved", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={ticket.status === status}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  ticket.status === status
                    ? "bg-primary text-primary-foreground cursor-default"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                {statusConfig[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <Card className="shadow-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px]">
              <RealtimeChat
                ticketId={ticket.id}
                ticketTitle={ticket.title}
                ticketDescription={ticket.description}
                category={ticket.category}
                initialComments={comments}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        {attachments.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Attachments ({attachments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {attachment.file_type.startsWith('image/') ? (
                        <Image className="h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.file_size / 1024).toFixed(1)} KB • {attachment.uploader?.full_name}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadAttachment(attachment)}
                      className="flex-shrink-0 p-2 rounded-md hover:bg-muted transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignment Dialog */}
      {isAgent && (
        <AssignmentDialog
          open={showAssignDialog}
          onOpenChange={setShowAssignDialog}
          ticket={ticket}
          onAssigned={(updatedTicket) => {
            refetch();
            toast.success('Ticket assigned successfully');
          }}
        />
      )}
    </AppLayout>
  );
};

export default TicketDetail;