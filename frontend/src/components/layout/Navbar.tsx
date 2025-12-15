import { Link, useParams, useLocation } from "react-router-dom";
import { Globe, Lock, LogOut, User } from "lucide-react";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();
  // console.log("hi", user);

  const isPublicActive = location.pathname.includes("/public");
  const isPrivateActive = location.pathname.includes("/private");

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-blue-600">SaaS Notes</h1>

          {workspaceId && (
            <div className="flex gap-2">
              <Link
                to={`/dashboard/workspace/${workspaceId}/public`}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  isPublicActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Globe size={18} />
                Public Notes
              </Link>
              <Link
                to={`/dashboard/workspace/${workspaceId}/private`}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 ${
                  isPrivateActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Lock size={18} />
                Private Notes
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={18} />
            <span>{user?.fullName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
