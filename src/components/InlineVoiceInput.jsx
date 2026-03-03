import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function InlineVoiceInput({ 
  fieldType, 
  onTranscript, 
  placeholder = "Tap mic to speak",
  className = "" 
}) {
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
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
      handleVoiceResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied.");
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleVoiceResult = (transcript) => {
    let processedValue = transcript;

    // Process based on field type
    switch (fieldType) {
      case 'email':
        // Convert spoken email to proper format
        processedValue = transcript
          .toLowerCase()
          .replace(/\s+at\s+/g, '@')
          .replace(/\s+dot\s+/g, '.')
          .replace(/\s+underscore\s+/g, '_')
          .replace(/\s+dash\s+/g, '-')
          .replace(/\s+/g, '');
        break;
      
      case 'password':
        // Remove all spaces for password
        processedValue = transcript.replace(/\s+/g, '');
        break;
      
      case 'name':
        // Keep natural spacing for names
        processedValue = transcript;
        break;
      
      default:
        processedValue = transcript;
    }

    if (onTranscript) {
      onTranscript(processedValue);
    }

    toast.success(`✓ ${fieldType === 'email' ? processedValue : 'Input captured'}`);
    
    // Auto-collapse after success
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 2000);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const toggleExpanded = () => {
    if (!isExpanded) {
      // Show tips when expanding
      const tips = {
        email: 'Say: john at gmail dot com',
        password: 'Say letters and numbers',
        name: 'Say your full name'
      };
      if (tips[fieldType]) {
        toast.info(`💡 ${tips[fieldType]}`, { duration: 3000 });
      }
    }
    setIsExpanded(!isExpanded);
  };

  // Don't render if browser doesn't support it
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main mic button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleExpanded}
        className={`h-8 w-8 transition-all ${
          isExpanded ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'text-muted-foreground hover:text-purple-600'
        }`}
        title="Voice input"
      >
        {isListening ? (
          <MicOff className="h-4 w-4 animate-pulse text-red-500" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Expanded voice panel */}
      {isExpanded && (
        <div className="absolute right-0 top-10 z-50 w-64 bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-700 rounded-lg shadow-xl p-3 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-foreground">Voice Input</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6"
            >
              <span className="text-xs">✕</span>
            </Button>
          </div>

          {isListening ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Listening...</span>
              </div>
              <Button
                type="button"
                onClick={toggleListening}
                variant="outline"
                className="w-full h-8 text-xs"
              >
                <MicOff className="h-3 w-3 mr-2" />
                Stop
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {fieldType === 'email' && '💡 Say: your at email dot com'}
                {fieldType === 'password' && '💡 Say: letters and numbers'}
                {fieldType === 'name' && '💡 Say: your full name'}
                {!['email', 'password', 'name'].includes(fieldType) && '💡 Tap mic and speak clearly'}
              </p>
              <Button
                type="button"
                onClick={toggleListening}
                className="w-full h-8 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Mic className="h-3 w-3 mr-2" />
                Start Speaking
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
