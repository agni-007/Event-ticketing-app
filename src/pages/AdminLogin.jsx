import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/.netlify/functions/adminLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      let data;
      try {
        data = await res.clone().json();
      } catch (err) {
        const text = await res.text();
        throw new Error(`Server returned invalid JSON: ${text.substring(0, 50)}...`);
      }

      if (!res.ok) throw new Error(data?.error || 'Login failed');

      localStorage.setItem('adminToken', data.token);
      navigate('/admin2005/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md rounded-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface border border-borderDark rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-accent transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface border border-borderDark rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-accent transition-colors" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors mt-4 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
