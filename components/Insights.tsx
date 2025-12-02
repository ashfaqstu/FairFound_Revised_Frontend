
import React from 'react';
import { AnalysisData } from '../types';
import { ShieldAlert, ShieldCheck, Zap, TrendingUp, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InsightsProps {
  analysis: AnalysisData;
  isSignedUp?: boolean;
  onSignup?: () => void;
}

const Insights: React.FC<InsightsProps> = ({ analysis, isSignedUp = true, onSignup }) => {
  
  const salaryData = [
    { name: 'Junior', salary: 45 },
    { name: 'Mid-Level', salary: 75 },
    { name: 'You', salary: analysis.pricingSuggestion.current, active: true },
    { name: 'Senior', salary: 120 },
    { name: 'Top 1%', salary: 180 },
  ];

  const skillDemandData = [
    { name: 'React', value: 400 },
    { name: 'Node.js', value: 300 },
    { name: 'Python', value: 300 },
    { name: 'Design', value: 200 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e'];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AI Career Insights</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Deep dive analysis into your market positioning.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Strengths</h3>
            </div>
            <ul className="space-y-3">
                {analysis.strengths.map((item, i) => (
                    <li key={i} className="flex gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="text-rose-600 dark:text-rose-400" />
                <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">Weaknesses</h3>
            </div>
            <ul className="space-y-3">
                {analysis.weaknesses.map((item, i) => (
                    <li key={i} className="flex gap-3 text-rose-800 dark:text-rose-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>

        {/* Opportunities */}
        <div className="bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-lg font-bold text-sky-900 dark:text-sky-200">Opportunities</h3>
            </div>
            <ul className="space-y-3">
                {analysis.opportunities.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sky-800 dark:text-sky-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>

        {/* Threats */}
        <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">Market Threats</h3>
            </div>
            <ul className="space-y-3">
                {analysis.threats.map((item, i) => (
                    <li key={i} className="flex gap-3 text-amber-800 dark:text-amber-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0"></span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
      </div>

      {/* Pricing & Charts Section - Combined locked area */}
      <div className="relative">
        <div className={`space-y-8 ${!isSignedUp ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {/* Pricing Deep Dive */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Pricing Strategy</h3>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {analysis.pricingSuggestion.reasoning}
                    </p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Pro Tip</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Freelancers with a dedicated personal website and case studies charge on average 25% more than those with just a CV.
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-64 bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-6 text-center shadow-lg dark:border dark:border-slate-700">
                    <p className="text-slate-400 text-sm mb-1">Recommended Rate</p>
                    <div className="text-4xl font-bold text-indigo-400 mb-2">${analysis.pricingSuggestion.recommended}</div>
                    <p className="text-xs text-slate-500">per hour</p>
                    <div className="mt-4 pt-4 border-t border-slate-800 dark:border-slate-700">
                        <p className="text-xs text-slate-400">Current: ${analysis.pricingSuggestion.current}/hr</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Salary Chart */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Global Salary Comparison ($/hr)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="salary" radius={[4, 4, 0, 0]}>
                        {salaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.active ? '#6366f1' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Demand Chart */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Skill Demand Share (Your Niche)</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillDemandData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {skillDemandData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    {skillDemandData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-slate-500">
                         <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                         {entry.name}
                      </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        {/* Single Sign Up Overlay for non-signed-up users */}
        {!isSignedUp && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm z-10 rounded-2xl">
              <div className="bg-indigo-600 p-4 rounded-full mb-4 shadow-lg shadow-indigo-500/30">
                  <Lock className="text-white w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock Full Insights</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-center max-w-md px-4">
                  Sign up to access pricing recommendations, salary comparisons, and market trends.
              </p>
              <button 
                onClick={onSignup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                Sign Up Free
              </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Insights;
