import { useEffect, useMemo, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpeechMicButton({
  onTranscript,
  className,
  disabled = false,
  ariaLabel = "Use voice input",
}) {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const isSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleClick = () => {
    if (!isSupported || disabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const result = event.results?.[event.resultIndex]?.[0]?.transcript;
      if (result) onTranscript(result);
    };

    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isSupported || disabled}
      aria-label={ariaLabel}
      aria-pressed={isListening}
      title={
        !isSupported
          ? "Voice input is not supported in this browser"
          : isListening
          ? "Stop voice input"
          : "Start voice input"
      }
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground",
        isListening && "text-primary",
        (!isSupported || disabled) && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <Mic className="h-4 w-4" />
    </button>
  );
}
