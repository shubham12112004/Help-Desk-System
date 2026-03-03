import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  createChat,
  getChats,
  getChatMessages,
  sendMessage
} from "@/services/hospital";
import { getChatbotResponse } from "@/services/chatbot";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const PATIENT_QUICK_ACTIONS = [
  { label: "Book Appointment", icon: "📅", action: "book_appointment" },
  { label: "Check Token Status", icon: "🎟️", action: "token_status" },
  { label: "Medicine Request", icon: "💊", action: "medicine_request" },
  { label: "Emergency Help", icon: "🚨", action: "emergency" },
];

const STAFF_QUICK_ACTIONS = [
  { label: "Manage Appointments", icon: "📋", action: "manage_appointments" },
  { label: "View Patients", icon: "👥", action: "view_patients" },
  { label: "Check Inventory", icon: "📦", action: "check_inventory" },
  { label: "View Reports", icon: "📊", action: "view_reports" },
];

export function HospitalAIChatbot() {
  const { user } = useAuth();
  const userRole = user?.user_metadata?.role ?? "citizen";
  const isStaff = userRole === "staff" || userRole === "admin";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);

  const QUICK_ACTIONS = isStaff ? STAFF_QUICK_ACTIONS : PATIENT_QUICK_ACTIONS;

  useEffect(() => {
    if (isOpen && user) {
      loadOrCreateChat();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadOrCreateChat = async () => {
    setLoading(true);
    try {
      // Get existing chats
      const { data: chats } = await getChats(user.id);
      
      if (chats && chats.length > 0) {
        // Use the most recent chat
        const recentChat = chats[0];
        setCurrentChatId(recentChat.id);
        
        // Load messages
        const { data: msgs } = await getChatMessages(recentChat.id);
        if (msgs) {
          setMessages(msgs);
        }
      } else {
        // Create new chat
        const { data: newChat } = await createChat(user.id, "Hospital Assistant");
        if (newChat) {
          setCurrentChatId(newChat.id);
          
          // Add welcome message
          const welcomeMsg = {
            role: "assistant",
            content: "👋 Hello! I'm your hospital assistant. How can I help you today?",
            created_at: new Date().toISOString()
          };
          setMessages([welcomeMsg]);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    }
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    const userMessage = input;
    setInput("");

    // Add user message to UI
    const tempUserMsg = {
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    setLoading(true);
    try {
      // Save user message to database
      await sendMessage(currentChatId, "user", userMessage);
      
      // Get AI response from API-based service
      const response = await getChatbotResponse(userMessage, messages);
      
      // Save AI response to database
      await sendMessage(currentChatId, "assistant", response.content);
      
      // Add AI message to UI
      const aiMsg = {
        role: "assistant",
        content: response.content,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      
      // Show notification for out-of-scope questions
      if (response.type === 'out_of_scope') {
        toast.info("I'm made for hospital assistance only", {
          description: "Let me help with hospital-related queries instead!"
        });
      }
      
      if (!response.success) {
        toast.error("Error processing response", {
          description: response.error || "Please try again"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error.message || 'Please try again later'
      });
    }
    setLoading(false);
  };

  const handleQuickAction = (action) => {
    const patientActionTexts = {
      book_appointment: "I want to book an appointment",
      token_status: "Check my token status",
      medicine_request: "I need to request medicine",
      emergency: "Emergency help needed"
    };
    
    const staffActionTexts = {
      manage_appointments: "Show me how to manage appointments",
      view_patients: "I need to view patient records",
      check_inventory: "Show me inventory status",
      view_reports: "I want to generate reports"
    };
    
    const actionTexts = isStaff ? staffActionTexts : patientActionTexts;
    setInput(actionTexts[action]);
    setTimeout(() => handleSendMessage(), 100);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 animate-bounce hover:animate-none"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <div className="flex flex-col">
            <h3 className="font-semibold">Hospital AI Assistant</h3>
            <span className="text-xs opacity-80">
              {isStaff ? "Staff Portal" : "Patient Portal"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b bg-muted/30">
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(action => (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              className="justify-start gap-2 text-xs"
              onClick={() => handleQuickAction(action.action)}
              disabled={loading}
            >
              <span>{action.icon}</span>
              <span className="truncate">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>

              {msg.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
