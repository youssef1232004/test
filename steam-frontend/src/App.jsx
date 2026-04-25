import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

// Pages
import CustomerDelivery from "./pages/customer/CustomerDelivery";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Components
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    // We add dir="rtl" here to ensure the entire app defaults to Arabic layout
    <div dir="rtl" className="font-sans text-right">
      <Router>
        <Toaster position="top-center" reverseOrder={false} />

        <Routes>
          {/* Public Route: Customer Delivery */}
          <Route path="/" element={<CustomerDelivery />} />

          {/* Public Route: Admin Login */}
          {/* If they are already logged in, don't let them see the login page again */}
          <Route
            path="/admin/login"
            element={
              isAuthenticated ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <AdminLogin />
              )
            }
          />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {/* You can easily add more protected routes here later, like: */}
            {/* <Route path="/admin/settings" element={<AdminSettings />} /> */}
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
