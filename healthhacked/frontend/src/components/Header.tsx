import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuth";
import { useScrollToSection } from "../hooks/useScrollToSection"; // Import your custom hook
import { Button } from "../components/ui/Button";
import {
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Pill,
  ChefHat,
  LayoutDashboard,
  MessageCircle,
  ClipboardList,
  Moon,
} from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollToSection } = useScrollToSection(); // Use your custom hook
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Handle smooth scrolling to sections
  const handleSectionClick = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        scrollToSection(sectionId, { 
          behavior: 'smooth', 
          block: 'start',
          offset: 80 // Account for fixed header height
        });
      }, 100);
    } else {
      // If we're already on home page, just scroll
      scrollToSection(sectionId, { 
        behavior: 'smooth', 
        block: 'start',
        offset: 80 // Account for fixed header height
      });
    }
    setMobileMenuOpen(false);
  };

  const NavLink = ({
    to,
    children,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath(to)
          ? "bg-purple-100 text-purple-800"
          : "text-white hover:text-purple-300 hover:bg-white/10"
        }`}
    >
      {children}
    </Link>
  );

  // Component for section navigation buttons (not links)
  const SectionButton = ({
    sectionId,
    children,
    onClick,
  }: {
    sectionId: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        handleSectionClick(sectionId);
        onClick?.();
      }}
      className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-white hover:text-purple-300 hover:bg-white/10"
    >
      {children}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      {/* Gradient overlay for the glassmorphism effect */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-purple-900/60 to-slate-900/80"
        style={{ backdropFilter: "blur(16px)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Heart className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold text-white">HealthHacked</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </NavLink>
                <NavLink to="/chat">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat</span>
                  </div>
                </NavLink>
                <NavLink to="/care-plans">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="h-4 w-4" />
                    <span>Care Plans</span>
                  </div>
                </NavLink>
                <NavLink to="/meal-plans">
                  <div className="flex items-center space-x-1">
                    <ChefHat className="h-4 w-4" />
                    <span>Meal Plans</span>
                  </div>
                </NavLink>
                <NavLink to="/pill-profile">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-4 w-4" />
                    <span>Pill Profile</span>
                  </div>
                </NavLink>
                
                <NavLink to="/sleep">
                  <div className="flex items-center space-x-2">
                    <Moon className="h-4 w-4" />
                    <span>Sleep Intelligence</span>
                  </div>
                </NavLink>
              </>
            ) : (
              <>
                <SectionButton sectionId="about">About</SectionButton>
                <SectionButton sectionId="features">Features</SectionButton>
                <NavLink to="/creators">Creators</NavLink>
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.profile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-purple-300 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-purple-300 hover:bg-white/10"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-purple-300 hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {user?.profile.name}
                      </span>
                    </div>
                  </div>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                  <NavLink to="/chat" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/care-plans"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>Care Plans</span>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/meal-plans"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-4 w-4" />
                      <span>Meal Plans</span>
                    </div>
                  </NavLink>
                  <NavLink
                    to="/pill-profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Pill className="h-4 w-4" />
                      <span>Pill Profile</span>
                    </div>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:text-purple-300 hover:bg-white/10 flex items-center transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <SectionButton 
                    sectionId="about" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </SectionButton>
                  <SectionButton 
                    sectionId="features" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </SectionButton>
                  <NavLink to="/creators" onClick={() => setMobileMenuOpen(false)}>
                    Creators
                  </NavLink>
                  <div className="px-3 py-2 space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-white hover:text-purple-300 hover:bg-white/10"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        size="sm"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}