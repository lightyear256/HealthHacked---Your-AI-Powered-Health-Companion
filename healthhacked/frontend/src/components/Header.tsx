import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Heart, User, LogOut, Menu, X, Pill } from 'lucide-react';
import { useState } from 'react';
import { useScrollToSection } from '../hooks/useScrollToSection';

export function Header() {
  const { scrollToSection } = useScrollToSection();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleFeaturesClick = () => {
    // If we're already on the home page, just scroll to the section
    if (location.pathname === '/') {
      scrollToSection('features');
    } else {
      // Navigate to home page first, then scroll to features section
      navigate('/');
      // Use setTimeout to ensure the page has loaded before scrolling
      setTimeout(() => {
        scrollToSection('features');
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    // If we're already on the home page, just scroll to the section
    if (location.pathname === '/') {
      scrollToSection('about');
    } else {
      // Navigate to home page first, then scroll to about section
      navigate('/');
      // Use setTimeout to ensure the page has loaded before scrolling
      setTimeout(() => {
        scrollToSection('about');
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const NavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActivePath(to)
          ? 'bg-purple-100 text-purple-800'
          : 'text-white hover:text-black hover:bg-white'
      }`}
    >
      {children}
    </Link>
  );

  // Special component for Features navigation
  const FeaturesNavLink = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === '/' && location.hash === '#features'
          ? 'bg-purple-100 text-purple-800'
          : 'text-white hover:text-black hover:bg-white'
      }`}
    >
      {children}
    </button>
  );

  // Special component for About navigation
  const AboutNavLink = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === '/' && location.hash === '#about'
          ? 'bg-purple-100 text-purple-800'
          : 'text-white hover:text-black hover:bg-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-gradient-to-br from-slate-900 to-black shadow-sm border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Heart className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold text-white">HealthHacked</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/chat">Chat</NavLink>
                <NavLink to="/care-plans">Care Plans</NavLink>
                <NavLink to="/pill-profile">Pill Profile</NavLink>
              </>
            ) : (
              <>
                <AboutNavLink onClick={handleAboutClick}>About</AboutNavLink>
                <FeaturesNavLink onClick={handleFeaturesClick}>Features</FeaturesNavLink>
              </>
            )}
            
          </nav>

          {/* Desktop User Actions */}
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
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 ">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className='text-white'>Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              <NavLink to="/pill-profile" onClick={() => setMobileMenuOpen(false)}>
                Pill Profile
              </NavLink>
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-200 mb-2">
                    <div className="flex items-center space-x-2 ">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.profile.name}
                      </span>
                    </div>
                  </div>
                  <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/chat" onClick={() => setMobileMenuOpen(false)}>
                    Chat
                  </NavLink>
                  <NavLink to="/care-plans" onClick={() => setMobileMenuOpen(false)}>
                    Care Plans
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAboutClick}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:text-black hover:bg-white transition-colors"
                  >
                    About
                  </button>
                  <button
                    onClick={handleFeaturesClick}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:text-black hover:bg-white transition-colors"
                  >
                    Features
                  </button>
                  <div className="px-3 py-2 space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">
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