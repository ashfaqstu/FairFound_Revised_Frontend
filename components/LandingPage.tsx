
import React, { useState } from 'react';
import { ChevronRight, TrendingUp, Users, ShieldCheck, Zap, BarChart3, Globe, Code } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
  onMentorLogin: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin, onMentorLogin, isDark, toggleTheme }) => {
  const [isMentorMode, setIsMentorMode] = useState(false);
  const [mentorAuthTab, setMentorAuthTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMentorMode(false)}>
            <img 
              src="/images/icon48.png" 
              alt="FairFound Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FairFound</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsMentorMode(!isMentorMode)}
                className={`font-medium text-sm transition-colors px-3 py-2 rounded-lg ${isMentorMode ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              {isMentorMode ? 'For Freelancers' : 'For Mentors'}
            </button>
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            {!isMentorMode && (
              <button 
                onClick={onLogin}
                className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      {isMentorMode ? (
          // MENTOR LANDING & LOGIN
          <section className="relative pt-20 pb-32 min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50/50 dark:bg-emerald-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
             </div>
             
             <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide mb-8">
                        <Users size={12} className="fill-current" />
                        FairFound for Mentors
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                        Turn your experience into <span className="text-emerald-600 dark:text-emerald-400">Income.</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Mentor the next generation of top freelancers. Manage sessions, assign tasks, and track mentee growth all in one dashboard.
                    </p>
                    <ul className="space-y-4 mb-10">
                        {['Set your own rates', 'Curated mentee matches', 'AI-assisted task generation', 'Automated scheduling'].map(feat => (
                            <li key={feat} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck size={12} />
                                </div>
                                {feat}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full mx-auto">
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                            <input type="email" placeholder="you@company.com" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                        </div>
                        <button 
                            onClick={onMentorLogin}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none mt-2"
                        >
                            Access Dashboard
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            Don't have an account? <button onClick={() => setMentorAuthTab('signup')} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Sign up</button>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                            <input type="text" placeholder="John" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                            <input type="text" placeholder="Doe" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                          </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Work Email</label>
                            <input type="email" placeholder="you@company.com" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                            <input type="text" placeholder="Senior Developer at Google" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                        </div>
                        <button 
                            onClick={onMentorLogin}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-200 dark:shadow-none mt-2"
                        >
                            Create Mentor Account
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
      ) : (
          // FREELANCER LANDING
          <>
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide mb-8 animate-fade-in">
                    <Zap size={12} className="fill-current" />
                    Accelerate Your Freelancing Career
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
                    Get Mentored.<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">
                    Rank Higher.
                    </span>
                </h1>
                
                <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    FairFound analyzes your portfolio, GitHub, and skills to build a personalized roadmap to the top 1% of freelancers.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                    onClick={onStart}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                    Start Free Analysis <ChevronRight size={20} />
                    </button>
                    {/* View Demo button removed */}
                </div>

                <div className="mt-16 flex items-center justify-center gap-8 text-slate-400 dark:text-slate-600 grayscale opacity-70">
                    <span className="font-bold text-xl">Upwork</span>
                    <span className="font-bold text-xl">Fiverr</span>
                    <span className="font-bold text-xl">Toptal</span>
                    <span className="font-bold text-xl">Freelancer</span>
                </div>
                </div>
            </section>

             {/* Feature Grid */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need to level up</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We don't just give you generic advice. We provide data-driven insights and tools to execute them.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Gap Analysis</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Compare your skills against live market data to find exactly what's holding you back from higher rates.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Dynamic Roadmaps</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Get a week-by-week plan to improve your portfolio, GitHub, and soft skills tailored to your niche.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mentor Matching</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Connect with senior freelancers who have already walked your path for 1:1 guidance and code reviews.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Portfolio Builder</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Instantly generate a high-converting portfolio website populated with your GitHub projects and AI-enhanced descriptions.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                <Code size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">GitHub Audit</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                We scan your code to identify quality issues, missing documentation, and opportunities to impress clients.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Career Certification</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                Prove your skills with our verification badges and stand out in a crowded marketplace.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
          </>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <img 
                  src="/images/icon48.png" 
                  alt="FairFound Logo" 
                  className="w-6 h-6"
                />
                <span className="font-bold text-slate-900 dark:text-white">FairFound</span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} FairFound Inc. All rights reserved.
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
