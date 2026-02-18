import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function SupabaseStatus() {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/health`,
          {
            headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.status === 200) {
          setStatus("online");
          setMessage("Connected to Supabase");
        } else if (response.status === 504) {
          setStatus("paused");
          setMessage("Supabase project is paused");
        } else {
          setStatus("error");
          setMessage(`Unexpected status: ${response.status}`);
        }
      } catch (error) {
        if (error.name === "AbortError") {
          setStatus("timeout");
          setMessage("Connection timeout - project may be paused");
        } else {
          setStatus("error");
          setMessage("Cannot reach Supabase");
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking connection...
      </div>
    );
  }

  if (status === "online") {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600">
        <CheckCircle className="h-3 w-3" />
        {message}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <div className="flex items-start gap-2 text-xs text-red-800">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{message}</p>
          <p className="mt-1 text-red-700">
            Go to{" "}
            <a
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              Supabase Dashboard
            </a>{" "}
            to restore your project
          </p>
        </div>
      </div>
    </div>
  );
}
