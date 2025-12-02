
import React, { useEffect, useState } from 'react';
import { View, MentorReview } from '../types';
import { Users, Calendar, DollarSign, CheckCircle2, TrendingUp, Bell, Star, MessageCircle, ThumbsUp, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock reviews for the current mentor
const MENTOR_REVIEWS: MentorReview[] = [
  { id: 'r1', mentorId: 'me', reviewerId: 'u1', reviewerName: 'Alex Rivera', reviewerAvatar: 'bg-indigo-500', rating: 5, comment: 'Elena is an incredible mentor! Her guidance on product design helped me land a senior role. Highly recommend!', date: '2024-11-25', helpful: 12 },
  { id: 'r2', mentorId: 'me', reviewerId: 'u2', reviewerName: 'Sarah Jenkins', reviewerAvatar: 'bg-emerald-500', rating: 5, comment: 'Very knowledgeable and patient. She breaks down complex UX concepts into digestible pieces.', date: '2024-11-18', helpful: 8 },
  { id: 'r3', mentorId: 'me', reviewerId: 'u3', reviewerName: 'Mike Chen', reviewerAvatar: 'bg-rose-500', rating: 4, comment: 'Great mentor with practical advice. Sessions are always productive and insightful.', date: '2024-11-10', helpful: 5 },
  { id: 'r4', mentorId: 'me', reviewerId: 'u4', reviewerName: 'Jordan Lee', reviewerAvatar: 'bg-amber-500', rating: 5, comment: 'Elena helped me transition from junior to mid-level designer in just 3 months!', date: '2024-10-28', helpful: 15 },
  { id: 'r5', mentorId: 'me', reviewerId: 'u5', reviewerName: 'Taylor Kim', reviewerAvatar: 'bg-purple-500', rating: 4, comment: 'Very responsive and gives detailed feedback on portfolio reviews.', date: '2024-10-15', helpful: 6 },
];

interface MentorDashboardProps {
    onNavigate: (view: View) => void;
}

const MentorDashboard: React.FC<MentorDashboardProps> = ({ onNavigate }) => {
  const [activeMenteesCount, setActiveMenteesCount] = useState(12);
  const [newConnections, setNewConnections] = useState<any[]>([]);
  const [reviews, setReviews] = useState<MentorReview[]>(MENTOR_REVIEWS);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
      // Check for new connections from local storage
      const connections = JSON.parse(localStorage.getItem('fairfound_connections') || '[]');
      if (connections.length > 0) {
          setActiveMenteesCount(12 + connections.length);
          setNewConnections(connections);
      }
  }, []);

  const earningsData = [
    { name: 'Week 1', value: 450 },
    { name: 'Week 2', value: 720 },
    { name: 'Week 3', value: 680 },
    { name: 'Week 4', value: 1200 },
  ];

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const formatReviewDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mentor Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, Elena. Here is your daily overview.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            + New Session Slot
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Mentees</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{activeMenteesCount}</h3>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Users size={24} />
                </div>
            </div>
            <p className="mt-4 text-sm text-emerald-600 flex items-center gap-1">
                <TrendingUp size={14} /> +{newConnections.length > 0 ? newConnections.length + 2 : 2} this week
            </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Reviews</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">5</h3>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                    <CheckCircle2 size={24} />
                </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Needs attention
            </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Sessions</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">4</h3>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Calendar size={24} />
                </div>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Next: Today, 2:00 PM
            </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Earnings</p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">$3,050</h3>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={24} />
                </div>
            </div>
            <p className="mt-4 text-sm text-emerald-600 flex items-center gap-1">
                 +$450 this week
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
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Bell size={18} className="text-indigo-600" /> Recent Activity
              </h3>
              <div className="space-y-4">
                  {newConnections.slice(0, 4).map((conn, i) => (
                      <div key={`new-${i}`} className="flex gap-3 items-start pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0 bg-indigo-50/50 dark:bg-indigo-900/10 p-2 rounded-lg -mx-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                             <CheckCircle2 size={16} />
                          </div>
                          <div>
                              <p className="text-sm text-slate-800 dark:text-slate-200">
                                New mentee connected: <span className="font-bold">{conn.menteeName}</span>
                              </p>
                              <span className="text-xs text-slate-400 mt-1 block">Just now</span>
                          </div>
                      </div>
                  ))}
                  
                  {[1,2,3,4].slice(0, 4 - newConnections.length).map((i) => (
                      <div key={i} className="flex gap-3 items-start pb-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                             <img src={`https://picsum.photos/100/100?random=${i+10}`} className="w-full h-full rounded-full object-cover" alt="User"/>
                          </div>
                          <div>
                              <p className="text-sm text-slate-800 dark:text-slate-200">
                                <span className="font-bold">Alex Rivera</span> submitted a task: <span className="italic text-slate-500 dark:text-slate-400">React Components</span>
                              </p>
                              <span className="text-xs text-slate-400 mt-1 block">2 hours ago</span>
                          </div>
                      </div>
                  ))}
              </div>
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
            {[5, 4, 3, 2, 1].map(stars => {
              const count = reviews.filter(r => r.rating === stars).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{stars}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {(showAllReviews ? reviews : reviews.slice(0, 3)).map(review => (
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
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} 
                      />
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
