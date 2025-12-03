
import React, { useState, useRef } from 'react';
import { AnalysisData, GamificationState, View } from '../types';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Trophy, TrendingUp, Target, DollarSign, Activity, Star, FileText, CheckCircle2, Lock, RefreshCw, Upload, Github, Globe, X, Loader2, CheckCircle } from 'lucide-react';

interface DashboardProps {
  analysis: AnalysisData | null;
  gamification: GamificationState;
  isDark: boolean;
  onNavigate: (view: View) => void;
  isSignedUp?: boolean;
  onSignup?: () => void;
  onReEvaluate?: (data: { githubUsername?: string; portfolioUrl?: string }) => Promise<void>;
  profile?: { name?: string; email?: string; skills?: string[]; experienceYears?: number; hourlyRate?: number; githubUsername?: string; portfolioUrl?: string } | null;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, gamification, isDark, onNavigate, isSignedUp = true, onSignup, onReEvaluate, profile }) => {
  const [showReEvalModal, setShowReEvalModal] = useState(false);
  const [reEvalStep, setReEvalStep] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState(profile?.githubUsername || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolioUrl || '');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when profile changes
  React.useEffect(() => {
    if (profile) {
      setGithubUrl(profile.githubUsername || '');
      setPortfolioUrl(profile.portfolioUrl || '');
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleReEvaluate = async () => {
    setReEvalStep('loading');
    setErrorMessage('');
    
    try {
      // Extract GitHub username from URL if full URL provided
      let githubUsername = githubUrl;
      if (githubUrl.includes('github.com/')) {
        githubUsername = githubUrl.split('github.com/')[1]?.split('/')[0] || githubUrl;
      }

      if (onReEvaluate) {
        await onReEvaluate({ 
          githubUsername: githubUsername || undefined, 
          portfolioUrl: portfolioUrl || undefined 
        });
      }
      
      setReEvalStep('success');
      
      // Close modal after success
      setTimeout(() => {
        setShowReEvalModal(false);
        setReEvalStep('form');
        setCvFile(null);
      }, 2000);
    } catch (error: any) {
      console.error('[DASHBOARD] Re-evaluation failed:', error);
      setErrorMessage(error.message || 'Failed to re-evaluate profile. Please try again.');
      setReEvalStep('error');
    }
  };

  // Render the modal even when there's no analysis
  const renderReEvalModal = () => {
    if (!showReEvalModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">{analysis ? 'Re-Evaluate Your Profile' : 'Generate Analysis'}</h3>
            </div>
            <button 
              onClick={() => {
                setShowReEvalModal(false);
                setReEvalStep('form');
                setCvFile(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {reEvalStep === 'form' && (
              <>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {analysis 
                    ? 'Update your GitHub or portfolio URL to get a fresh analysis of your freelance readiness.'
                    : 'Add your GitHub username and portfolio URL to generate your AI-powered profile analysis.'
                  }
                </p>

                {/* CV Upload */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Upload CV (PDF, DOC) - Optional
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      cvFile 
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle size={20} />
                        <span className="font-medium">{cvFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOC up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* GitHub URL */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    GitHub Username or URL
                  </label>
                  <div className="relative">
                    <Github size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="yourusername or https://github.com/yourusername"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>

                {/* Portfolio URL */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Portfolio Website URL
                  </label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mb-6">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Note:</strong> {analysis 
                      ? 'Re-evaluation will update your Global Readiness Score, skill gaps, and recommendations based on the new data.'
                      : 'Analysis will generate your Global Readiness Score, identify skill gaps, and provide personalized recommendations.'
                    }
                  </p>
                </div>

                <button
                  onClick={handleReEvaluate}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  {analysis ? 'Start Re-Evaluation' : 'Generate Analysis'}
                </button>
              </>
            )}

            {reEvalStep === 'loading' && (
              <div className="py-12 text-center">
                <Loader2 size={48} className="mx-auto mb-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Analyzing Your Profile...</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We're scanning your GitHub repos and portfolio to generate insights.
                </p>
                <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle size={16} className="text-emerald-500" /> Fetching profile data
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Loader2 size={16} className="text-indigo-500 animate-spin" /> Analyzing GitHub activity
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div> Generating AI insights
                  </div>
                </div>
              </div>
            )}

            {reEvalStep === 'success' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Analysis Complete!</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your profile has been analyzed. Check your new scores and recommendations!
                </p>
              </div>
            )}

            {reEvalStep === 'error' && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X size={32} className="text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Analysis Failed</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {errorMessage}
                </p>
                <button
                  onClick={() => setReEvalStep('form')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!analysis) {
    return (
      <>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="text-indigo-600 dark:text-indigo-400" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No Analysis Yet</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Generate your first AI-powered profile analysis to see your score, market position, and personalized recommendations.
            </p>
            <button 
              onClick={() => setShowReEvalModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Generate Analysis
            </button>
          </div>
        </div>
        {renderReEvalModal()}
      </>
    );
  }

  // Locked section wrapper for non-signed-up users
  const LockedSection: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
    if (isSignedUp) return <>{children}</>;
    
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 rounded-2xl">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              {title || 'Sign up to unlock'}
            </p>
            <button 
              onClick={onSignup}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  };

  const radarData = [
    { subject: 'Portfolio', A: analysis.metrics.portfolioScore, fullMark: 100 },
    { subject: 'GitHub', A: analysis.metrics.githubScore, fullMark: 100 },
    { subject: 'Comm.', A: analysis.metrics.communicationScore, fullMark: 100 },
    { subject: 'Tech Stack', A: analysis.metrics.techStackScore, fullMark: 100 },
    { subject: 'Market Fit', A: analysis.marketPercentile, fullMark: 100 },
  ];

  // Mock historical data for graph
  const growthData = [
    { name: 'Week 1', score: 40 },
    { name: 'Week 2', score: 55 },
    { name: 'Week 3', score: 65 },
    { name: 'Week 4', score: analysis.globalReadinessScore },
  ];

  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark ? '#1e293b' : '#f1f5f9';
  const radarGridColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Re-Evaluation Button */}
      {isSignedUp && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowReEvalModal(true)}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-2 border border-indigo-200 dark:border-indigo-800"
          >
            <RefreshCw size={18} />
            Re-Evaluate Profile
          </button>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Global Readiness</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{analysis.globalReadinessScore}/100</h3>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Trophy size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={16} className="mr-1" />
                <span>Top {100 - analysis.marketPercentile}% of peers</span>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Market Rate</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">${analysis.pricingSuggestion.recommended}/hr</h3>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={24} />
                </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Potential +${Math.round(analysis.pricingSuggestion.recommended - analysis.pricingSuggestion.current)} increase
            </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Level</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">Lvl {gamification.level}</h3>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <Star size={24} />
                </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 text-right">{gamification.xp} XP / Next Lvl</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Activity Streak</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{gamification.streak} Days</h3>
                </div>
                <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                    <Activity size={24} />
                </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Keep it up to earn the Fire Badge!</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart - Skill Analysis */}
        <LockedSection title="Unlock your competency analysis">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Target size={20} className="text-indigo-500 dark:text-indigo-400"/>
                  Competency Matrix
              </h3>
              <div className="h-[300px] w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                          <PolarGrid stroke={radarGridColor} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: chartTextColor, fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                              name="You"
                              dataKey="A"
                              stroke="#6366f1"
                              strokeWidth={2}
                              fill="#6366f1"
                              fillOpacity={isDark ? 0.3 : 0.4}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: 'none', 
                              backgroundColor: isDark ? '#1e293b' : '#fff',
                              color: isDark ? '#fff' : '#0f172a',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                            }}
                          />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </LockedSection>

        {/* Line Chart - Growth */}
        <LockedSection title="Unlock your growth insights">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <TrendingUp size={20} className="text-emerald-500 dark:text-emerald-400"/>
                      Growth Trajectory
                  </h3>
                  <select className="text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1 text-slate-600 dark:text-slate-300 outline-none">
                      <option>Last 30 Days</option>
                      <option>Last 3 Months</option>
                  </select>
              </div>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                          data={growthData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                          <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: chartTextColor, fontSize: 12}} />
                          <Tooltip 
                               contentStyle={{ 
                                  borderRadius: '8px', 
                                  border: 'none', 
                                  backgroundColor: isDark ? '#1e293b' : '#fff',
                                  color: isDark ? '#fff' : '#0f172a',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                               }}
                          />
                          <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
        </LockedSection>
      </div>

       {/* Weekly Report Card */}
       <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText size={32} className="text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Weekly Report Card</h3>
                    <p className="text-indigo-200 text-sm">Your performance summary for Oct 12 - Oct 19</p>
                </div>
            </div>
            
            <div className="flex gap-6">
                <div className="text-center">
                    <p className="text-indigo-200 text-xs uppercase font-semibold">Skills Improved</p>
                    <p className="text-2xl font-bold">+3</p>
                </div>
                <div className="text-center">
                    <p className="text-indigo-200 text-xs uppercase font-semibold">Profile Views</p>
                    <p className="text-2xl font-bold">142</p>
                </div>
                <div className="text-center">
                    <p className="text-indigo-200 text-xs uppercase font-semibold">Rank Change</p>
                    <div className="text-2xl font-bold flex items-center justify-center gap-1 text-emerald-300">
                        <TrendingUp size={16} /> +5%
                    </div>
                </div>
            </div>

            <button 
                onClick={() => onNavigate(View.INSIGHTS)}
                className="bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-transparent dark:border-slate-700"
            >
                View Full Report
            </button>
        </div>
      </div>

      {/* Quick Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LockedSection title="Unlock skill gap analysis">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
              <div className="relative z-10">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                      <Target size={18} className="text-indigo-500 dark:text-indigo-400" />
                      Priority Skill Gap: {analysis.skillGaps[0]}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                     Based on recent job postings in your niche, mastering this skill could increase your profile visibility by 35%.
                  </p>
                  <button 
                    onClick={() => onNavigate(View.ROADMAP)}
                    className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                      Add to Roadmap <TrendingUp size={14} />
                  </button>
              </div>
          </div>
        </LockedSection>

        <LockedSection title="Unlock action items">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400" />
                  Immediate Actions
               </h3>
               <ul className="space-y-3">
                  {analysis.weaknesses.slice(0, 3).map((weakness, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                          {weakness}
                      </li>
                  ))}
               </ul>
          </div>
        </LockedSection>
      </div>

      {/* Sign up CTA for non-signed-up users */}
      {!isSignedUp && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to unlock your full potential?</h3>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto">
            Sign up now to access your complete analysis, personalized roadmap, mentor matching, and all premium features.
          </p>
          <button 
            onClick={onSignup}
            className="bg-white text-indigo-700 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Sign Up Free — Unlock Everything
          </button>
        </div>
      )}

      {/* Re-Evaluation Modal */}
      {renderReEvalModal()}
    </div>
  );
};

export default Dashboard;
