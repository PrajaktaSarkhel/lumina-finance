import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

// Mock credentials — replace with real API later
const VALID_EMAIL = 'demo@lumina.com';
const VALID_PASSWORD = 'password123';

export default function Login() {
  const { darkMode, login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a small delay like a real API call
    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        login();           // sets isLoggedIn: true in Zustand
        navigate('/');     // redirect to dashboard
      } else {
        setError('Invalid email or password.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-10">
            {/* Brand */}
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                💡 LUMINA
              </h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to your finance dashboard</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@lumina.com"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Signing in...' : 'SIGN IN'}
              </button>
            </form>

            {/* Hint */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Demo: <span className="text-blue-500">demo@lumina.com</span> / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}