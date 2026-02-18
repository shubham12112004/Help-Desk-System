import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import FloatingAIChatbot from "@/components/FloatingAIChatbot";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetail from "./pages/TicketDetail";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import StaffRoster from "./pages/StaffRoster";
import HospitalAnalytics from "./pages/HospitalAnalytics";
import PatientProfile from "./pages/PatientProfile";
import Medical from "./pages/Medical";
import Pharmacy from "./pages/Pharmacy";
import LabTests from "./pages/LabTests";
import HospitalAppointments from "./pages/HospitalAppointments";
import Emergency from "./pages/Emergency";
import HospitalBilling from "./pages/HospitalBilling";
import TokenQueue from "./pages/TokenQueue";
import { Suspense } from "react";

const queryClient = new QueryClient();

// Fallback loading component
const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
      <p className="text-muted-foreground">Loading application...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<LoadingFallback />}>
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  {/* Landing page - public */}
                  <Route path="/" element={<Landing />} />
                  
                  {/* Auth page - public */}
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected dashboard routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tickets"
                    element={
                      <ProtectedRoute>
                        <Tickets />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tickets/:id"
                    element={
                      <ProtectedRoute>
                        <TicketDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute>
                        <CreateTicket />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/staff-roster"
                    element={
                      <ProtectedRoute>
                        <StaffRoster />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <HospitalAnalytics />
                      </ProtectedRoute>
                    }
                  />

                  {/* Patient Hospital Services */}
                  <Route
                    path="/patient-profile"
                    element={
                      <ProtectedRoute>
                        <PatientProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/token-queue"
                    element={
                      <ProtectedRoute>
                        <TokenQueue />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/medical"
                    element={
                      <ProtectedRoute>
                        <Medical />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pharmacy"
                    element={
                      <ProtectedRoute>
                        <Pharmacy />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lab-tests"
                    element={
                      <ProtectedRoute>
                        <LabTests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <ProtectedRoute>
                        <HospitalAppointments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/emergency"
                    element={
                      <ProtectedRoute>
                        <Emergency />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/billing"
                    element={
                      <ProtectedRoute>
                        <HospitalBilling />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Floating AI Chatbot - shown on all protected routes */}
                <FloatingAIChatbot />
              </BrowserRouter>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
