import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

function ProtectedRoute({ children, allowedRole }) {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRole) {
    return children;
  }

  const role = localStorage.getItem("reservation-role");
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to={role === "doctor" ? "/doctor" : "/doctors"} replace />;
  }

  return children;
}

export default ProtectedRoute;
