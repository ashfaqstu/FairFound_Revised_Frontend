import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Lock, Flame, Target } from 'lucide-react';

interface CommunityProps {
  isSignedUp?: boolean;
  onSignup?: () => void;
}

interface CompletedTask {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  taskTitle: string;
  roadmapStep: string;
  mentorName: string;
  completedAt: string;
  timeAgo: string;
}

interface PodMember {
  id: string;
  name: string;
  avatar: string;
  title: string;
  tasksCompletedThisWeek: number;
  totalTasksCompleted: number;
  currentStreak: number;
  isMe?: boolean;
}

// Generate heatmap data for the last 52 weeks (full year like GitHub)
const generateHeatmapData = () => {
  const weeks = [];
  const today = new Date();
  
  for (let week = 51; week >= 0; week--) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * 7 + (6 - day)));
      
      // Random activity level (0-4) - more recent = more likely to have activity
      let level = 0;
      if (week < 40) {
        const rand = Math.random();
        if (rand > 0.75) level = 4;
        else if (rand > 0.55) level = 3;
        else if (rand > 0.35) level = 2;
        else if (rand > 0.15) level = 1;
      }
      
      days.push({
        date: date.toISOString().split('T')[0],
        level,
        count: level * 2
      });
    }
    weeks.push(days);
  }
  return weeks;
};


const Community: React.FC<CommunityProps> = ({ isSignedUp = true, onSignup }) => {
  const [heatmapData] = useState(generateHeatmapData());

  const [podMembers] = useState<PodMember[]>([
    { id: '1', name: 'You', avatar: 'bg-indigo-500', title: 'Frontend Developer', tasksCompletedThisWeek: 4, totalTasksCompleted: 28, currentStreak: 7, isMe: true },
    { id: '2', name: 'Sarah K.', avatar: 'bg-rose-500', title: 'Frontend Developer', tasksCompletedThisWeek: 6, totalTasksCompleted: 35, currentStreak: 12 },
    { id: '3', name: 'Mike C.', avatar: 'bg-emerald-500', title: 'React Developer', tasksCompletedThisWeek: 3, totalTasksCompleted: 22, currentStreak: 5 },
    { id: '4', name: 'Alex R.', avatar: 'bg-amber-500', title: 'Frontend Developer', tasksCompletedThisWeek: 5, totalTasksCompleted: 31, currentStreak: 9 },
    { id: '5', name: 'Jordan L.', avatar: 'bg-purple-500', title: 'UI Developer', tasksCompletedThisWeek: 2, totalTasksCompleted: 18, currentStreak: 3 },
  ]);

  const [recentActivity] = useState<CompletedTask[]>([
    { id: '1', memberId: '2', memberName: 'Sarah K.', memberAvatar: 'bg-rose-500', taskTitle: 'Build a responsive navbar component', roadmapStep: 'Master React Hooks', mentorName: 'Elena Rostova', completedAt: '2024-12-02T14:30:00', timeAgo: '2 hours ago' },
    { id: '2', memberId: '4', memberName: 'Alex R.', memberAvatar: 'bg-amber-500', taskTitle: 'Implement user authentication flow', roadmapStep: 'Build Portfolio Project', mentorName: 'Marcus Chen', completedAt: '2024-12-02T12:15:00', timeAgo: '4 hours ago' },
    { id: '3', memberId: '3', memberName: 'Mike C.', memberAvatar: 'bg-emerald-500', taskTitle: 'Create custom useDebounce hook', roadmapStep: 'Master React Hooks', mentorName: 'Elena Rostova', completedAt: '2024-12-02T10:00:00', timeAgo: '6 hours ago' },
    { id: '4', memberId: '2', memberName: 'Sarah K.', memberAvatar: 'bg-rose-500', taskTitle: 'Write unit tests for API service', roadmapStep: 'Testing Fundamentals', mentorName: 'Elena Rostova', completedAt: '2024-12-01T18:45:00', timeAgo: 'Yesterday' },
    { id: '5', memberId: '5', memberName: 'Jordan L.', memberAvatar: 'bg-purple-500', taskTitle: 'Design mobile-first layout', roadmapStep: 'Responsive Design', mentorName: 'Sarah Johnson', completedAt: '2024-12-01T16:20:00', timeAgo: 'Yesterday' },
    { id: '6', memberId: '4', memberName: 'Alex R.', memberAvatar: 'bg-amber-500', taskTitle: 'Optimize bundle size with code splitting', roadmapStep: 'Performance Optimization', mentorName: 'Marcus Chen', completedAt: '2024-12-01T14:00:00', timeAgo: 'Yesterday' },
    { id: '7', memberId: '1', memberName: 'You', memberAvatar: 'bg-indigo-500', taskTitle: 'Implement dark mode toggle', roadmapStep: 'Build Portfolio Project', mentorName: 'Elena Rostova', completedAt: '2024-12-01T11:30:00', timeAgo: '2 days ago' },
    { id: '8', memberId: '3', memberName: 'Mike C.', memberAvatar: 'bg-emerald-500', taskTitle: 'Set up CI/CD pipeline', roadmapStep: 'DevOps Basics', mentorName: 'Elena Rostova', completedAt: '2024-11-30T15:00:00', timeAgo: '2 days ago' },
  ]);

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

  const totalContributions = heatmapData.flat().reduce((sum, day) => sum + day.count, 0);
  const myTasksThisWeek = podMembers.find(m => m.isMe)?.tasksCompletedThisWeek || 0;
  const podAverage = Math.round(podMembers.reduce((sum, m) => sum + m.tasksCompletedThisWeek, 0) / podMembers.length);

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
            <p className="text-slate-500 dark:text-slate-400">Junior Frontend Developers • 5 members</p>
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
            {myTasksThisWeek < podAverage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Target size={14} className="text-amber-600 dark:text-amber-400" />
                <span className="text-sm text-amber-700 dark:text-amber-300">You're behind the pod average!</span>
              </div>
            )}
            {myTasksThisWeek >= podAverage && (
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
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {podMembers.sort((a, b) => b.tasksCompletedThisWeek - a.tasksCompletedThisWeek).map((member, index) => (
              <div key={member.id} className={`p-4 flex items-center gap-4 ${member.isMe ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                <span className="w-6 text-sm font-medium text-slate-400">#{index + 1}</span>
                <div className={`w-10 h-10 rounded-full ${member.avatar} flex items-center justify-center text-white font-bold`}>
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${member.isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                      {member.name}
                    </span>
                    {member.isMe && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded">YOU</span>}
                    {member.currentStreak >= 7 && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Flame size={10} /> {member.currentStreak} day streak
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{member.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{member.tasksCompletedThisWeek}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">this week</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Pod Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white">Recent Pod Activity</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">See what your pod members have been working on</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {recentActivity.map(activity => (
              <div key={activity.id} className={`p-4 ${activity.memberName === 'You' ? 'bg-indigo-50/30 dark:bg-indigo-900/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full ${activity.memberAvatar} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {activity.memberName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-sm ${activity.memberName === 'You' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                        {activity.memberName}
                      </span>
                      <span className="text-slate-400 text-sm">completed a task</span>
                      <span className="text-xs text-slate-400 ml-auto shrink-0">{activity.timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{activity.taskTitle}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Target size={12} /> {activity.roadmapStep}
                      </span>
                      <span>•</span>
                      <span>Mentor: {activity.mentorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
