import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthEnhanced";
import { hasPermission, hasMinimumRole } from "@/lib/roleConfig";

/**
 * Role-based protected route component
 * Allows access based on required role or permission
 */
export function RoleBasedRoute({ 
  children, 
  requiredRole = null,
  requiredPermission = null,
  minimumRole = null,
  fallbackPath = "/unauthorized"
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to landing page
  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(profile.role, requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check exact role requirement
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check minimum role requirement
  if (minimumRole && !hasMinimumRole(profile.role, minimumRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

/**
 * Staff-only route (staff, doctor, or admin)
 */
export function StaffRoute({ children }) {
  return (
    <RoleBasedRoute minimumRole="staff">
      {children}
    </RoleBasedRoute>
  );
}

/**
 * Admin-only route
 */
export function AdminRoute({ children }) {
  return (
    <RoleBasedRoute requiredRole="admin">
      {children}
    </RoleBasedRoute>
  );
}
