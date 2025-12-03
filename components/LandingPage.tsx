
import React, { useState } from 'react';
import { ChevronRight, TrendingUp, Users, ShieldCheck, Zap, BarChart3, Globe, Code } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  onMentorLogin: (email: string, password: string) => Promise<void>;
  onMentorSignup?: (data: { email: string; password: string; username: string; fullName: string; title: string; company: string }) => Promise<void>;
  isDark: boolean;
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin, onMentorLogin, onMentorSignup, isDark, toggleTheme }) => {
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [mentorAuthTab, setMentorAuthTab] = useState<'login' | 'signup'>('login');
  // Login state
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorPassword, setMentorPassword] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState('');
  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupTitle, setSignupTitle] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMentorMode(false)}>
            <img 
              src="/icons/icon128.png" 
              alt="FairFound Logo" 
              className="w-7 h-7 md:w-8 md:h-8"
            />
            <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">FairFound</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
                onClick={() => setIsMentorMode(!isMentorMode)}
                className={`font-medium text-xs md:text-sm transition-colors px-2 md:px-3 py-1.5 md:py-2 rounded-lg ${isMentorMode ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              {isMentorMode ? 'Freelancers' : 'Mentors'}
            </button>
            {!isMentorMode && (
              <button
                onClick={() => {
                  const el = document.getElementById('pricing');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:block font-medium text-sm px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Pricing
              </button>
            )}
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {!isMentorMode && (
              <button 
                onClick={onLogin}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-xs md:text-sm transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      {isMentorMode ? (
        <>
          {/* Mentor hero & auth */}
          <section className="relative pt-12 md:pt-20 pb-16 md:pb-32 min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-50/50 dark:bg-emerald-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide mb-6 md:mb-8">
                  <Users size={12} className="fill-current" />
                  FairFound for Mentors
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 md:mb-6 leading-tight">
                  Turn your experience into <span className="text-emerald-600 dark:text-emerald-400">Income.</span>
                </h1>
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mb-6 md:mb-8 leading-relaxed">
                  Mentor the next generation of top freelancers. Manage sessions, assign tasks, and track mentee growth all in one dashboard.
                </p>
                <ul className="space-y-3 md:space-y-4 mb-8 md:mb-10 text-left max-w-sm mx-auto lg:mx-0">
                  {['Set your own rates', 'Curated mentee matches', 'AI-assisted task generation', 'Automated scheduling'].map(feat => (
                    <li key={feat} className="flex items-center gap-3 text-sm md:text-base text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShieldCheck size={12} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl md:rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full mx-auto">
                {/* Tabs */}
                <div className="flex mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setMentorAuthTab('login')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                      mentorAuthTab === 'login'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMentorAuthTab('signup')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                      mentorAuthTab === 'signup'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
                {mentorAuthTab === 'login' ? (
                  <div className="space-y-4">
                    {mentorError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{mentorError}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                      <input 
                        type="email" 
                        placeholder="you@company.com" 
                        value={mentorEmail}
                        onChange={(e) => setMentorEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={mentorPassword}
                        onChange={(e) => setMentorPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!mentorEmail || !mentorPassword) {
                          setMentorError('Please enter email and password');
                          return;
                        }
                        setMentorError('');
                        setMentorLoading(true);
                        try {
                          await onMentorLogin(mentorEmail, mentorPassword);
                        } catch (err) {
                          setMentorError(err instanceof Error ? err.message : 'Login failed');
                        } finally {
                          setMentorLoading(false);
                        }
                      }}
                      disabled={mentorLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {mentorLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </>
                      ) : 'Access Dashboard'}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                      Don't have an account? <button onClick={() => setMentorAuthTab('signup')} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Sign up</button>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {signupError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{signupError}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                        <input 
                          type="text" 
                          placeholder="johndoe" 
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                        <input 
                          type="text" 
                          placeholder="John Doe" 
                          value={signupFullName}
                          onChange={(e) => setSignupFullName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email *</label>
                      <input 
                        type="email" 
                        placeholder="you@company.com" 
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title & Company</label>
                      <input 
                        type="text" 
                        placeholder="Senior Developer at Google" 
                        value={signupTitle}
                        onChange={(e) => setSignupTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" 
                      />
                    </div>
                    <button
                      onClick={async () => {
                        if (!signupUsername || !signupFullName || !signupEmail || !signupPassword) {
                          setSignupError('Please fill in all required fields');
                          return;
                        }
                        if (signupUsername.length < 3) {
                          setSignupError('Username must be at least 3 characters');
                          return;
                        }
                        if (signupPassword.length < 6) {
                          setSignupError('Password must be at least 6 characters');
                          return;
                        }
                        setSignupError('');
                        setSignupLoading(true);
                        try {
                          const [title, company] = signupTitle.includes(' at ') 
                            ? signupTitle.split(' at ') 
                            : [signupTitle, ''];
                          
                          if (onMentorSignup) {
                            await onMentorSignup({
                              email: signupEmail,
                              password: signupPassword,
                              username: signupUsername,
                              fullName: signupFullName,
                              title: title.trim(),
                              company: company.trim(),
                            });
                          } else {
                            setSignupError('Mentor signup is not available');
                          }
                        } catch (err) {
                          setSignupError(err instanceof Error ? err.message : 'Signup failed');
                        } finally {
                          setSignupLoading(false);
                        }
                      }}
                      disabled={signupLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {signupLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating account...
                        </>
                      ) : 'Create Mentor Account'}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                      By signing up, you agree to our Mentor Code of Conduct.
                    </p>
                    <p className="text-center text-xs text-slate-400">
                      Already have an account? <button onClick={() => setMentorAuthTab('login')} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Log in</button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
          {/* Mentor Benefits standalone section */}
          <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">What Mentors Get</h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We amplify your expertise with tools that make mentoring scalable, rewarding, and data‑driven.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {[
                  { title: 'Flexible Earnings', desc: 'Set hourly or per‑session rates and adjust anytime.' },
                  { title: 'Smart Matching', desc: 'AI surfaces mentees that fit your domain & availability.' },
                  { title: 'Automated Summaries', desc: 'Each session auto‑summarized into actionable mentee tasks.' },
                  { title: 'Reputation & Badges', desc: 'Verified profile with impact, retention & quality metrics.' },
                  { title: 'Growth Analytics', desc: 'Track mentee progress, skill delta and roadmap completion.' },
                  { title: 'Protected Payments', desc: 'Secure escrow & instant payout after session confirmation.' },
                ].map(card => (
                  <div key={card.title} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
                    <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-bold">✓</div>
                    <h3 className="font-semibold text-sm md:text-base text-slate-900 dark:text-white mb-1 md:mb-2">{card.title}</h3>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Launch your mentor profile in minutes and start receiving curated mentee requests.</p>
              </div>
            </div>
          </section>
        </>
      ) : (
          // FREELANCER LANDING
          <>
            <section className="relative pt-12 md:pt-20 pb-16 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-6 md:mb-8 animate-fade-in">
                    <Zap size={12} className="fill-current" />
                    Compare~Insight~Improve
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
                    Set Your Goal<br/>
                  
                </h1>
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-16 max-w-4xl mx-auto leading-tight">
                    
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">
                    Steer Your Freelance Journey.
                    </span>
                </span>
                
                <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 mt-4 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
                   FairFound combines AI analysis and expert mentorship to build your personalized roadmap to the top 1% of freelancers.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
                    <button 
                    onClick={onStart}
                    className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base md:text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                    Start Free Analysis <ChevronRight size={18} className="md:w-5 md:h-5" />
                    </button>
                    {/* View Demo button removed */}
                </div>

                <div className="mt-10 md:mt-16 flex items-center justify-center gap-4 md:gap-8 text-slate-400 dark:text-slate-600 grayscale opacity-70 flex-wrap">
                    <span className="font-bold text-sm md:text-xl">Upwork</span>
                    <span className="font-bold text-sm md:text-xl">Fiverr</span>
                    <span className="font-bold text-sm md:text-xl">Toptal</span>
                    <span className="font-bold text-sm md:text-xl hidden sm:inline">Freelancer</span>
                </div>
                </div>
            </section>

             {/* Feature Grid */}
            <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Everything you need to level up</h2>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We don't just give you generic advice. We provide data-driven insights and tools to execute them.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg md:rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">Gap Analysis</h3>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                Compare your skills against live market data to find exactly what's holding you back from higher rates.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg md:rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">Dynamic Roadmaps</h3>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                Get a week-by-week plan to improve your portfolio, GitHub, and soft skills tailored to your niche.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 dark:bg-rose-900/30 rounded-lg md:rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <Users size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">Mentor Matching</h3>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                Connect with senior freelancers who have already walked your path for 1:1 guidance and code reviews.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg md:rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <Globe size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">Portfolio Builder</h3>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                Instantly generate a high-converting portfolio website populated with your GitHub projects and AI-enhanced descriptions.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg md:rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <Code size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">GitHub Audit</h3>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                We scan your code to identify quality issues, missing documentation, and opportunities to impress clients.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg md:rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 md:mb-3">Career Certification</h3>
                            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                Prove your skills with our verification badges and stand out in a crowded marketplace.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="text-center mb-10 md:mb-16">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Transparent Pricing</h2>
                  <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Start free. Upgrade only when you need advanced growth tooling and mentor access.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                  {/* Free Tier */}
                  <div className="rounded-xl md:rounded-2xl p-5 md:p-8 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4 md:mb-6">Core analysis tools to kickstart your freelancing journey.</p>
                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                      {[
                            'Unlimited & Detailed CV analysis',
                            'Unlimited AI roadmap generation',
                            'Portfolio analyzer powered by AI',
                            'AI insights and comparisons',
                            'Access to personalized chatbot'
                        ].map(f => (
                        <li key={f} className="flex items-start gap-2 md:gap-3">
                          <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[8px] md:text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">$0</div>
                    <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mb-4 md:mb-6">Always free • No credit card</div>
                    <button onClick={onStart} className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors text-sm md:text-base">Start Free</button>
                  </div>
                  {/* Paid Tier */}
                  <div className="rounded-xl md:rounded-2xl p-5 md:p-8 border border-indigo-600 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30 relative mt-4 md:mt-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wide">Most Popular</div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">Mentorship</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4 md:mb-6">Advanced AI tooling plus on-demand expert guidance.</p>
                    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                      {[
                            'Unlimited AI analysis & roadmap updates',
                            'Weekly progress + rate benchmarking',
                            'Mentor session booking & chat',
                            'Community access & leaderboards',
                            'Dynamic task customization',
                            'Hands-on mentoring and feedback'
                        ].map(f => (
                        <li key={f} className="flex items-start gap-2 md:gap-3">
                          <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-[8px] md:text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">$30-$200</span>
                      
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-400 mb-4 md:mb-6">Per mentorship </div>
                    <button onClick={onLogin} className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors text-sm md:text-base">Get Mentored</button>
                  </div>
                </div>
                {/* Mentor Pricing Explanation */}
                
              </div>
            </section>
          </>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-8 md:py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
                <img 
                  src="/icons/icon128.png" 
                  alt="FairFound Logo" 
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white">FairFound</span>
            </div>
            <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} FairFound Inc. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
