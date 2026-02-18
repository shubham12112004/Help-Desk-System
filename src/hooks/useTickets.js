import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { 
  getTickets, 
  getTicketById, 
  updateTicketStatus as updateStatus,
  assignTicket as assignTicketService,
  getTicketStats as fetchTicketStats,
  createTicket as createTicketService
} from "@/services/tickets";

export function useTickets(filters = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => getTickets(filters),
    enabled: !!user,
  });

  const { data: ticketStats } = useQuery({
    queryKey: ["ticket-stats"],
    queryFn: fetchTicketStats,
    enabled: !!user,
  });

  const stats = ticketStats ?? {
    total: 0,
    open: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    high_priority: 0,
  };

  const createTicket = useMutation({
    mutationFn: ({ ticketData, files }) => createTicketService(ticketData, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: ({ id, status }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
    },
  });

  const assignTicket = useMutation({
    mutationFn: ({ ticketId, staffId }) => assignTicketService(ticketId, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  return {
    tickets,
    isLoading,
    stats,
    refetch,
    createTicket,
    updateTicketStatus,
    assignTicket,
  };
}

export function useTicketDetail(ticketId) {
  const { data: ticket, isLoading, refetch } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: !!ticketId,
  });

  return { data: ticket, isLoading, refetch };
}