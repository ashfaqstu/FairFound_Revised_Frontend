import React, { useState } from 'react';
import { FreelancerProfile } from '../types';
import { authAPI } from '../services/api';
import { Eye, EyeOff, ArrowLeft, Loader2, Lock, Mail, User } from 'lucide-react';

interface SignupProps {
  profile: FreelancerProfile | null;
  onSignup: (username: string, email: string) => void;
  onBack: () => void;
  onStartFreeAnalysis?: () => void;
  onGoToOnboarding?: () => void;
}

const Signup: React.FC<SignupProps> = ({ profile, onSignup, onBack, onStartFreeAnalysis, onGoToOnboarding }) => {
  const [username, setUsername] = useState(profile?.email?.split('@')[0] || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    console.log('[SIGNUP] Creating account for:', email);

    try {
      const response = await authAPI.signup({
        username,
        email,
        password,
        password_confirm: confirmPassword,
        role: 'freelancer'
      });
      console.log('[SIGNUP] ✅ Account created:', response.user.username);
      onSignup(username, email);
    } catch (err) {
      console.error('[SIGNUP] ❌ Signup failed:', err);
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <img 
              src="/icons/icon128.png" 
              alt="FairFound Logo" 
              className="w-12 h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Join FairFound</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Save progress, sync devices, and access Pro features.</p>
          </div>

          {profile && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6 border border-indigo-100 dark:border-indigo-800">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Welcome, <span className="font-semibold">{profile.name}</span>! Just set up your login credentials to save your progress.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="text-center mb-2">
              <p className="text-xs text-slate-400">Or continue without an account</p>
            </div>
            <button
              type="button"
              onClick={onStartFreeAnalysis || onGoToOnboarding}
              className="w-full py-3.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-400 border border-indigo-200 dark:border-slate-700 transition-colors"
            >
              Start Analysis For Free
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">Runs a single analysis without login. You can sign up later to save results.</p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
