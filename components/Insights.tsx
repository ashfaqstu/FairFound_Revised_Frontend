import React, { useState, useEffect, useMemo } from 'react';
import { AnalysisData } from '../types';
import { insightsAPI, AIInsight } from '../services/api';
import { 
  ShieldAlert, ShieldCheck, Zap, TrendingUp, Lock, RefreshCw, 
  Bookmark, BookOpen, DollarSign, Target, Lightbulb, Star,
  ChevronDown, ChevronUp, Eye, PieChart as PieChartIcon, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InsightsProps {
  analysis: AnalysisData | null;
  isSignedUp?: boolean;
  onSignup?: () => void;
}

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const Insights: React.FC<InsightsProps> = ({ analysis, isSignedUp = true, onSignup }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const filters = [
    { id: 'all', label: 'All', icon: Target },
    { id: 'swot_analysis', label: 'SWOT', icon: ShieldCheck },
    { id: 'salary_comparison', label: 'Salary', icon: BarChart3 },
    { id: 'skill_demand', label: 'Skills', icon: PieChartIcon },
    { id: 'market_trend', label: 'Trends', icon: TrendingUp },
    { id: 'career_advice', label: 'Career', icon: Lightbulb },
    { id: 'learning_path', label: 'Learning', icon: BookOpen },
  ];

  // Extract special insights for charts
  const swotInsight = useMemo(() => 
    insights.find(i => i.insight_type === 'swot_analysis'), [insights]);
  const salaryInsight = useMemo(() => 
    insights.find(i => i.insight_type === 'salary_comparison'), [insights]);
  const skillDemandInsight = useMemo(() => 
    insights.find(i => i.insight_type === 'skill_demand'), [insights]);

  // Regular insights (excluding chart data)
  const regularInsights = useMemo(() => 
    insights.filter(i => !['swot_analysis', 'salary_comparison', 'skill_demand'].includes(i.insight_type)),
    [insights]
  );

  useEffect(() => {
    if (isSignedUp) {
      loadInsights();
    } else {
      setLoading(false);
    }
  }, [isSignedUp]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await insightsAPI.getInsights();
      setInsights(response.insights);
      setUnreadCount(response.unread_count);
    } catch (err) {
      console.error('[INSIGHTS] Error loading:', err);
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await insightsAPI.generateInsights();
      console.log(`[INSIGHTS] Generated ${response.insights_count} insights`);
      await loadInsights();
    } catch (err: any) {
      console.error('[INSIGHTS] Error generating:', err);
      setError(err.message || 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const markAsRead = async (insightId: number) => {
    try {
      await insightsAPI.updateInsight(insightId, { is_read: true });
      setInsights(prev => prev.map(i => 
        i.id === insightId ? { ...i, is_read: true } : i
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[INSIGHTS] Error marking as read:', err);
    }
  };

  const toggleBookmark = async (insightId: number, currentBookmark: boolean) => {
    try {
      await insightsAPI.updateInsight(insightId, { is_bookmarked: !currentBookmark });
      setInsights(prev => prev.map(i => 
        i.id === insightId ? { ...i, is_bookmarked: !currentBookmark } : i
      ));
    } catch (err) {
      console.error('[INSIGHTS] Error toggling bookmark:', err);
    }
  };

  const getInsightIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      market_trend: TrendingUp,
      skill_gap: ShieldAlert,
      career_advice: Lightbulb,
      learning_path: BookOpen,
      salary_insight: DollarSign,
      project_suggestion: Star,
      swot_analysis: ShieldCheck,
      salary_comparison: BarChart3,
      skill_demand: PieChartIcon,
    };
    return icons[type] || Target;
  };

  const getInsightColor = (type: string) => {
    const colors: Record<string, string> = {
      market_trend: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      skill_gap: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
      career_advice: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      learning_path: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
      salary_insight: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
      project_suggestion: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
      swot_analysis: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
      salary_comparison: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20',
      skill_demand: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  // Filter insights based on active filter
  const filteredInsights = useMemo(() => {
    if (activeFilter === 'all') return regularInsights;
    if (['swot_analysis', 'salary_comparison', 'skill_demand'].includes(activeFilter)) {
      return insights.filter(i => i.insight_type === activeFilter);
    }
    return regularInsights.filter(i => i.insight_type === activeFilter);
  }, [regularInsights, insights, activeFilter]);

  // Not signed up - show lock screen
  if (!isSignedUp) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="bg-indigo-600 p-4 rounded-full mb-4 inline-block shadow-lg shadow-indigo-500/30">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock AI Insights</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
            Sign up to get personalized AI-powered career insights, market trends, and learning recommendations.
          </p>
          <button 
            onClick={onSignup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Sign Up Free
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AI Career Insights</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Personalized recommendations powered by Gemini AI
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
        <button
          onClick={generateNewInsights}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : 'Generate Insights'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={16} />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={24} className="animate-spin text-indigo-600" />
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading insights...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && insights.length === 0 && (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
          <Lightbulb size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No insights yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Complete your profile analysis first, then generate AI insights to get personalized career recommendations.
          </p>
          <button
            onClick={generateNewInsights}
            disabled={generating}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Insights'}
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && insights.length > 0 && (
        <>
          {/* SWOT Analysis Section */}
          {(activeFilter === 'all' || activeFilter === 'swot_analysis') && swotInsight && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="text-cyan-600" size={24} />
                SWOT Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Strengths</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotInsight.metadata?.strengths as string[] || []).map((item, i) => (
                      <li key={i} className="flex gap-2 text-emerald-800 dark:text-emerald-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="text-rose-600 dark:text-rose-400" size={20} />
                    <h4 className="font-bold text-rose-900 dark:text-rose-200">Weaknesses</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotInsight.metadata?.weaknesses as string[] || []).map((item, i) => (
                      <li key={i} className="flex gap-2 text-rose-800 dark:text-rose-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="text-sky-600 dark:text-sky-400" size={20} />
                    <h4 className="font-bold text-sky-900 dark:text-sky-200">Opportunities</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotInsight.metadata?.opportunities as string[] || []).map((item, i) => (
                      <li key={i} className="flex gap-2 text-sky-800 dark:text-sky-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="text-amber-600 dark:text-amber-400" size={20} />
                    <h4 className="font-bold text-amber-900 dark:text-amber-200">Threats</h4>
                  </div>
                  <ul className="space-y-2">
                    {(swotInsight.metadata?.threats as string[] || []).map((item, i) => (
                      <li key={i} className="flex gap-2 text-amber-800 dark:text-amber-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {(activeFilter === 'all' || activeFilter === 'salary_comparison' || activeFilter === 'skill_demand') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Salary Comparison Chart */}
              {(activeFilter === 'all' || activeFilter === 'salary_comparison') && salaryInsight && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-violet-600" size={20} />
                    Global Salary Comparison ($/hr)
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salaryInsight.metadata?.salary_data as any[] || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'transparent'}} 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          formatter={(value: number) => [`$${value}/hr`, 'Rate']}
                        />
                        <Bar dataKey="salary" radius={[4, 4, 0, 0]}>
                          {(salaryInsight.metadata?.salary_data as any[] || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.active ? '#6366f1' : '#cbd5e1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-center text-sm text-slate-500">
                    <span className="font-medium text-indigo-600">Your Position:</span> {salaryInsight.metadata?.percentile}th percentile
                    <span className="mx-2">•</span>
                    <span className="font-medium text-green-600">Growth Potential:</span> {salaryInsight.metadata?.growth_potential}
                  </div>
                </div>
              )}

              {/* Skill Demand Pie Chart */}
              {(activeFilter === 'all' || activeFilter === 'skill_demand') && skillDemandInsight && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <PieChartIcon className="text-pink-600" size={20} />
                    Skill Demand Share
                  </h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={skillDemandInsight.metadata?.skill_demand as any[] || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(skillDemandInsight.metadata?.skill_demand as any[] || []).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.user_has ? CHART_COLORS[index % CHART_COLORS.length] : '#cbd5e1'} 
                              stroke={entry.user_has ? CHART_COLORS[index % CHART_COLORS.length] : '#cbd5e1'}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {(skillDemandInsight.metadata?.skill_demand as any[] || []).map((entry, index) => (
                      <div key={index} className="flex items-center gap-1.5 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{backgroundColor: entry.user_has ? CHART_COLORS[index % CHART_COLORS.length] : '#cbd5e1'}}
                        ></div>
                        <span className={entry.user_has ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>
                          {entry.name} {entry.user_has && '✓'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center text-sm text-slate-500">
                    <span className="font-medium text-indigo-600">Your Coverage:</span> {skillDemandInsight.metadata?.user_coverage || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular Insights Grid */}
          {filteredInsights.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredInsights.map((insight) => {
                const Icon = getInsightIcon(insight.insight_type);
                const colorClass = getInsightColor(insight.insight_type);
                const isExpanded = expandedInsight === insight.id;

                return (
                  <div
                    key={insight.id}
                    className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-lg ${
                      !insight.is_read ? 'border-l-4 border-l-indigo-500' : ''
                    }`}
                  >
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => {
                        setExpandedInsight(isExpanded ? null : insight.id);
                        if (!insight.is_read) markAsRead(insight.id);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">{insight.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                              {insight.insight_type.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(insight.id, insight.is_bookmarked);
                            }}
                            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                              insight.is_bookmarked ? 'text-yellow-500' : 'text-slate-400'
                            }`}
                          >
                            <Bookmark size={18} fill={insight.is_bookmarked ? 'currentColor' : 'none'} />
                          </button>
                          {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                        {insight.content.split('\n')[0]}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
                        {!insight.is_read && (
                          <span className="flex items-center gap-1 text-indigo-500">
                            <Eye size={12} /> New
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {insight.content.split('\n').map((line, idx) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <h4 key={idx} className="font-semibold text-slate-800 dark:text-white mt-4 mb-2">{line.slice(2, -2)}</h4>;
                            }
                            if (line.startsWith('- ') || line.startsWith('• ')) {
                              return <li key={idx} className="ml-4 text-slate-600 dark:text-slate-300">{line.slice(2)}</li>;
                            }
                            if (line.match(/^\d+\./)) {
                              return <li key={idx} className="ml-4 text-slate-600 dark:text-slate-300">{line}</li>;
                            }
                            return line ? <p key={idx} className="text-slate-600 dark:text-slate-300 mb-2">{line}</p> : <br key={idx} />;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Insights;
