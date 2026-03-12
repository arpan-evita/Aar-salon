import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, roles, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  if (roles.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <h2 className="font-heading text-xl text-primary mb-4">Access Restricted</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your account doesn't have admin access yet. Contact the salon owner to get access.
          </p>
          <button onClick={() => signOut()}
            className="text-primary/70 hover:text-primary text-sm transition-colors">
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
