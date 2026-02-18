import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Hospital, Mail, Lock, User, ArrowRight, Sparkles, LogIn, UserPlus, ChevronLeft, ChevronRight, Clock, Shield, Users, AlertTriangle, Key, Link as LinkIcon } from "lucide-react";
import { SpeechMicButton } from "@/components/SpeechMicButton";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { EmailTimeoutHelp } from "@/components/EmailTimeoutHelp";
import { ThemeToggle } from "@/components/ThemeToggle";
import OTPVerification from "@/components/OTPVerification";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [configWarning, setConfigWarning] = useState(false);
  const [oauthError, setOauthError] = useState(null);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const looksInvalid = !supabaseUrl || !supabaseKey || supabaseKey.length < 100;
    const isServiceRole = (() => {
      try {
        const [, payload] = supabaseKey.split(".");
        if (!payload) return false;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = JSON.parse(atob(base64));
        return json?.role === "service_role";
      } catch {
        return false;
      }
    })();

    if (looksInvalid || isServiceRole) {
      setConfigWarning(true);
      console.warn("⚠️ Supabase configuration may be incomplete. Check SUPABASE_SETUP.md for instructions.");
      if (isServiceRole) {
        console.warn("⚠️ Your .env uses the service_role key. Replace it with the anon key for client apps.");
      }
    }
  }, []);
  const [showForm, setShowForm] = useState(true); // Show auth form immediately
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("citizen");
  const [loading, setLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [showTimeoutHelp, setShowTimeoutHelp] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [authMethod, setAuthMethod] = useState("password"); // password, otp, magiclink
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Main authentication redirect - handles all sign-in methods including OAuth
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User authenticated, redirecting to dashboard:", user.email);
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Handle password recovery and OAuth callbacks
  useEffect(() => {
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const oauthErrorParam = urlParams.get('error') || hashParams.get('error');
    const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
    
    if (oauthErrorParam) {
      console.error("OAuth error:", oauthErrorParam, errorDescription);
      
      if (errorDescription?.includes('Unable to exchange external code')) {
        setOauthError('google_not_configured');
        toast.error(
          "Google Sign-In Not Configured",
          {
            description: "Please set up Google OAuth credentials in Supabase Dashboard. Check the banner above for instructions.",
            duration: 8000,
          }
        );
      } else if (errorDescription?.includes('redirect_uri_mismatch')) {
        setOauthError('redirect_mismatch');
        toast.error(
          "OAuth Redirect URL Mismatch",
          {
            description: "Add your Supabase callback URL to Google Console authorized redirect URIs.",
            duration: 8000,
          }
        );
      } else {
        setOauthError('unknown');
        toast.error(`OAuth Error: ${errorDescription || oauthErrorParam}`);
      }
      
      // Clean the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    // Check for password recovery
    if (window.location.hash.includes("type=recovery")) {
      setShowForm(true);
      setIsSignUp(false);
      setShowResetPassword(true);
    }

    // Check for OAuth success hash
    if (window.location.hash.includes("access_token")) {
      console.log("OAuth callback detected, checking session...");
      // Force session refresh after OAuth
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.error("Error getting session after OAuth:", error);
          toast.error("Failed to complete sign-in. Please try again.");
        } else if (data.session) {
          console.log("OAuth session confirmed:", data.session.user.email);
          toast.success(`Welcome, ${data.session.user.user_metadata?.full_name || data.session.user.email}!`);
        }
      });
    }

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === "PASSWORD_RECOVERY") {
        setShowForm(true);
        setIsSignUp(false);
        setShowResetPassword(true);
      }
      
      // Log OAuth sign-in for debugging
      if (event === "SIGNED_IN" && session) {
        console.log("SIGNED_IN event received:", session.user.email);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const features = [
    {
      icon: Clock,
      title: "Fast Response",
      description: "Track tickets and get updates in real-time with instant notifications",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Secure System",
      description: "Your data is protected with enterprise-grade encryption and security",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Easy Collaboration",
      description: "Seamless workflow between citizens, staff, and administrators",
      color: "from-green-500 to-green-600"
    }
  ];

  const roleOptions = [
    {
      value: "citizen",
      label: "Citizen",
      description: "Submit requests and track updates",
    },
    {
      value: "staff",
      label: "Staff",
      description: "Handle internal and patient workflows",
    },
  ];

  const appendTranscript = (currentValue, transcript) => {
    if (!transcript) return currentValue;
    return currentValue ? `${currentValue} ${transcript}` : transcript;
  };

  const signUp = async (emailAddress, passwordValue, fullNameValue, roleValue, retryCount = 0) => {
    try {
      setRetryAttempt(retryCount);
      
      if (retryCount > 0) {
        toast.info(`Retrying signup (attempt ${retryCount + 1}/3)...`, { duration: 2000 });
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailAddress,
        password: passwordValue,
        options: {
          data: {
            full_name: fullNameValue,
            role: roleValue,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      setRetryAttempt(0);

      if (error) {
        // Handle email rate limit - don't retry
        if (error.message?.includes('Email rate limit exceeded') || 
            error.message?.includes('rate limit') || 
            error.message?.includes('limit exceeded') ||
            error.message?.includes('Too many')) {
          return { 
            error: { 
              message: '⚠️ Email rate limit exceeded! Supabase free tier only allows 3-4 signup emails per hour. To fix: Go to Supabase Dashboard → Authentication → Providers → Email and disable "Confirm email". Then signup will be instant!' 
            } 
          };
        }
        // Handle specific Supabase errors
        if (error.message?.includes('504') || error.message?.includes('Gateway') || error.message?.includes('timeout')) {
          if (retryCount < 2) {
            console.log(`504 error - retrying (${retryCount + 1}/3)...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return signUp(emailAddress, passwordValue, fullNameValue, roleValue, retryCount + 1);
          }
          return { 
            error: { 
              message: 'Email service timeout (3 attempts failed). This often happens on Supabase free tier. Try: 1) Wait 1 minute and retry, or 2) Go to Supabase Dashboard > Authentication > Settings and disable "Confirm email" for instant signup.' 
            } 
          };
        }
        if (error.message?.includes('User already registered')) {
          return { error: { message: 'This email is already registered. Please sign in instead.' } };
        }
        return { error };
      }

      if (data?.user && !data?.session) {
        console.log("Please check your email to confirm your account.");
      }

      return { error: null, data };
    } catch (error) {
      console.error("Signup error:", error);
      setRetryAttempt(0);
      
      // Handle network/fetch errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        if (retryCount < 2) {
          console.log(`Network error - retrying (${retryCount + 1}/3)...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return signUp(emailAddress, passwordValue, fullNameValue, roleValue, retryCount + 1);
        }
        return { 
          error: { 
            message: 'Cannot reach Supabase after 3 attempts. Check: 1) Your internet connection, 2) If project is paused at dashboard.supabase.com/projects' 
          } 
        };
      }
      
      return { error: { message: error.message || 'Signup failed. Please try again.' } };
    }
  };

  const signIn = async (emailAddress, passwordValue, retryCount = 0) => {
    try {
      // 20 second timeout for sign in
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const { error, data } = await supabase.auth.signInWithPassword({
        email: emailAddress,
        password: passwordValue,
      });

      clearTimeout(timeoutId);

      if (error) {
        console.error("Sign in error:", error.message);
        if (error.message?.includes('504') || error.message?.includes('Gateway')) {
          if (retryCount < 1) {
            console.log('Retrying sign in...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            return signIn(emailAddress, passwordValue, retryCount + 1);
          }
          return { error: { message: 'Server timeout. Your Supabase project may be paused or slow.' } };
        }
        return { error };
      }

      return { error: null, data };
    } catch (error) {
      console.error("Sign in exception:", error);
      
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        if (retryCount < 1) {
          console.log('Timeout - retrying sign in...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          return signIn(emailAddress, passwordValue, retryCount + 1);
        }
        return { error: { message: 'Request timed out. Please try again.' } };
      }
      
      if (error.name === 'FetchError' || error.message?.includes('fetch')) {
        return { error: { message: 'Network error. Check if Supabase project is active.' } };
      }
      return { error: { message: error.message || 'Sign in failed. Please try again.' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the current origin for redirect
      const redirectURL = `${window.location.origin}/auth`;
      console.log("Initiating Google OAuth with redirect to:", redirectURL);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectURL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Google sign in error:", error.message);
        toast.error("Failed to initiate Google sign-in");
      } else {
        console.log("OAuth redirect initiated successfully");
      }

      return { error, data };
    } catch (error) {
      console.error("Google sign in exception:", error);
      toast.error("An error occurred during Google sign-in");
      return { error };
    }
  };

  const sendOTP = async (emailAddress, fullNameValue, roleValue) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullNameValue,
            role: roleValue,
          },
        },
      });

      if (error) {
        console.error("Send OTP error:", error.message);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Send OTP exception:", error);
      return { error: { message: error.message || 'Failed to send OTP' } };
    }
  };

  const verifyOTP = async (emailAddress, otpCode) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailAddress,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        console.error("Verify OTP error:", error.message);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Verify OTP exception:", error);
      return { error: { message: error.message || 'OTP verification failed' } };
    }
  };

  const sendMagicLink = async (emailAddress, fullNameValue, roleValue) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: emailAddress,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: fullNameValue,
            role: roleValue,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        console.error("Send magic link error:", error.message);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Send magic link exception:", error);
      return { error: { message: error.message || 'Failed to send magic link' } };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.error("Please enter your full name");
          setLoading(false);
          return;
        }
        
        // Handle OTP authentication
        if (authMethod === "otp") {
          toast.info("Sending OTP to your email...", { duration: 2000 });
          const { error } = await sendOTP(email, fullName, role);
          
          if (error) {
            toast.error(error.message || "Failed to send OTP. Please try again.");
          } else {
            toast.success("OTP sent! Check your email and enter the code below.");
            setShowOTPScreen(true);
          }
          setLoading(false);
          return;
        }
        
        // Handle magic link authentication
        if (authMethod === "magiclink") {
          toast.info("Sending magic link to your email...", { duration: 2000 });
          const { error } = await sendMagicLink(email, fullName, role);
          
          if (error) {
            toast.error(error.message || "Failed to send magic link. Please try again.");
          } else {
            toast.success(
              "Magic link sent! Click the link in your email to sign in automatically.",
              { duration: 8000 }
            );
          }
          setLoading(false);
          return;
        }
        
        // Handle password authentication (original flow)
        toast.info("Creating account... This may take up to 30 seconds.", { duration: 3000 });
        setShowTimeoutHelp(false);
        const { error, data } = await signUp(email, password, fullName, role);
        if (error) {
          // Check for email rate limit
          if (error.message?.includes('Email rate limit exceeded') || 
              error.message?.includes('rate limit') || 
              error.message?.includes('limit exceeded') ||
              error.message?.includes('Too many')) {
            setShowTimeoutHelp(true);
            toast.error("⚠️ Email limit exceeded! Supabase free tier only allows 3-4 emails/hour. You MUST disable email confirmation to continue signing up.", { duration: 10000 });
          }
          // Check if it's a timeout error
          else if (error.message?.includes('timeout') || error.message?.includes('504') || error.message?.includes('email service')) {
            setShowTimeoutHelp(true);
            toast.error(error.message || "Failed to sign up. Please try again.");
          }
          // Provide more specific error messages
          else if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message || "Failed to sign up. Please try again.");
          }
        } else {
          // Check if email confirmation is required
          if (data?.user && !data?.session) {
            toast.success(
              "Account created! Please check your email to verify your account.",
              { duration: 6000 }
            );
          } else if (data?.session) {
            // Auto-login enabled (email confirmation disabled in Supabase)
            toast.success("Account created successfully!");
            navigate("/dashboard");
          } else {
            toast.success("Please check your email to verify your account.");
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          // Provide more specific error messages
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Please verify your email before signing in.");
          } else {
            toast.error(error.message || "Failed to sign in. Please try again.");
          }
        } else {
          toast.success("Welcome back!");
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || "Google sign-in failed. Please try again.");
        setLoading(false);
      }
      // Don't set loading to false on success - OAuth will redirect the page
      // If we reach here without error, the redirect should happen automatically
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResetRequest = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email.");
      } else {
        toast.success("Reset link sent! Check your email to continue.");
        setShowResetRequest(false);
      }
    } catch (error) {
      console.error("Reset request error:", error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password.");
      } else {
        toast.success("Password updated! You can sign in now.");
        setShowResetPassword(false);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setLoading(true);
    setOtpError(null);
    
    try {
      const { error, data } = await verifyOTP(email, otpCode);
      
      if (error) {
        if (error.message?.includes('expired') || error.message?.includes('invalid')) {
          setOtpError('Invalid or expired code. Please try again or request a new code.');
        } else {
          setOtpError(error.message || 'Verification failed. Please try again.');
        }
        toast.error(error.message || "OTP verification failed.");
      } else if (data?.session) {
        toast.success("Email verified successfully! Welcome!");
        setShowOTPScreen(false);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpError("An unexpected error occurred. Please try again.");
      toast.error("OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setOtpError(null);
    
    try {
      const { error } = await sendOTP(email, fullName, role);
      
      if (error) {
        toast.error(error.message || "Failed to resend OTP.");
      } else {
        toast.success("New OTP sent! Check your email.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTPScreen(false);
    setOtpError(null);
    setLoading(false);
  };

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
      {/* Configuration Warning Banner */}
      {configWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-4 shadow-2xl border-b-4 border-yellow-600">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">
                  🚨 SUPABASE NOT CONNECTED - Authentication Won't Work!
                </p>
                <p className="text-xs opacity-90 mb-3">
                  Your Supabase anon key is missing or invalid. Follow these steps:
                </p>
                <ol className="text-xs space-y-1 opacity-90 ml-4 list-decimal">
                  <li>
                    Go to{" "}
                    <a 
                      href="https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/settings/api" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:text-yellow-100"
                    >
                      Supabase API Settings
                    </a>
                  </li>
                  <li>Copy the <strong>"anon"</strong> key (starts with eyJhbGc...)</li>
                  <li>Update <code className="bg-white/20 px-1 py-0.5 rounded">.env</code> file → replace YOUR_ANON_KEY_HERE</li>
                  <li>Restart dev server (Ctrl+C then npm run dev)</li>
                </ol>
                <p className="text-xs mt-2 opacity-75">
                  📖 Detailed guide: <code className="bg-white/20 px-1 py-0.5 rounded">SUPABASE_SETUP.md</code>
                </p>
              </div>
              <button 
                onClick={() => setConfigWarning(false)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl transition-colors"
                title="Dismiss (warning will return on refresh)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* OAuth Error Warning Banner */}
      {oauthError === 'google_not_configured' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-4 shadow-2xl border-b-4 border-red-700">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-3 mb-2">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">
                  🚨 GOOGLE SIGN-IN NOT CONFIGURED
                </p>
                <p className="text-xs opacity-90 mb-3">
                  Google OAuth credentials are missing in Supabase. Follow these steps:
                </p>
                <ol className="text-xs space-y-1 opacity-90 ml-4 list-decimal">
                  <li>
                    Go to{" "}
                    <a 
                      href="https://supabase.com/dashboard/project/zbvjkakyjvnmiabnnbvz/auth/providers" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:text-red-100"
                    >
                      Supabase Authentication → Providers
                    </a>
                  </li>
                  <li>Find <strong>Google</strong> in the list and click to configure</li>
                  <li>Get OAuth credentials from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-100">Google Cloud Console</a></li>
                  <li>Add <strong>Client ID</strong> and <strong>Client Secret</strong> to Supabase</li>
                  <li>Add Supabase callback URL to Google Console authorized redirect URIs</li>
                </ol>
                <p className="text-xs mt-2 opacity-75">
                  📖 Detailed guide: <code className="bg-white/20 px-1 py-0.5 rounded">SUPABASE_SETUP.md</code> (Google OAuth Configuration section)
                </p>
              </div>
              <button 
                onClick={() => setOauthError(null)}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl transition-colors"
                title="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Animated Background Blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />

      {/* Top Header Banner - CLEAR & HD */}
      <div className="relative z-10 bg-gradient-to-r from-primary via-purple-500 to-blue-600 dark:from-primary/90 dark:via-purple-600 dark:to-blue-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                <Hospital className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">MedDesk</h1>
                <p className="text-white/90 text-sm font-semibold">Hospital Help Desk System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="group flex items-center gap-2 rounded-full bg-white text-primary px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <LogIn className="h-5 w-5" />
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 py-16">
        {!showForm ? (
          <>
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="space-y-8">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4" />
                    Welcome to MedDesk
                  </span>
                  <h2 className="text-5xl font-bold text-slate-900 dark:text-white mt-6 leading-tight">
                    Built for <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Fast Clinical Response</span>
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mt-6 font-medium">
                    Centralize citizen requests, staff workflows, and admin oversight with a clean, focused experience.
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "98%", label: "Same-day response" },
                    { value: "24/7", label: "Monitoring" },
                    { value: "4.9", label: "Staff rating" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-lg">
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs text-foreground/60 mt-1 font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Carousel */}
              <div className="relative h-full flex flex-col justify-center">
                <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shadow-2xl">
                  {/* Slides */}
                  <div className="relative h-96">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      const isActive = index === slideIndex;
                      return (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-all duration-700 ease-out ${
                            isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
                          }`}
                        >
                          <div className={`bg-gradient-to-br ${feature.color} h-full flex flex-col items-center justify-center text-white p-8 text-center`}>
                            <Icon className="h-20 w-20 mb-6 animate-bounce" />
                            <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-white/90 text-lg font-medium">{feature.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Slide Controls */}
                  <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-10">
                    <button
                      onClick={prevSlide}
                      className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all active:scale-90"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="flex gap-2">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSlideIndex(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === slideIndex ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextSlide}
                      className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all active:scale-90"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-8 w-full group inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Get Started Now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Auth Form - Appears when button is clicked */
          <div className="max-w-md mx-auto animate-fade-in">
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 text-foreground/60 hover:text-foreground font-semibold flex items-center gap-2 transition-colors"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </button>

            <div className="rounded-3xl border-2 border-primary/20 bg-white dark:bg-slate-800 dark:border-slate-700 p-8 shadow-2xl">
              {/* Supabase Connection Status */}
              <div className="mb-4">
                <SupabaseStatus />
              </div>

              {/* Form Tabs */}
              <div className="relative mb-8 rounded-full border-2 border-primary/20 bg-slate-100 dark:bg-slate-700 dark:border-slate-600 p-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-inner">
                <div
                  className={`absolute left-1.5 top-1.5 h-[calc(100%-0.75rem)] w-[calc(50%-0.75rem)] rounded-full bg-gradient-to-r from-primary to-primary shadow-xl transition-all duration-700 ease-out ${
                    isSignUp ? "translate-x-full" : "translate-x-0"
                  }`}
                />
                <div className="relative z-10 grid grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`rounded-full px-5 py-2.5 transition-all duration-700 flex items-center justify-center gap-2 font-bold ${
                      !isSignUp ? "text-white" : "text-slate-600 hover:text-slate-700"
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`rounded-full px-5 py-2.5 transition-all duration-700 flex items-center justify-center gap-2 font-bold ${
                      isSignUp ? "text-white" : "text-slate-600 hover:text-slate-700"
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="relative min-h-[520px] overflow-hidden">
                <div
                  className={`flex w-[200%] transition-transform duration-700 ease-out ${
                    isSignUp ? "-translate-x-1/2" : "translate-x-0"
                  }`}
                >
                  {/* Sign In Form */}
                  <div className="w-1/2 px-2">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                      <p className="text-sm text-foreground font-medium mt-1">Sign in to your help desk account</p>
                    </div>

                    {showResetPassword && (
                      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm font-semibold text-foreground">Reset your password</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter a new password to regain access.
                        </p>
                        <div className="mt-4 space-y-3">
                          <input
                            type="password"
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
                            minLength={6}
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={handlePasswordUpdate}
                            disabled={resetLoading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resetLoading ? "Updating..." : "Update Password"}
                          </button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                      <div className="group relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary transition-colors group-focus-within:text-primary" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all hover:border-slate-400 dark:hover:border-slate-500"
                          required
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                      </div>

                      <div className="group relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary transition-colors group-focus-within:text-primary" />
                        <input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all hover:border-slate-400 dark:hover:border-slate-500"
                          minLength={6}
                          required
                          autoComplete="off"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetRequest((prev) => !prev);
                            setShowResetPassword(false);
                          }}
                          className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {showResetRequest && (
                        <div className="rounded-xl border border-border bg-slate-50 p-3">
                          <p className="text-xs text-muted-foreground mb-2">
                            Send a reset link to your email.
                          </p>
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-foreground placeholder:text-slate-400 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                          />
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleResetRequest}
                              disabled={resetLoading}
                              className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                            >
                              {resetLoading ? "Sending..." : "Send reset link"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowResetRequest(false)}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full group inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Signing in...
                          </span>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/40 to-border/0" />
                      <span className="text-xs text-slate-500 font-medium">OR</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/40 to-border/0" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        viewBox="0 0 48 48"
                        className="h-4 w-4"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.72 1.22 9.22 3.22l6.85-6.85C35.88 2.19 30.3 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.2C12.46 13.03 17.77 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.14-3.08-.4-4.55H24v9.02h12.95c-.56 3-2.26 5.54-4.82 7.26l7.4 5.75c4.32-3.98 6.45-9.85 6.45-17.48z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.54 28.02c-.48-1.43-.76-2.96-.76-4.52s.28-3.09.76-4.52l-7.98-6.2C.92 16.46 0 20.12 0 23.5c0 3.38.92 7.04 2.56 10.72l7.98-6.2z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 47c6.3 0 11.88-2.08 15.84-5.66l-7.4-5.75c-2.05 1.37-4.68 2.18-8.44 2.18-6.23 0-11.54-3.53-13.46-8.52l-7.98 6.2C6.51 42.62 14.62 47 24 47z"
                        />
                      </svg>
                      Continue with Google
                    </button>

                    <p className="text-center text-xs text-foreground/70">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Create one
                      </button>
                    </p>

                    {/* Sign-in panel to balance height */}
                    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Secure access, faster triage</p>
                          <p className="text-xs text-foreground/60">Recent alerts and team handoffs sync instantly.</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {[
                          { title: "Live ticket queue", meta: "Updates every 30s", icon: Clock },
                          { title: "Priority routing", meta: "Auto-tagged by severity", icon: Sparkles },
                          { title: "Team visibility", meta: "Shared notes and status", icon: Users }
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.title}
                              className="flex items-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm border border-border/50 hover:border-primary/30 transition-all duration-300"
                            >
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-card-foreground">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.meta}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sign Up Form */}
                  <div className="w-1/2 px-2">
                    {showOTPScreen ? (
                      <OTPVerification
                        email={email}
                        onVerify={handleVerifyOTP}
                        onResend={handleResendOTP}
                        onCancel={handleCancelOTP}
                        loading={loading}
                        error={otpError}
                      />
                    ) : (
                      <>
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                          <p className="text-sm text-foreground font-medium mt-1">Join our help desk system</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="group relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary transition-colors group-focus-within:text-primary" />
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-12 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all hover:border-slate-400 dark:hover:border-slate-500"
                              required
                              autoComplete="name"
                            />
                            <SpeechMicButton
                              ariaLabel="Dictate full name"
                              onTranscript={(transcript) =>
                                setFullName((current) =>
                                  appendTranscript(current, transcript)
                                )
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            />
                          </div>

                          <div className="group relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary transition-colors group-focus-within:text-primary" />
                            <input
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all hover:border-slate-400 dark:hover:border-slate-500"
                              required
                              autoComplete="email"
                            />
                          </div>

                          <div className="space-y-3 pt-2">
                            <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Choose Sign-Up Method</p>
                            <div className="grid gap-2">
                              {[
                                { value: "password", icon: Lock, label: "Password", description: "Traditional password-based signup" },
                                { value: "otp", icon: Key, label: "OTP Code", description: "Receive a 6-digit code via email" },
                                { value: "magiclink", icon: LinkIcon, label: "Magic Link", description: "Click link in email to sign in" }
                              ].map((method) => {
                                const Icon = method.icon;
                                return (
                                  <button
                                    key={method.value}
                                    type="button"
                                    onClick={() => setAuthMethod(method.value)}
                                    className={`group relative rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all overflow-hidden ${
                                      authMethod === method.value
                                        ? "border-primary/60 bg-gradient-to-r from-primary/15 to-primary/10 text-foreground shadow-md scale-105"
                                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-foreground/80 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-600"
                                    }`}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex items-center gap-3">
                                      <Icon className={`h-5 w-5 ${authMethod === method.value ? 'text-primary' : 'text-foreground/60'}`} />
                                      <div className="flex-1">
                                        <div className="font-semibold text-foreground">{method.label}</div>
                                        <div className="text-xs text-foreground/60">{method.description}</div>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {authMethod === "password" && (
                            <div className="group relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary transition-colors group-focus-within:text-primary" />
                              <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all hover:border-slate-400 dark:hover:border-slate-500"
                                minLength={6}
                                required
                                autoComplete="new-password"
                              />
                            </div>
                          )}

                          <div className="space-y-3 pt-2">
                            <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Select your role</p>
                            <div className="grid gap-2">
                              {roleOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => setRole(option.value)}
                                  className={`group relative rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all overflow-hidden ${
                                    role === option.value
                                      ? "border-primary/60 bg-gradient-to-r from-primary/15 to-primary/10 text-foreground shadow-md scale-105"
                                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-foreground/80 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-600"
                                  }`}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="relative">
                                    <div className="font-semibold text-foreground">{option.label}</div>
                                    <div className="text-xs text-foreground/60">{option.description}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full group inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                {retryAttempt > 0 ? `Retrying... (${retryAttempt + 1}/3)` : 'Creating account...'}
                              </span>
                            ) : (
                              <>
                                Create Account
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </button>

                          {loading && retryAttempt === 0 && (
                            <p className="text-xs text-center text-muted-foreground mt-2">
                              ⏱️ Email service may take 20-30 seconds on free tier...
                            </p>
                          )}

                          {showTimeoutHelp && !loading && (
                            <EmailTimeoutHelp />
                          )}
                        </form>

                        <div className="my-6 flex items-center gap-3">
                          <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/40 to-border/0" />
                          <span className="text-xs text-slate-500 font-medium">OR</span>
                          <div className="flex-1 h-px bg-gradient-to-r from-border/0 via-border/40 to-border/0" />
                        </div>

                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 48 48"
                            className="h-4 w-4"
                          >
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.72 1.22 9.22 3.22l6.85-6.85C35.88 2.19 30.3 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.2C12.46 13.03 17.77 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.14-3.08-.4-4.55H24v9.02h12.95c-.56 3-2.26 5.54-4.82 7.26l7.4 5.75c4.32-3.98 6.45-9.85 6.45-17.48z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.54 28.02c-.48-1.43-.76-2.96-.76-4.52s.28-3.09.76-4.52l-7.98-6.2C.92 16.46 0 20.12 0 23.5c0 3.38.92 7.04 2.56 10.72l7.98-6.2z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 47c6.3 0 11.88-2.08 15.84-5.66l-7.4-5.75c-2.05 1.37-4.68 2.18-8.44 2.18-6.23 0-11.54-3.53-13.46-8.52l-7.98 6.2C6.51 42.62 14.62 47 24 47z"
                            />
                          </svg>
                          Continue with Google
                        </button>

                        <p className="text-center text-xs text-foreground/70">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            Sign in
                          </button>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Auth;