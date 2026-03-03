import React, { useState } from 'react';
import { getChatbotResponse } from '@/services/chatbot';
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Heart,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Intelligent Hospital Agent
 * Handles:
 * - Appointment guidance
 * - Department recommendations
 * - Ticket creation guidance
 * - Medical information
 * - Hospital services information
 */
export class HospitalAgent {
  constructor() {
    this.intents = {
      APPOINTMENT: ['appointment', 'book', 'schedule', 'doctor', 'consult', 'visit'],
      DEPARTMENT: ['department', 'specialist', 'cardiology', 'pediatrics', 'surgery', 'neurology'],
      TICKET: ['ticket', 'issue', 'problem', 'support', 'help', 'complaint'],
      EMERGENCY: ['emergency', 'urgent', '911', 'critical', 'ambulance', 'accident'],
      MEDICAL: ['symptom', 'disease', 'medical', 'health', 'treatment', 'medicine'],
      INFORMATION: ['what', 'how', 'which', 'when', 'where', 'information', 'details'],
    };
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message) {
    const lowerMsg = message.toLowerCase();

    for (const [intent, keywords] of Object.entries(this.intents)) {
      if (keywords.some((keyword) => lowerMsg.includes(keyword))) {
        return intent;
      }
    }

    return 'INFORMATION';
  }

  /**
   * Get agent response based on intent
   */
  async getResponse(message, intent) {
    // Use AI service for accurate responses
    return await getChatbotResponse(message, 'hospital-landing');
  }

  /**
   * Get action suggestions based on intent
   */
  getActionSuggestions(intent) {
    const suggestions = {
      APPOINTMENT: [
        {
          icon: Calendar,
          title: 'Book Appointment',
          description: 'Schedule a consultation with specialists',
          action: 'book_appointment',
        },
        {
          icon: Clock,
          title: 'Check Availability',
          description: 'View available time slots',
          action: 'check_availability',
        },
      ],
      DEPARTMENT: [
        {
          icon: Heart,
          title: 'View Departments',
          description: 'Browse all hospital departments',
          action: 'view_departments',
        },
        {
          icon: Sparkles,
          title: 'Find Specialist',
          description: 'Get personalized specialist recommendations',
          action: 'find_specialist',
        },
      ],
      TICKET: [
        {
          icon: Plus,
          title: 'Create Ticket',
          description: 'Report an issue or request help',
          action: 'create_ticket',
        },
        {
          icon: Heart,
          title: 'Track Ticket',
          description: 'Check status of existing tickets',
          action: 'track_ticket',
        },
      ],
      EMERGENCY: [
        {
          icon: Phone,
          title: 'Emergency Support',
          description: 'Get immediate emergency assistance',
          action: 'emergency_support',
        },
        {
          icon: MapPin,
          title: 'Locate Hospital',
          description: 'Get directions to nearest facility',
          action: 'locate_hospital',
        },
      ],
      MEDICAL: [
        {
          icon: Heart,
          title: 'Health Info',
          description: 'Get medical information and health tips',
          action: 'health_info',
        },
        {
          icon: Phone,
          title: 'Consult Doctor',
          description: 'Talk to healthcare professionals',
          action: 'consult_doctor',
        },
      ],
      INFORMATION: [
        {
          icon: MapPin,
          title: 'Hospital Info',
          description: 'Learn about our hospital services',
          action: 'hospital_info',
        },
        {
          icon: Phone,
          title: 'Contact Us',
          description: 'Get in touch with our team',
          action: 'contact_us',
        },
      ],
    };

    return suggestions[intent] || suggestions.INFORMATION;
  }
}

/**
 * Landing Agent Component
 * Displays agent interface with AI responses and actionable suggestions
 */
export default function LandingAgent() {
  const [agent] = useState(() => new HospitalAgent());
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'agent',
      text: 'Hi there! 👋 I\'m your intelligent hospital assistant. I can help you with:',
      actions: [
        {
          icon: Calendar,
          title: 'Appointments',
          description: 'Schedule medical consultations',
        },
        {
          icon: Heart,
          title: 'Departments',
          description: 'Find the right specialist',
        },
        {
          icon: Plus,
          title: 'Support Tickets',
          description: 'Report issues or get help',
        },
        {
          icon: Phone,
          title: 'Emergency',
          description: 'Urgent medical assistance',
        },
      ],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgent, setShowAgent] = useState(false);

  const handleSendMessage = async (userMessage = null) => {
    const messageText = userMessage || input;

    if (!messageText.trim()) return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      type: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Detect intent
      const intent = agent.detectIntent(messageText);

      // Get AI response
      const aiResponse = await agent.getResponse(messageText, intent);

      // Get action suggestions
      const actions = agent.getActionSuggestions(intent);

      const agentMsg = {
        id: messages.length + 2,
        type: 'agent',
        text: aiResponse,
        intent,
        actions: actions.slice(0, 2), // Show top 2 actions
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error('Agent error:', error);
      toast.error('Failed to process request');

      const errorMsg = {
        id: messages.length + 2,
        type: 'agent',
        text: 'I encountered an error processing your request. Please try again or contact our support team.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  if (!showAgent) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-end p-4">
      <div className="w-full max-w-md h-[600px] bg-background rounded-lg shadow-2xl border border-border flex flex-col animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Hospital Agent</h3>
              <p className="text-xs text-muted-foreground">Intelligent Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setShowAgent(false)}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2">
              {msg.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-xs px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="pm-3 rounded-lg bg-muted text-foreground text-sm">
                    {msg.text}
                  </div>

                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                      {msg.actions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() =>
                              handleQuickAction(`I want to ${action.title.toLowerCase()}`)
                            }
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                          >
                            <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {action.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="border-t border-border p-4 bg-muted/30"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent..."
              disabled={loading}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { HospitalAgent };
