import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Lock, Flame, Target, Loader2 } from 'lucide-react';
import { communityAPI, PodMember, HeatmapDay, ActivityItem } from '../services/communityService';

interface CommunityProps {
  isSignedUp?: boolean;
  onSignup?: () => void;
}

const Community: React.FC<CommunityProps> = ({ isSignedUp = true, onSignup }) => {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[][]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [podMembers, setPodMembers] = useState<PodMember[]>([]);
  const [mentorName, setMentorName] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (isSignedUp) {
      loadData();
    }
  }, [isSignedUp]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [podResponse, heatmapResponse, activityResponse] = await Promise.all([
        communityAPI.getPodMembers().catch(() => ({ members: [], mentor_name: null })),
        communityAPI.getHeatmapData().catch(() => ({ weeks: [], total_contributions: 0 })),
        communityAPI.getRecentActivity().catch(() => ({ activities: [] })),
      ]);
      
      setPodMembers(podResponse.members);
      setMentorName(podResponse.mentor_name);
      setHeatmapData(heatmapResponse.weeks);
      setTotalContributions(heatmapResponse.total_contributions);
      setRecentActivity(activityResponse.activities);
    } catch (err) {
      console.error('[COMMUNITY] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-slate-100 dark:bg-slate-800';
      case 1: return 'bg-emerald-200 dark:bg-emerald-900';
      case 2: return 'bg-emerald-400 dark:bg-emerald-700';
      case 3: return 'bg-emerald-500 dark:bg-emerald-600';
      case 4: return 'bg-emerald-600 dark:bg-emerald-500';
      default: return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const getAvatarUrl = (avatarUrl: string | null, name: string) => {
    if (avatarUrl) {
      return avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8000${avatarUrl}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
  };

  const myStats = podMembers.find(m => m.is_me);
  const myTasksThisWeek = myStats?.tasks_this_week || 0;
  const podAverage = podMembers.length > 0 
    ? Math.round(podMembers.reduce((sum, m) => sum + m.tasks_this_week, 0) / podMembers.length)
    : 0;

  if (loading && isSignedUp) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading community...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Pod</h2>
            <p className="text-slate-500 dark:text-slate-400">
              {mentorName ? `Mentor: ${mentorName}` : 'Connect with a mentor to join a pod'} • {podMembers.length} members
            </p>
          </div>
        </div>
      </div>

      <div className={`space-y-8 relative ${!isSignedUp ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {/* Activity Heatmap */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Your Activity</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{totalContributions} tasks completed in the last year</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400">Less</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div key={level} className={`w-3 h-3 rounded-sm ${getHeatmapColor(level)}`} />
                  ))}
                </div>
                <span className="text-slate-500 dark:text-slate-400">More</span>
              </div>
            </div>
          </div>
          
          {/* Heatmap Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${getHeatmapColor(day.level)} cursor-pointer hover:ring-1 hover:ring-slate-400`}
                      title={`${day.date}: ${day.count} tasks`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{myTasksThisWeek}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your tasks this week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{podAverage}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pod average</p>
            </div>
            {podMembers.length > 0 && myTasksThisWeek < podAverage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Target size={14} className="text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">You're behind the pod average!</span>
              </div>
            )}
            {podMembers.length > 0 && myTasksThisWeek >= podAverage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <Flame size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-emerald-700 dark:text-emerald-300">You're on track! Keep it up!</span>
              </div>
            )}
          </div>
        </div>

        {/* Pod Members */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Pod Members</h3>
          </div>
          {podMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>Connect with a mentor to join a pod with other freelancers</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {podMembers.sort((a, b) => b.tasks_this_week - a.tasks_this_week).map((member, index) => (
                <div key={member.id} className={`p-4 flex items-center gap-4 ${member.is_me ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                  <span className="w-6 text-sm font-medium text-slate-400">#{index + 1}</span>
                  <img 
                    src={getAvatarUrl(member.avatar_url, member.name)} 
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${member.is_me ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                        {member.is_me ? 'You' : member.name}
                      </span>
                      {member.is_me && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">YOU</span>}
                      {member.streak >= 7 && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Flame size={10} /> {member.streak} day streak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{member.tasks_this_week}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">this week</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pod Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Pod Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">See what your pod members have been working on</p>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p>No recent activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {recentActivity.map(activity => (
                <div key={activity.id} className={`p-4 ${activity.is_me ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <img 
                      src={getAvatarUrl(activity.user_avatar, activity.user_name)} 
                      alt={activity.user_name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${activity.is_me ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                          {activity.is_me ? 'You' : activity.user_name}
                        </span>
                        <span className="text-slate-400 text-sm">completed a task</span>
                        <span className="text-xs text-slate-400 ml-auto shrink-0">{activity.time_ago}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{activity.task_title}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Target size={12} /> {activity.step_title}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Motivation Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Your pod is counting on you!</h3>
              <p className="text-indigo-100 text-sm">Complete your tasks regularly to stay on top of the leaderboard and inspire your peers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Locked overlay for non-signed-up users */}
      {!isSignedUp && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm z-20 rounded-2xl">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Join Your Accountability Pod</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Sign up to join a pod of peers with similar skills and stay accountable together.
            </p>
            <button 
              onClick={onSignup}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
