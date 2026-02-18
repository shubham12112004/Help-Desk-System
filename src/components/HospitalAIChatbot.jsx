import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
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
      // Send message to backend
      const { data: savedMsg } = await sendMessage(currentChatId, "user", userMessage);
      
      // Generate AI response (simplified - in production, you'd call OpenAI API)
      const aiResponse = generateAIResponse(userMessage);
      
      // Add AI message
      const { data: aiMsg } = await sendMessage(currentChatId, "assistant", aiResponse);
      
      if (aiMsg) {
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
    setLoading(false);
  };

  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Staff-specific responses
    if (isStaff) {
      if (input.includes('patient') || input.includes('view patient')) {
        return "You can view all patient records from the Admin Dashboard. Use the patient management section to search by name, ID, or admission date. Would you like help with a specific patient?";
      }
      
      if (input.includes('appointment') || input.includes('schedule') || input.includes('manage')) {
        return "To manage appointments:\n• View today's appointments from the Admin Dashboard\n• Approve/reschedule patient requests\n• Check doctor availability\n• Update appointment status\n\nWhich action would you like to perform?";
      }
      
      if (input.includes('inventory') || input.includes('stock') || input.includes('medicine')) {
        return "Inventory management:\n• Check current medicine stock levels\n• View low-stock alerts\n• Update inventory records\n• Generate reorder reports\n\nNavigate to the Inventory section for detailed information.";
      }
      
      if (input.includes('report') || input.includes('analytics') || input.includes('stats')) {
        return "Available reports:\n• Patient admission statistics\n• Department-wise appointments\n• Billing and revenue reports\n• Bed occupancy rates\n• Medicine usage analytics\n\nWhich report would you like to generate?";
      }
      
      if (input.includes('ticket') || input.includes('complaint')) {
        return "You can manage all help desk tickets from the Tickets section. Filter by status, priority, or department to view and respond to patient queries.";
      }
      
      // Default staff response
      return "I can assist you with:\n• Patient management\n• Appointment scheduling\n• Inventory tracking\n• Reports and analytics\n• Ticket management\n\nWhat would you like help with?";
    }
    
    // Patient-specific responses
    if (input.includes('appointment') || input.includes('book')) {
      return "I can help you book an appointment! Please visit the Appointments section from your dashboard or tell me which department you'd like to see (e.g., Cardiology, Neurology).";
    }
    
    if (input.includes('token') || input.includes('opd') || input.includes('queue')) {
      return "You can check your OPD token status in the Token Queue section on your dashboard. Would you like me to create a new token for you? If yes, please specify the department.";
    }
    
    if (input.includes('medicine') || input.includes('pharmacy') || input.includes('prescription')) {
      return "For medicine requests, please check the Medicine & Pharmacy section on your dashboard. You can request medicine delivery or pickup based on your active prescriptions.";
    }
    
    if (input.includes('emergency') || input.includes('urgent') || input.includes('ambulance')) {
      return "🚨 For emergencies, please:\n1. Call 108 immediately\n2. Or use the Ambulance Request feature on your dashboard\n3. Visit the Emergency department directly\n\nIs this a medical emergency?";
    }
    
    if (input.includes('billing') || input.includes('payment') || input.includes('invoice')) {
      return "You can view your billing details and make payments from the Billing section on your dashboard. All invoices are available for download.";
    }
    
    if (input.includes('lab') || input.includes('report') || input.includes('test')) {
      return "Lab reports can be accessed from the Lab Reports section. Once your test results are ready, you'll receive a notification and can download the report.";
    }
    
    if (input.includes('room') || input.includes('bed') || input.includes('admission')) {
      return "For room and bed allocation information, please check the Room Allocation section. You can see your current room details, assigned doctor, and nurse information there.";
    }
    
    // Default patient response
    return "I'm here to help you with:\n• Booking appointments\n• OPD token queue\n• Medicine requests\n• Lab reports\n• Room allocation\n• Billing\n• Emergency assistance\n\nWhat would you like assistance with?";
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
