import React, { useEffect, useState } from 'react';
import { View, MentorReview } from '../types';
import {
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Bell,
  Star,
  ThumbsUp,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mentorDashboardAPI, MenteeData, mapMenteeToFrontend, MentorReviewData, SessionData } from '../services/mentorDashboardService';

interface MentorDashboardProps {
  onNavigate: (view: View) => void;
}

const MentorDashboard: React.FC<MentorDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState<MenteeData[]>([]);
  const [reviews, setReviews] = useState<MentorReview[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [stats, setStats] = useState({
    activeMentees: 0,
    pendingReviews: 0,
    upcomingSessions: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch mentees
      const menteesData = await mentorDashboardAPI.getMentees();
      setMentees(menteesData);
      
      // Calculate stats
      const pendingTasks = menteesData.reduce(
        (acc, m) => acc + (m.tasks?.filter(t => t.status === 'review').length || 0),
        0
      );
      
      // Fetch sessions to get upcoming count
      let upcomingSessions = 0;
      try {
        const sessionsData = await mentorDashboardAPI.getSessions();
        upcomingSessions = sessionsData.filter(s => s.status === 'accepted').length;
      } catch {
        console.log('[MENTOR DASHBOARD] Could not fetch sessions');
      }
      
      setStats({
        activeMentees: menteesData.length,
        pendingReviews: pendingTasks,
        upcomingSessions,
        totalEarnings: menteesData.length * 150, // Estimate based on mentee count
      });

      // Load reviews from backend
      try {
        const reviewsData = await mentorDashboardAPI.getReviews();
        const mappedReviews: MentorReview[] = reviewsData.map((r: MentorReviewData) => ({
          id: String(r.id),
          mentorId: String(r.mentor),
          reviewerId: String(r.reviewer),
          reviewerName: r.reviewer_name,
          reviewerAvatar: r.reviewer_avatar || getRandomAvatarColor(),
          rating: r.rating,
          comment: r.comment,
          date: r.created_at.split('T')[0],
          helpful: r.helpful,
        }));
        setReviews(mappedReviews);
      } catch {
        console.log('[MENTOR DASHBOARD] Could not fetch reviews, using empty list');
        setReviews([]);
      }
    } catch (err) {
      console.error('[MENTOR DASHBOARD] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomAvatarColor = () => {
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const earningsData = [
    { name: 'Week 1', value: 450 },
    { name: 'Week 2', value: 720 },
    { name: 'Week 3', value: 680 },
    { name: 'Week 4', value: stats.totalEarnings > 0 ? stats.totalEarnings : 1200 },
  ];

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const formatReviewDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mentor Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's your overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Mentees</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.activeMentees}</h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Users size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> Connected via FairFound
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Reviews</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.pendingReviews}</h3>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Tasks awaiting feedback</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Sessions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.upcomingSessions}</h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Calendar size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">This week</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Earnings</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">${stats.totalEarnings.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm text-emerald-600 flex items-center gap-1">
            <TrendingUp size={14} /> This month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Earnings Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Mentees */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={18} className="text-indigo-600" /> Recent Mentees
          </h3>
          <div className="space-y-4">
            {mentees.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No mentees connected yet</p>
            ) : (
              mentees.slice(0, 4).map((mentee) => {
                const mapped = mapMenteeToFrontend(mentee);
                return (
                  <div key={mentee.id} className="flex gap-3 items-start pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                    <img src={mapped.avatarUrl} alt={mapped.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{mapped.name}</p>
                      <p className="text-xs text-slate-500">{mapped.title}</p>
                    </div>
                    <span className="text-xs text-slate-400">{mapped.progress}%</span>
                  </div>
                );
              })
            )}
          </div>
          {mentees.length > 0 && (
            <button
              onClick={() => onNavigate(View.MENTOR_CLIENTS)}
              className="w-full mt-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center justify-center gap-1"
            >
              View All Mentees <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Star size={20} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Your Reviews</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">See what your mentees are saying</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star size={20} className="text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-500">{reviews.length} total reviews</p>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{stars}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
            <div key={review.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${review.reviewerAvatar} flex items-center justify-center text-white font-bold text-sm`}>
                  {review.reviewerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-900 dark:text-white">{review.reviewerName}</h5>
                    <span className="text-xs text-slate-400">{formatReviewDate(review.date)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <ThumbsUp size={12} /> {review.helpful} found this helpful
                </span>
              </div>
            </div>
          ))}
        </div>

        {reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="w-full mt-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
            <ChevronRight size={16} className={`transition-transform ${showAllReviews ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
