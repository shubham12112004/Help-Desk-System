import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { categoriesByType, departmentLabels } from "@/lib/ticketConfig";
import { toast } from "sonner";
import { Send } from "lucide-react";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTicket.mutate(
      {
        title: form.title,
        description: form.description,
        priority: form.priority,
        type: form.type,
        category: form.category,
        department: form.department,
        patient_mrn: form.patient_mrn || undefined,
        patient_name: form.patient_name || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Ticket created successfully");
          navigate("/tickets");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const inputClassName =
    "w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all";

  const labelClassName = "block text-sm font-medium text-foreground mb-1.5";

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
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Brief description of your issue"
              className={inputClassName}
              maxLength={200}
              required
            />
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

          {/* Patient Info */}
          {form.type === "patient-support" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Patient MRN</label>
                <input
                  type="text"
                  value={form.patient_mrn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patient_mrn: e.target.value }))
                  }
                  placeholder="Enter patient MRN"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Patient Name</label>
                <input
                  type="text"
                  value={form.patient_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, patient_name: e.target.value }))
                  }
                  placeholder="Enter patient name"
                  className={inputClassName}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className={labelClassName}>
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Explain your issue in detail"
              className={inputClassName}
              rows={5}
              required
            />
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