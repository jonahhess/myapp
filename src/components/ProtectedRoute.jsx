import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ isAllowed, redirectTo = "/login" }) {
  const location = useLocation();

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
