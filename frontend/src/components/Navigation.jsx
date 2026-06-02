import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MapPin, LogOut, Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const isHome = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`${isHome ? 'absolute bg-transparent text-white' : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm dark:shadow-gray-900/50 border-b border-gray-200/50 dark:border-gray-800 text-gray-800 dark:text-gray-100'} w-full top-0 z-50 transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 font-bold text-xl ${isHome ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}
          >
            <MapPin size={28} />
            <span>Lost & Found</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isHome && (
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <Link
              to="/"
              className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600 dark:text-gray-300'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600 dark:text-gray-300'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Browse
            </Link>
            <Link
              to="/verify"
              className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600 dark:text-gray-300'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full`}
            >
              Verify
            </Link>

            {user ? (
              <>
                <Link
                  to="/post"
                  className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600 dark:text-gray-300'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full`}
                >
                  Post Report
                </Link>
                <Link
                  to="/dashboard"
                  className={`relative font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600 dark:text-gray-300'} after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full`}
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
                <div className={`flex items-center gap-4 pl-4 border-l ${isHome ? 'border-gray-500 text-gray-200' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'}`}>
                  <span className="font-medium">
                    Hi, <strong>{user.name.split(" ")[0]}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white px-4 py-2 rounded-xl transition-all duration-300 transform active:scale-95 font-medium shadow-sm hover:shadow-md"
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
                  className={`font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${isHome ? 'text-gray-200 hover:text-white' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Dark Mode Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {!isHome && (
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={24} className={isHome ? "text-white" : "text-gray-700 dark:text-gray-300"} />
              ) : (
                <Menu size={24} className={isHome ? "text-white" : "text-gray-700 dark:text-gray-300"} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              to="/verify"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Verify
            </Link>

            {user ? (
              <>
                <Link
                  to="/post"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Report
                </Link>
                <Link
                  to="/dashboard"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
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
                <div className="py-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Hi, <strong>{user.name.split(" ")[0]}</strong>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
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
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 bg-blue-600 dark:bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 mt-2 text-center transition-colors"
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
