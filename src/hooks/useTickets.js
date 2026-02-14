import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTickets() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          requester:profiles!tickets_requester_id_fkey(full_name),
          assignee:profiles!tickets_assignee_id_fkey(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: ticketStats } = useQuery({
    queryKey: ["ticket-stats", tickets.length],
    queryFn: async () => {
      const open = tickets.filter((t) => t.status === "open").length;
      const inProgress = tickets.filter((t) => t.status === "in-progress")
        .length;
      const resolved = tickets.filter((t) => t.status === "resolved").length;
      const closed = tickets.filter((t) => t.status === "closed").length;

      return { open, inProgress, resolved, closed, total: tickets.length };
    },
    enabled: !!user,
  });

  const stats = ticketStats ?? {
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    total: 0,
  };

  const createTicket = useMutation({
    mutationFn: async (ticketData) => {
      const { data: ticket, error } = await supabase
        .from("tickets")
        .insert({
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority,
          type: ticketData.type,
          category: ticketData.category,
          department: ticketData.department,
          patient_mrn: ticketData.patient_mrn || null,
          patient_name: ticketData.patient_name || null,
          requester_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("ticket_messages").insert({
        ticket_id: ticket.id,
        sender_id: user?.id,
        content: ticketData.description,
        is_agent: false,
      });

      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const addMessage = useMutation({
    mutationFn: async ({ ticketId, content, isAgent }) => {
      const { error } = await supabase.from("ticket_messages").insert({
        ticket_id: ticketId,
        sender_id: user?.id,
        content,
        is_agent: isAgent,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-detail", ticketId] });
    },
  });

  return {
    tickets,
    stats,
    isLoading,
    createTicket,
    updateTicketStatus,
    addMessage,
  };
}

export function useTicketDetail(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ticket-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          requester:profiles!tickets_requester_id_fkey(full_name),
          assignee:profiles!tickets_assignee_id_fkey(full_name),
          ticket_messages(
            *,
            sender:profiles!ticket_messages_sender_id_fkey(full_name)
          )
        `
        )
        .eq("id", id)
        .order("created_at", {
          referencedTable: "ticket_messages",
          ascending: true,
        })
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}