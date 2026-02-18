import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hasPermission, isStaffMember } from "@/lib/roleConfig";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const updateSessionState = async (nextSession) => {
      if (!mounted) return;
      
      const currentUser = nextSession?.user ?? null;
      setUser(currentUser);
      
      // Fetch user profile if logged in
      if (currentUser) {
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (error) throw error;
          if (mounted) {
            setProfile(profileData);
            
            // Update last_login_at
            await supabase
              .from('profiles')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', currentUser.id);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          if (mounted) {
            setProfile(null);
          }
        }
      } else {
        if (mounted) {
          setProfile(null);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        await updateSessionState(data.session);
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        try {
          await updateSessionState(nextSession);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    role: profile?.role,
    isStaff: profile?.role ? isStaffMember(profile.role) : false,
    hasPermission: (permission) => profile?.role ? hasPermission(profile.role, permission) : false,
    refreshProfile: async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
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
