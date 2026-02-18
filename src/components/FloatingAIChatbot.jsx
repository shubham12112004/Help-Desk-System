import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Plus,
  Brain,
  ArrowRight,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const FloatingAIChatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "0",
      role: "assistant",
      content:
        "👋 Hello! I'm your AI support assistant. I can help you:\n• Create support tickets\n• Suggest the right department\n• Answer common questions\n• Guide you through the help desk\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Sample suggestions
  const suggestions = [
    { icon: AlertCircle, text: "Report an Issue", action: "report" },
    { icon: Brain, text: "Get Department Help", action: "department" },
    { icon: Lightbulb, text: "Common Questions", action: "faq" },
  ];

  // Department and priority suggestions
  const departments = [
    { name: "Cardiology", emoji: "❤️" },
    { name: "Orthopedics", emoji: "🦴" },
    { name: "Pediatrics", emoji: "👶" },
    { name: "Emergency", emoji: "🚨" },
    { name: "General", emoji: "🏥" },
  ];

  const priorities = [
    { name: "Low", color: "text-blue-500" },
    { name: "Medium", color: "text-yellow-500" },
    { name: "High", color: "text-orange-500" },
    { name: "Urgent", color: "text-red-500" },
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSuggestionClick = (action) => {
    let response = "";
    switch (action) {
      case "report":
        response = `Great! I can help you create a support ticket. To get started, please tell me:
1. **Department**: Which service do you need? (${departments.map((d) => d.name).join(", ")})
2. **Priority**: How urgent is this? (Low, Medium, High, Urgent)
3. **Description**: What's the issue?

Or would you like me to take you to the create ticket form?`;
        break;
      case "department":
        response = `Which department would you like help with?
${departments.map((d) => `• ${d.emoji} ${d.name}`).join("\n")}

Just tell me the department name and I'll guide you!`;
        break;
      case "faq":
        response = `Here are some common questions:
• **How do I create a ticket?** - Click "Create Ticket" in the sidebar or use quick actions
• **What's the average response time?** - 2-4 hours for regular, 30 mins for urgent
• **How do I track my ticket?** - Go to "My Tickets" to see status updates
• **Can I attach files?** - Yes! You can attach documents, images, and screenshots

Got any other questions?`;
        break;
      default:
        response = "How can I help you further?";
    }

    addMessage(response, "assistant");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    addMessage(input, "user");
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "";

      // Simple intent detection
      if (input.toLowerCase().includes("create") || input.toLowerCase().includes("ticket")) {
        aiResponse = `Perfect! I can help you create a ticket. Based on your message, here's what I understand:

**What I heard:** "${input}"

To better assist you:
1. **Select a department** from the list
2. **Choose priority level** (Low, Medium, High, Urgent)
3. **Add more details** about the issue

Would you like me to take you to the ticket creation form where you can fill in all details? Or do you want to continue chatting?`;
      } else if (
        input.toLowerCase().includes("urgent") ||
        input.toLowerCase().includes("emergency")
      ) {
        aiResponse = `⚠️ I see this is marked as urgent! 

For **urgent** issues:
• Response time: **30 minutes**
• Department recommendation: Emergency or your relevant department
• Priority: **HIGH**

Would you like me to:
1. Create an urgent ticket for you?
2. Suggest the best department?
3. Provide emergency contact information?`;
      } else if (input.toLowerCase().includes("department")) {
        aiResponse = `Which department would you like to contact?

${departments.map((d) => `${d.emoji} **${d.name}** - Available`).join("\n")}

Just let me know the department name!`;
      } else if (input.toLowerCase().includes("thank")) {
        aiResponse = `You're welcome! 😊 Is there anything else I can help you with today? Feel free to ask about:
• Creating tickets
• Finding departments
• Tracking issues
• General assistance`;
      } else {
        aiResponse = `Thanks for providing that information! 

Based on what you've told me, here's what I recommend:
1. **Department**: Please specify which department you need (Medical, Technical, General, etc.)
2. **Priority**: How urgent is this? (Low, Medium, High, Urgent)
3. **Details**: You mentioned: "${input.substring(0, 50)}..."

Would you like me to help you create a ticket with this information, or do you have more details to add?`;
      }

      addMessage(aiResponse, "assistant");
      setIsLoading(false);
    }, 1200);
  };

  const addMessage = (content, role) => {
    const message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleCreateTicket = () => {
    navigate("/create");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-4 shadow-xl hover:shadow-2xl transition-all hover:scale-110 animate-bounce"
        title="Open AI Support Chat"
        aria-label="Open AI Support Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-background border border-border/40 animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border/40 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Support Assistant</h3>
            <p className="text-xs text-muted-foreground">AI-powered help</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg hover:bg-muted p-2 transition-colors"
          aria-label="Close chat"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted/50 text-foreground rounded-bl-none border border-border/40"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-in fade-in-50">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div className="bg-muted/50 px-4 py-2 rounded-lg text-sm text-muted-foreground">
                Assistant is typing...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions (when no detailed conversation) */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-3 border-t border-border/40 bg-muted/20">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
            Quick Help
          </p>
          <div className="grid grid-cols-3 gap-2">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.action}
                  onClick={() => handleSuggestionClick(suggestion.action)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted/80 transition-colors text-center group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                    {suggestion.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-border/40 bg-muted/30 p-3"
      >
        <Input
          ref={inputRef}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="text-sm bg-background"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Footer Action */}
      {messages.length > 2 && !isLoading && (
        <div className="border-t border-border/40 bg-muted/20 px-4 py-2">
          <Button
            onClick={handleCreateTicket}
            size="sm"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      )}
    </div>
  );
};

export default FloatingAIChatbot;
