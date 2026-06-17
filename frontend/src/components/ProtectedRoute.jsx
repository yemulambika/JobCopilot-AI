import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

/**
 * Wraps routes that require authentication.
 * Redirects to /login if not authenticated.
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;