import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Heart, User, LogOut, Menu, X, Pill, ChefHat } from 'lucide-react';
import { useState } from 'react';

export function Header() {
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
                <NavLink to="/meal-plans">
                  <div className="flex items-center space-x-1">
                    <ChefHat className="h-4 w-4" />
                    <span>Meal Plans</span>
                  </div>
                </NavLink>
                <NavLink to="/pill-profile">Pill Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/features">Features</NavLink>
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
              <div className="flex items-center space-x-2">
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
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-300 hover:bg-gray-800"
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
          <div className="md:hidden border-t border-gray-700 py-4">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-700 mb-2">
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
                  <NavLink to="/meal-plans" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-4 w-4" />
                      <span>Meal Plans</span>
                    </div>
                  </NavLink>
                  <NavLink to="/pill-profile" onClick={() => setMobileMenuOpen(false)}>
                    Pill Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:text-gray-300 hover:bg-gray-800 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
                    About
                  </NavLink>
                  <NavLink to="/features" onClick={() => setMobileMenuOpen(false)}>
                    Features
                  </NavLink>
                  <div className="px-3 py-2 space-y-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-white">
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