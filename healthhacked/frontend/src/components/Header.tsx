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
    if (location.pathname === '/') {
      scrollToSection('features');
    } else {
      navigate('/');
      setTimeout(() => {
        scrollToSection('features');
      }, 100);
    }
    setMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    if (location.pathname === '/') {
      scrollToSection('about');
    } else {
      navigate('/');
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
          : 'text-white hover:text-purple-300 hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );

  const FeaturesNavLink = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === '/' && location.hash === '#features'
          ? 'bg-purple-100 text-purple-800'
          : 'text-white hover:text-purple-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );

  const AboutNavLink = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        location.pathname === '/' && location.hash === '#about'
          ? 'bg-purple-100 text-purple-800'
          : 'text-white hover:text-purple-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-white/10">
      <div 
        className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-purple-900/60 to-slate-900/80"
        style={{ backdropFilter: 'blur(16px)' }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Heart className="h-8 w-8 text-purple-400" />
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
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-purple-300 hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:text-purple-300 hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
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
                  <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/chat" onClick={() => setMobileMenuOpen(false)}>
                    Chat
                  </NavLink>
                  <NavLink to="/care-plans" onClick={() => setMobileMenuOpen(false)}>
                    Care Plans
                  </NavLink>
                  <NavLink to="/pill-profile" onClick={() => setMobileMenuOpen(false)}>
                    Pill Profile
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
                  <button
                    onClick={handleAboutClick}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:text-purple-300 hover:bg-white/10 transition-colors"
                  >
                    About
                  </button>
                  <button
                    onClick={handleFeaturesClick}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:text-purple-300 hover:bg-white/10 transition-colors"
                  >
                    Features
                  </button>
                  <div className="px-3 py-2 space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-white hover:text-purple-300 hover:bg-white/10">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
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