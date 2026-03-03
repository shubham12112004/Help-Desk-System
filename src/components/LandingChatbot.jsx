import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, X, MessageCircle, Loader } from 'lucide-react';
import { getChatbotResponse } from '@/services/chatbot';
import { cn } from '@/lib/utils';

export default function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! 👋 I\'m your hospital AI assistant. I can help you with:\n\n🏥 Department information\n📅 Appointment scheduling\n💊 Medical inquiries\n🎫 Ticket creation\n❓ General hospital questions\n\nHow can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get response from chatbot service (uses OpenAI/Groq/Fallback)
      const result = await getChatbotResponse(input, []);
      
      // Handle both string and object responses
      const responseText = typeof result === 'string' ? result : (result?.content || result?.message || String(result));

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Failed to get response. Please try again.');

      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: 'Sorry, I encountered an error processing your request. Please try again or contact our support team.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { emoji: '📅', label: 'Book Appointment', question: 'How do I book an appointment?' },
    { emoji: '🏥', label: 'Departments', question: 'What departments do you have?' },
    { emoji: '🎫', label: 'Create Ticket', question: 'How do I create a support ticket?' },
    { emoji: '💊', label: 'Medical Help', question: 'I have health concerns, what should I do?' },
  ];

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-40 transition-all duration-300 transform rounded-full shadow-lg',
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        )}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
            <MessageCircle className="h-7 w-7" />
          </div>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 w-full max-w-md bg-background border border-border rounded-lg shadow-2xl',
            'flex flex-col h-[600px] animate-in slide-in-from-bottom-4 duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">MedDesk Assistant</h3>
                <p className="text-xs text-muted-foreground">AI-Powered Hospital Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollable-content">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'bot' && (
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-xs px-4 py-2 rounded-lg whitespace-pre-wrap break-words text-sm leading-relaxed',
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-foreground rounded-bl-none'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 animate-in fade-in">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Loader className="h-4 w-4 text-primary animate-spin" />
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (Show when few messages) */}
          {messages.length <= 2 && !loading && (
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(action.question);
                      const userMsg = {
                        id: messages.length + 1,
                        type: 'user',
                        text: action.question,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, userMsg]);
                      setLoading(true);

                      // Get response
                      getChatbotResponse(action.question, [])
                        .then((result) => {
                          const responseText = typeof result === 'string' ? result : (result?.content || result?.message || String(result));
                          const botMsg = {
                            id: messages.length + 2,
                            type: 'bot',
                            text: responseText,
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, botMsg]);
                        })
                        .catch((error) => {
                          console.error('Error:', error);
                          const errMsg = {
                            id: messages.length + 2,
                            type: 'bot',
                            text: 'Sorry, I encountered an error. Please try again.',
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, errMsg]);
                        })
                        .finally(() => setLoading(false));
                      setInput('');
                    }}
                    className="text-xs p-2 rounded-lg bg-background border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-1 text-left"
                  >
                    <span className="text-base">{action.emoji}</span>
                    <span className="flex-1">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-muted/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
