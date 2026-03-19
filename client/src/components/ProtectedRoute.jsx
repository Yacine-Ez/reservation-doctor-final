import { Navigate } from "react-router-dom";
function LocalProtectedRoute({ children, allowedRole }) {
  const isSignedIn = localStorage.getItem("reservation-auth") === "1";

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRole) {
    return children;
  }

  const role = localStorage.getItem("reservation-role");
  if (role !== allowedRole) {
    return <Navigate to={role === "doctor" ? "/doctor" : "/doctors"} replace />;
  }

  return children;
}

function ProtectedRoute(props) {
  return <LocalProtectedRoute {...props} />;
}

export default ProtectedRoute;
