"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/habits", label: "Habits", icon: "✅" },
    { path: "/challenges", label: "Challenges", icon: "🏆" },
    { path: "/leaderboard", label: "Leaderboard", icon: "📊" },
    { path: "/forum", label: "Forum", icon: "💬" },
  ];

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            🌱 EcoTracker
          </Link>

          {isAuthenticated ? (
            <>
              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? "bg-green-700"
                        : "hover:bg-green-500"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">{user?.name}</span>
                  <div className="text-green-200">
                    {user?.points || 0} points • Level {user?.level || 1}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-600 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isAuthenticated && (
          <div className="md:hidden pb-4">
            <div className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    location.pathname === item.path
                      ? "bg-green-700"
                      : "hover:bg-green-500"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
