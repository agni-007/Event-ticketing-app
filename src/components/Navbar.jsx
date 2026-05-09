import { Link, useNavigate } from 'react-router-dom';
import { Ticket, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const hasUserToken = !!localStorage.getItem('userToken');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="border-b border-borderDark bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to={hasUserToken ? "/events" : "/"} className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="p-1.5 sm:p-2 bg-surface rounded-xl border border-borderDark group-hover:border-accent/50 transition-all">
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <span className="font-bold text-xl sm:text-2xl tracking-tight">EventTick</span>
          </Link>

          {/* Desktop nav */}
          {hasUserToken && (
            <div className="hidden sm:flex items-center space-x-3">
              <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-textSecondary hover:text-accent transition-colors px-4 py-2 rounded-lg hover:bg-surface border border-transparent hover:border-borderDark">
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm font-medium text-textSecondary hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-surface border border-transparent hover:border-borderDark"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {hasUserToken && (
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="sm:hidden p-2 rounded-lg text-textSecondary hover:text-white hover:bg-surface transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Mobile dropdown */}
        {hasUserToken && menuOpen && (
          <div className="sm:hidden border-t border-borderDark py-3 space-y-1 animate-in slide-in-from-top duration-200">
            <Link 
              to="/profile" 
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-3 text-sm font-medium text-textSecondary hover:text-accent px-3 py-3 rounded-lg hover:bg-surface transition-colors"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 text-sm font-medium text-textSecondary hover:text-white px-3 py-3 rounded-lg hover:bg-surface transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
