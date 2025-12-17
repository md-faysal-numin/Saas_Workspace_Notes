import { Outlet, Navigate } from "react-router-dom";
// import { authService } from "../../services/authService";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../../hooks/useAuth";

export default function DashboardLayout() {
  // console.log("dashboard rendering");
  const { data: user, isLoading, error } = useAuth();

  // Show loading while checking cookie
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If error or no user, cookie is invalid/expired

  // console.log("user", user);
  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
