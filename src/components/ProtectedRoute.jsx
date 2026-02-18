import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [timeout, setTimeout] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Force a session check on mount to catch sessions from other tabs
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSessionChecked(true);
      console.log("ProtectedRoute session check:", data.session ? "authenticated" : "not authenticated");
    };
    checkSession();
  }, []);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timer = window.setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout - redirecting to auth page");
        setTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if ((loading || !sessionChecked) && !timeout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || timeout) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}