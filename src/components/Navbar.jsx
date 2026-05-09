import { Link, useNavigate } from 'react-router-dom';
import { Ticket, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const hasUserToken = !!localStorage.getItem('userToken');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/');
  };

  return (
    <nav className="border-b border-borderDark bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to={hasUserToken ? "/events" : "/"} className="flex items-center space-x-3 group">
            <div className="p-2 bg-surface rounded-xl border border-borderDark group-hover:border-accent/50 transition-all">
              <Ticket className="w-6 h-6 text-accent" />
            </div>
            <span className="font-bold text-2xl tracking-tight">EventTick</span>
          </Link>
          <div className="flex items-center space-x-4">
            {hasUserToken && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
