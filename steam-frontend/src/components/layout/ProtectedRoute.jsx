import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If they are not logged in, redirect them to the login page securely
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If they are logged in, render the child routes (The Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
