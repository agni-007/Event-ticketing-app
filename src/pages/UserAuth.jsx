import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/.netlify/functions/publicLogin' : '/.netlify/functions/publicSignup';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('userToken', data.token);
      navigate('/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      
      {/* Decorative Orbs for the Background */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 sm:w-96 sm:h-96 bg-blue-600/30 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-600/20 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none"></div>

      <div className="glass-panel p-6 sm:p-10 w-full max-w-md rounded-3xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Lock Icon matching screenshot */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-blue-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 sm:h-8 sm:w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center text-white">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className="text-center text-textSecondary text-xs sm:text-sm mb-6 sm:mb-8 px-2">
          {isLogin 
            ? 'Please enter your details to sign in.' 
            : 'Sign up to discover and register for events.'}
        </p>

        {error && <p className="text-red-400 text-xs sm:text-sm text-center mb-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-textSecondary mb-1 ml-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full glass-input rounded-xl px-4 py-2.5 sm:py-3 text-sm transition-colors" 
            />
          </div>
          <div>
            <label className="block text-[10px] sm:text-xs font-medium text-textSecondary mb-1 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input rounded-xl px-4 py-2.5 sm:py-3 text-sm transition-colors" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 sm:py-3.5 rounded-xl transition-all mt-2 disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] active:scale-[0.98] text-sm sm:text-base"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs sm:text-sm text-textSecondary hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>

      </div>
    </div>
  );
}
