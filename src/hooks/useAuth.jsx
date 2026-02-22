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
        // Check if this is an OAuth callback (don't clear session in this case)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        const isOAuthCallback = hashParams.has('access_token') || 
                                hashParams.has('code') || 
                                queryParams.has('code');
        
        if (isOAuthCallback) {
          console.log("OAuth callback detected - preserving session");
          // Get the OAuth session instead of clearing it
          const { data } = await supabase.auth.getSession();
          updateSessionState(data.session);
        } else {
          // Clear any persisted sessions on normal app start
          console.log("Normal app start - clearing old sessions, fresh login required");
          await supabase.auth.signOut();
          updateSessionState(null);
        }
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
        if (nextSession?.user) {
          console.log("✅ User authenticated:", nextSession.user.email);
          console.log("User ID:", nextSession.user.id);
          console.log("User metadata:", nextSession.user.user_metadata);
        } else {
          console.log("❌ No user in session");
        }
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
      // DISABLED CROSS-TAB AUTO-LOGIN: Each tab must login manually
      // Check if Supabase auth storage changed in another tab
      // if (e.key && e.key.includes('sb-') && e.key.includes('-auth-token')) {
      //   console.log("Storage changed in another tab, syncing session...");
      //   const { data } = await supabase.auth.getSession();
      //   updateSessionState(data.session);
      // }
      console.log("Cross-tab sync disabled - manual login required");
    };

    // Listen for storage changes (when other tabs login/logout)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for visibility changes to refresh session when tab becomes active
    const handleVisibilityChange = async () => {
      // DISABLED: No automatic session refresh on tab visibility
      // if (!document.hidden && mounted) {
      //   const { data } = await supabase.auth.getSession();
      //   updateSessionState(data.session);
      // }
      console.log("Tab visibility change detected but auto-login is disabled");
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Note: sessionStorage automatically clears when tab/browser closes
    // No need for beforeunload handler

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
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