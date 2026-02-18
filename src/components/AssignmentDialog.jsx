/**
 * AssignmentDialog Component
 * Dialog for assigning tickets to staff members
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStaffMembers, assignTicket } from '@/services/tickets';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssignmentDialog({ open, onOpenChange, ticket, onAssigned }) {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userRole = user?.user_metadata?.role || 'citizen';
  const canAssign = ['admin', 'staff'].includes(userRole);

  useEffect(() => {
    if (open && canAssign) {
      loadStaff();
    }
  }, [open, canAssign]);

  useEffect(() => {
    if (ticket?.assigned_to) {
      setSelectedStaff(ticket.assigned_to);
    }
  }, [ticket]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      // Load staff from the same department if ticket has department
      const members = await getStaffMembers(ticket?.department);
      setStaff(members);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }

    try {
      setSubmitting(true);
      const updatedTicket = await assignTicket(ticket.id, selectedStaff);
      toast.success('Ticket assigned successfully');
      onAssigned?.(updatedTicket);
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (!canAssign) {
    return null;
  }

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      doctor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      staff: 'bg-green-500/10 text-green-700 dark:text-green-400',
    };
    return colors[role] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Ticket
          </DialogTitle>
          <DialogDescription>
            Assign this ticket to a staff member or doctor for handling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ticket Info */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium">{ticket?.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {ticket?.ticket_number}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Select Staff Member</Label>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserCircle className="h-12 w-12 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No staff members available
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] rounded-lg border">
                <div className="p-2 space-y-1">
                  {staff.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedStaff(member.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors',
                        'hover:bg-accent',
                        selectedStaff === member.id && 'bg-primary/10 border border-primary'
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={member.avatar_url} alt={member.full_name} />
                        <AvatarFallback>
                          {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {member.full_name}
                          </p>
                          <Badge 
                            variant="secondary" 
                            className={cn('text-xs', getRoleBadgeColor(member.role))}
                          >
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                        {member.department && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {member.department}
                          </p>
                        )}
                      </div>

                      {selectedStaff === member.id && (
                        <div className="flex-shrink-0">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedStaff || submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
