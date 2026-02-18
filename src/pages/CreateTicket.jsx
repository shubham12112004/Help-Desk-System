import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { categoriesByType, departmentLabels } from "@/lib/ticketConfig";
import { toast } from "sonner";
import { ImagePlus, Send, X, Sparkles, Loader2 } from "lucide-react";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { FileUpload } from "@/components/FileUpload";
import { AIPriorityBadge, AIDepartmentSuggestion } from "@/components/AIComponents";
import { detectTicketPriority, suggestDepartment } from "@/services/openai";
import { uploadFile, saveAttachmentMetadata } from "@/services/storage";

const CLINICAL_DEPARTMENTS = [
  "emergency",
  "icu",
  "surgery",
  "nursing",
  "radiology",
  "pharmacy",
  "laboratory",
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const ticketTypes = [
  { value: "it-support", label: "IT Support" },
  { value: "patient-support", label: "Patient Support" },
  { value: "internal-operations", label: "Internal Operations" },
];

const categoryOptions = {
  network: "Network Issue",
  hardware: "Hardware Issue",
  software: "Software Issue",
  "emr-access": "EMR Access",
  complaint: "Patient Complaint",
  billing: "Billing Issue",
  appointment: "Appointment Issue",
  feedback: "Patient Feedback",
  maintenance: "Maintenance Request",
  equipment: "Equipment Issue",
  housekeeping: "Housekeeping",
  "pharmacy-ops": "Pharmacy Operations",
  general: "General",
  technical: "Technical",
};

const departments = Object.entries(departmentLabels).map(([value, label]) => ({
  value,
  label,
}));

const CreateTicket = () => {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const { user } = useAuth();
  const [userDepartment, setUserDepartment] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [files, setFiles] = useState([]);
  const [aiPriority, setAiPriority] = useState(null);
  const [aiDepartment, setAiDepartment] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    type: "it-support",
    category: "software",
    department: "administration",
    patient_mrn: "",
    patient_name: "",
  });

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("department")
        .eq("user_id", user.id)
        .single();

      setUserDepartment(data?.department ?? null);
    };

    fetchDepartment();
  }, [user]);

  useEffect(() => {
    if (!attachment) {
      setAttachmentPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(attachment);
    setAttachmentPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [attachment]);

  // AI Analysis - trigger when title and description are filled
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (form.title && form.description && form.description.length > 20 && aiEnabled) {
        analyzeWithAI();
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [form.title, form.description, aiEnabled]);

  const analyzeWithAI = async () => {
    try {
      setLoadingAI(true);
      
      // Run AI analysis in parallel
      const [priority, department] = await Promise.all([
        detectTicketPriority(form.title, form.description, form.category),
        suggestDepartment(form.title, form.description, form.category),
      ]);

      setAiPriority(priority);
      setAiDepartment(department);
    } catch (error) {
      console.error('AI analysis error:', error);
      // Don't show error to user - AI is optional
    } finally {
      setLoadingAI(false);
    }
  };

  const acceptAIPriority = () => {
    if (aiPriority) {
      setForm(f => ({ ...f, priority: aiPriority }));
      toast.success('AI priority applied');
    }
  };

  const acceptAIDepartment = () => {
    if (aiDepartment) {
      setForm(f => ({ ...f, department: aiDepartment }));
      toast.success('AI department suggestion applied');
    }
  };

  const canAccessPatientData = userDepartment
    ? CLINICAL_DEPARTMENTS.includes(userDepartment)
    : false;

  const filteredTicketTypes = canAccessPatientData
    ? ticketTypes
    : ticketTypes.filter((t) => t.value !== "patient-support");

  const availableCategories = categoriesByType[form.type] || [];

  const handleTypeChange = (type) => {
    const firstCategory = categoriesByType[type]?.[0] || "general";
    setForm((f) => ({ ...f, type, category: firstCategory }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Use the comprehensive tickets service
      await createTicket.mutateAsync({
        ticketData: {
          title: form.title,
          description: form.description,
          priority: form.priority,
          category: form.category,
          department: form.department,
        },
        files: files
      });

      toast.success("Ticket created successfully!");
      navigate("/tickets");
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error(error.message || 'Failed to create ticket');
    }
  };

  const inputClassName =
    "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all";

  const inputWithMicClassName =
    "w-full rounded-lg border border-input bg-card px-4 py-2.5 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all";

  const labelClassName = "block text-sm font-medium text-foreground mb-1.5";

  const appendTranscript = (currentValue, transcript) => {
    if (!transcript) return currentValue;
    return currentValue ? `${currentValue} ${transcript}` : transcript;
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAttachment(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setAttachment(file);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Create New Ticket
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit a new hospital support request
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in"
        >
          {/* Title */}
          <div>
            <label className={labelClassName}>
              Subject <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Brief description of your issue"
                className={inputWithMicClassName}
                maxLength={200}
                required
              />
              <SpeechMicButton
                ariaLabel="Dictate ticket subject"
                onTranscript={(transcript) =>
                  setForm((f) => ({
                    ...f,
                    title: appendTranscript(f.title, transcript),
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          {/* Type & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>Ticket Type</label>
              <select
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className={inputClassName}
              >
                {filteredTicketTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClassName}>Department</label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    department: e.target.value,
                  }))
                }
                className={inputClassName}
              >
                {departments.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
                className={inputClassName}
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {categoryOptions[c] || c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClassName}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    priority: e.target.value,
                  }))
                }
                className={inputClassName}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Suggestions */}
          {loadingAI && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI analyzing your ticket...</span>
            </div>
          )}

          {aiPriority && aiPriority !== form.priority && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <AIPriorityBadge priority={aiPriority} />
                <button
                  type="button"
                  onClick={acceptAIPriority}
                  className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Use AI Priority
                </button>
              </div>
            </div>
          )}

          {aiDepartment && aiDepartment !== form.department && (
            <AIDepartmentSuggestion
              department={aiDepartment}
              onAccept={acceptAIDepartment}
            />
          )}

          {/* Patient Info */}
          {form.type === "patient-support" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Patient MRN</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.patient_mrn}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, patient_mrn: e.target.value }))
                    }
                    placeholder="Enter patient MRN"
                    className={inputWithMicClassName}
                  />
                  <SpeechMicButton
                    ariaLabel="Dictate patient MRN"
                    onTranscript={(transcript) =>
                      setForm((f) => ({
                        ...f,
                        patient_mrn: appendTranscript(f.patient_mrn, transcript),
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Patient Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.patient_name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, patient_name: e.target.value }))
                    }
                    placeholder="Enter patient name"
                    className={inputWithMicClassName}
                  />
                  <SpeechMicButton
                    ariaLabel="Dictate patient name"
                    onTranscript={(transcript) =>
                      setForm((f) => ({
                        ...f,
                        patient_name: appendTranscript(
                          f.patient_name,
                          transcript
                        ),
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo attachment */}
          <div>
            <label className={labelClassName}>Attachments (optional)</label>
            <FileUpload
              onFilesSelected={setFiles}
              maxFiles={5}
              maxSizeMB={10}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClassName}>
              Description <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Explain your issue in detail"
                className={`${inputWithMicClassName} min-h-[120px] resize-y`}
                rows={5}
                required
              />
              <SpeechMicButton
                ariaLabel="Dictate ticket description"
                onTranscript={(transcript) =>
                  setForm((f) => ({
                    ...f,
                    description: appendTranscript(f.description, transcript),
                  }))
                }
                className="absolute right-3 top-3"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createTicket.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {createTicket.isPending ? (
              "Creating..."
            ) : (
              <>
                Submit Ticket <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default CreateTicket;