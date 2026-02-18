import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const updateSessionState = (nextSession) => {
      if (!mounted) return;
      setUser(nextSession?.user ?? null);
    };

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        updateSessionState(data.session);
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes (handles login/logout/token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        console.log("Auth state changed:", event);
        try {
          updateSessionState(nextSession);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    // Handle storage events for cross-tab synchronization
    const handleStorageChange = async (e) => {
      // Check if Supabase auth storage changed in another tab
      if (e.key && e.key.includes('sb-') && e.key.includes('-auth-token')) {
        console.log("Storage changed in another tab, syncing session...");
        const { data } = await supabase.auth.getSession();
        updateSessionState(data.session);
      }
    };

    // Listen for storage changes (when other tabs login/logout)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for visibility changes to refresh session when tab becomes active
    const handleVisibilityChange = async () => {
      if (!document.hidden && mounted) {
        const { data } = await supabase.auth.getSession();
        updateSessionState(data.session);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}