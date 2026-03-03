import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VoiceInput({ onResult, placeholder = "Click mic to speak" }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("🎤 Listening... Speak clearly", { duration: 2000 });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        if (onResult) {
          onResult(finalTranscript.trim());
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied. Please allow microphone access.");
      } else {
        toast.error(`Speech recognition error: ${event.error}`);
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
    };
  }, [onResult]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success("✓ Stopped listening");
    } else {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      onClick={toggleListening}
      title={isListening ? "Stop listening" : "Start voice input"}
      className={isListening ? "animate-pulse" : ""}
    >
      {isListening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}

export function SmartVoiceInput({ onDataExtracted }) {
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState("name");
  const [collectedData, setCollectedData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const recognitionRef = useRef(null);
  const [step, setStep] = useState(0);

  const questions = [
    { field: "name", prompt: "What is your name?" },
    { field: "email", prompt: "What is your email address?" },
    { field: "phone", prompt: "What is your phone number?" },
    { field: "message", prompt: "Please describe your issue or message" }
  ];

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

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
      const currentQ = questions[step];
      
      // Extract data based on field type
      let extractedValue = transcript;
      
      if (currentQ.field === "email") {
        // Try to extract email pattern
        const emailMatch = transcript.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          extractedValue = emailMatch[0];
        } else {
          // Convert spoken email to text format
          extractedValue = transcript
            .toLowerCase()
            .replace(/\s+at\s+/g, '@')
            .replace(/\s+dot\s+/g, '.')
            .replace(/\s+/g, '');
        }
      } else if (currentQ.field === "phone") {
        // Extract numbers only
        extractedValue = transcript.replace(/\D/g, '');
      }

      // Update collected data
      const newData = {
        ...collectedData,
        [currentQ.field]: extractedValue
      };
      setCollectedData(newData);

      toast.success(`✓ ${currentQ.field}: ${extractedValue}`);

      // Move to next question or finish
      if (step < questions.length - 1) {
        setStep(step + 1);
        setTimeout(() => {
          speakQuestion(questions[step + 1].prompt);
          setTimeout(() => {
            recognition.start();
          }, 2000);
        }, 1000);
      } else {
        // All done
        setIsListening(false);
        if (onDataExtracted) {
          onDataExtracted(newData);
        }
        toast.success("✓ All information collected!", { duration: 3000 });
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(`Error: ${event.error}`);
    };

    recognition.onend = () => {
      // Don't automatically restart unless we're mid-conversation
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [step, collectedData, onDataExtracted]);

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported");
      return;
    }

    setStep(0);
    setCollectedData({ name: "", email: "", phone: "", message: "" });
    speakQuestion(questions[0].prompt);
    
    setTimeout(() => {
      recognitionRef.current.start();
    }, 2000);
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          variant={isListening ? "destructive" : "default"}
          className={isListening ? "animate-pulse" : ""}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Voice Input
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>
        
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{questions[step]?.prompt}</span>
          </div>
        )}
      </div>

      {/* Show collected data */}
      {Object.entries(collectedData).some(([_, value]) => value) && (
        <div className="p-4 rounded-lg border border-border bg-muted/50 space-y-2">
          <p className="text-sm font-semibold">Collected Information:</p>
          {Object.entries(collectedData).map(([field, value]) => 
            value ? (
              <p key={field} className="text-sm">
                <span className="font-medium capitalize">{field}:</span> {value}
              </p>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
