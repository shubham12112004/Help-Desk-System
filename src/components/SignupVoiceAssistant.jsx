import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Mic, MicOff, X, Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function SignupVoiceAssistant({ onFormDataUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [collectedData, setCollectedData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "citizen"
  });
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const steps = [
    {
      field: "fullName",
      question: "Hi! I'm your signup assistant. What's your full name?",
      validate: (text) => text.length > 2,
      errorMsg: "Please say your full name"
    },
    {
      field: "email",
      question: "Great! What's your email address? Say it like: john at gmail dot com",
      validate: (text) => text.includes("@") || text.includes("at"),
      errorMsg: "Please say your email address",
      transform: (text) => {
        return text
          .toLowerCase()
          .replace(/\s+at\s+/g, '@')
          .replace(/\s+dot\s+/g, '.')
          .replace(/\s+underscore\s+/g, '_')
          .replace(/\s+dash\s+/g, '-')
          .replace(/\s+/g, '');
      }
    },
    {
      field: "password",
      question: "Perfect! Now create a password. Say a combination of letters and numbers.",
      validate: (text) => text.length >= 6,
      errorMsg: "Password must be at least 6 characters",
      transform: (text) => text.replace(/\s+/g, '')
    },
    {
      field: "role",
      question: "Almost done! What's your role? Say: citizen, doctor, nurse, or staff",
      validate: (text) => {
        const role = text.toLowerCase();
        return ['citizen', 'doctor', 'nurse', 'staff', 'admin'].some(r => role.includes(r));
      },
      errorMsg: "Please say: citizen, doctor, nurse, or staff",
      transform: (text) => {
        const role = text.toLowerCase();
        if (role.includes('doctor')) return 'doctor';
        if (role.includes('nurse')) return 'nurse';
        if (role.includes('staff')) return 'staff';
        if (role.includes('admin')) return 'admin';
        return 'citizen';
      }
    }
  ];

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      handleVoiceInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        addMessage("I didn't hear anything. Please try again.", 'bot');
        setTimeout(() => {
          if (recognitionRef.current && isOpen) {
            recognitionRef.current.start();
          }
        }, 1500);
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied. Please allow microphone access.");
        addMessage("Microphone access denied. Please enable it and try again.", 'bot');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const addMessage = (text, sender = 'bot') => {
    setMessages(prev => [...prev, { text, sender, timestamp: Date.now() }]);
  };

  const handleVoiceInput = (transcript) => {
    const step = steps[currentStep];
    
    addMessage(transcript, 'user');

    // Validate and transform input
    let value = step.transform ? step.transform(transcript) : transcript;
    
    if (!step.validate(value)) {
      addMessage(step.errorMsg + ". Let me ask again.", 'bot');
      setTimeout(() => {
        speak(step.question);
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 1500);
      }, 1000);
      return;
    }

    // Save the data
    const newData = {
      ...collectedData,
      [step.field]: value
    };
    setCollectedData(newData);

    // Send to parent
    if (onFormDataUpdate) {
      onFormDataUpdate(step.field, value);
    }

    addMessage(`✓ Got it! ${step.field === 'email' ? value : step.field === 'password' ? '••••••' : value}`, 'bot');

    // Move to next step or finish
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        const nextQuestion = steps[currentStep + 1].question;
        addMessage(nextQuestion, 'bot');
        speak(nextQuestion);
        
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 2000);
      }, 1000);
    } else {
      // All done!
      addMessage("🎉 Perfect! All your information has been filled. You can now submit the form!", 'bot');
      speak("Perfect! All your information has been filled. You can now submit the form!");
      setIsListening(false);
      toast.success("Form filled successfully! Ready to sign up.", { duration: 5000 });
    }
  };

  const startAssistant = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in your browser");
      return;
    }

    setIsOpen(true);
    setCurrentStep(0);
    setMessages([]);
    setCollectedData({ fullName: "", email: "", password: "", role: "citizen" });

    // Ask first question
    setTimeout(() => {
      const firstQuestion = steps[0].question;
      addMessage(firstQuestion, 'bot');
      speak(firstQuestion);
      
      setTimeout(() => {
        recognitionRef.current.start();
      }, 2500);
    }, 500);
  };

  const stopAssistant = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
    setIsListening(false);
  };

  const closeAssistant = () => {
    stopAssistant();
    setIsOpen(false);
    setMessages([]);
    setCurrentStep(0);
  };

  const restartListening = () => {
    if (recognitionRef.current && !isListening) {
      const currentQuestion = steps[currentStep].question;
      speak(currentQuestion);
      setTimeout(() => {
        recognitionRef.current.start();
      }, 1500);
    }
  };

  return (
    <>
      {/* Floating Assistant Button */}
      {!isOpen && (
        <Button
          onClick={startAssistant}
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50 group"
          size="icon"
        >
          <div className="relative">
            <Bot className="h-7 w-7 text-white" />
            <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="absolute -top-12 right-0 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Voice Signup Assistant
          </div>
        </Button>
      )}

      {/* Assistant Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-8 right-8 w-96 h-[500px] shadow-2xl z-50 flex flex-col bg-gradient-to-br from-white to-purple-50 dark:from-slate-900 dark:to-slate-800 border-2 border-purple-200 dark:border-purple-800">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-6 w-6 text-white" />
                {isListening && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Voice Assistant</h3>
                <p className="text-xs text-purple-100">
                  {isListening ? '🎤 Listening...' : 'Ready to help'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeAssistant}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-foreground border border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2">
              {isListening ? (
                <Button
                  onClick={stopAssistant}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  <MicOff className="h-4 w-4" />
                  Stop Listening
                </Button>
              ) : currentStep < steps.length && messages.length > 0 ? (
                <Button
                  onClick={restartListening}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Mic className="h-4 w-4" />
                  Speak Again
                </Button>
              ) : null}
              
              {currentStep === steps.length && (
                <div className="flex-1 flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-semibold">All Set!</span>
                </div>
              )}
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
