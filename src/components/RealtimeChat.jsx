/**
 * RealtimeChat Component
 * Chat interface with realtime updates for ticket communication
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Paperclip, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { subscribeToTicketComments, postComment } from '@/services/realtime';
import { generateReplySuggestions } from '@/services/openai';
import { AISuggestions } from './AIComponents';
import { useAuth } from '@/hooks/useAuth';

export function RealtimeChat({ ticketId, ticketTitle, ticketDescription, category, initialComments = [] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAI, setShowAI] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const userRole = user?.user_metadata?.role || 'citizen';
  const isStaff = ['staff', 'doctor', 'admin'].includes(userRole);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Subscribe to realtime comments
  useEffect(() => {
    const subscription = subscribeToTicketComments(ticketId, (newComment) => {
      setComments(prev => {
        // Avoid duplicates
        if (prev.find(c => c.id === newComment.id)) {
          return prev;
        }
        return [...prev, newComment];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [ticketId]);

  // Load AI suggestions for staff
  useEffect(() => {
    if (isStaff && comments.length > 0 && showAI) {
      loadAISuggestions();
    }
  }, [comments.length, isStaff]);

  const loadAISuggestions = async () => {
    try {
      setLoadingAI(true);
      const conversationHistory = comments.map(c => ({
        isAgent: ['staff', 'doctor', 'admin'].includes(c.user?.role),
        content: c.content,
      }));
      
      const suggestions = await generateReplySuggestions(
        ticketTitle,
        ticketDescription,
        category,
        conversationHistory
      );
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      // Don't show error to user, AI is optional
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await postComment(ticketId, user.id, message.trim(), false);
      setMessage('');
      toast.success('Message sent');
      
      // Refresh AI suggestions after sending
      if (isStaff) {
        setTimeout(loadAISuggestions, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const useSuggestion = (suggestion) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      doctor: 'bg-purple-100 text-purple-800',
      citizen: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.citizen;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-t-lg">
        {comments.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          comments.map((comment, index) => {
            const isOwn = comment.user_id === user?.id;
            const isStaffMessage = ['staff', 'doctor', 'admin'].includes(comment.user?.role);

            return (
              <div
                key={comment.id || index}
                className={cn(
                  'flex gap-3',
                  isOwn ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback className={cn('text-xs', getRoleBadgeColor(comment.user?.role))}>
                    {getInitials(comment.user?.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className={cn('flex flex-col max-w-[70%]', isOwn ? 'items-end' : 'items-start')}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {comment.user?.full_name}
                    </span>
                    <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getRoleBadgeColor(comment.user?.role))}>
                      {comment.user?.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(comment.created_at), 'HH:mm')}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : isStaffMessage
                        ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                        : 'bg-card border border-border'
                    )}
                  >
                    {comment.content}
                  </div>

                  {comment.is_internal && (
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      Internal Note
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions for staff */}
      {isStaff && showAI && aiSuggestions.length > 0 && (
        <div className="p-3 border-t border-border">
          <AISuggestions
            suggestions={aiSuggestions}
            loading={loadingAI}
            type="reply"
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => useSuggestion(suggestion)}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Use suggestion {index + 1}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card rounded-b-lg">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <div className="flex flex-col gap-2">
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default RealtimeChat;
