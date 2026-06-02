import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`${isHome ? 'absolute bg-transparent text-white' : 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 text-gray-800'} w-full top-0 z-50 transition-all duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold text-xl ${isHome ? 'text-white' : 'text-blue-600'}`}
          >
            <MapPin size={28} />
            <span>Lost & Found</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`relative font-medium transition-colors hover:text-blue-600 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`relative font-medium transition-colors hover:text-blue-600 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Browse
            </Link>
            <Link
              to="/verify"
              className={`relative font-medium transition-colors hover:text-blue-600 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Verify
            </Link>

            {user ? (
              <>
                <Link
                  to="/post"
                  className={`relative font-medium transition-colors hover:text-blue-600 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full`}
                >
                  Post Report
                </Link>
                <Link
                  to="/dashboard"
                  className={`relative font-medium transition-colors hover:text-blue-600 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full`}
                >
                  Dashboard
                </Link>
                {(user.email === "admin@backtoway.com") && (
                  <Link
                    to="/admin"
                    className={`relative font-semibold transition-colors hover:text-purple-500 ${isHome ? 'text-purple-300' : 'text-purple-600'}`}
                  >
                    Admin
                  </Link>
                )}
                <div className={`flex items-center gap-4 pl-4 border-l ${isHome ? 'border-gray-500 text-gray-200' : 'border-gray-200 text-gray-700'}`}>
                  <span className="font-medium">
                    Hi, <strong>{user.name.split(" ")[0]}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 transform active:scale-95 font-medium shadow-sm hover:shadow-md"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`font-medium transition-colors hover:text-blue-600 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              to="/verify"
              className="block py-2 text-gray-700 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Verify
            </Link>

            {user ? (
              <>
                <Link
                  to="/post"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Report
                </Link>
                <Link
                  to="/dashboard"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {(user.email === "admin@backtoway.com") && (
                  <Link
                    to="/admin"
                    className="block py-2 text-purple-600 hover:text-purple-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="py-2 border-t border-gray-200 mt-2">
                  <p className="text-gray-700 mb-2">
                    Hi, <strong>{user.name.split(" ")[0]}</strong>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 mt-2 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
