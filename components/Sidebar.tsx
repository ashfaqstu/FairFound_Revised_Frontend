import React from 'react';
import { View, UserRole } from '../types';
import { 
  LayoutDashboard, Map, Users, Lightbulb, Briefcase, 
  User, CreditCard, MessageSquare, Calendar, GraduationCap, Globe
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isPro: boolean;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isPro, userRole }) => {
  // Main menu items for freelancers
  const freelancerMainItems = [
    { id: View.DASHBOARD, label: 'Overview', icon: LayoutDashboard },
    { id: View.INSIGHTS, label: 'AI Insights', icon: Lightbulb },
    { id: View.ROADMAP, label: 'My Roadmap', icon: Map },
    { id: View.MENTORS, label: 'Find Mentors', icon: Briefcase },
    { id: View.MY_MENTOR, label: 'My Mentor', icon: GraduationCap },
    { id: View.COMMUNITY, label: 'Community', icon: Globe },
    { id: View.PROFILE, label: 'My Profile', icon: User },
  ];

  const mentorItems = [
    { id: View.MENTOR_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.MENTOR_CLIENTS, label: 'My Mentees', icon: Users },
    { id: View.MENTOR_SESSIONS, label: 'Sessions', icon: Calendar },
    { id: View.MENTOR_CHAT, label: 'Messages', icon: MessageSquare },
    { id: View.MENTOR_PROFILE, label: 'Mentor Profile', icon: User },
  ];

  const mainMenuItems = userRole === UserRole.MENTOR ? mentorItems : freelancerMainItems;

  return (
    <div className="w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 shadow-2xl z-20 hidden md:flex transition-colors duration-300">
      <div className="p-6">
        <div 
          className="flex items-center gap-2 mb-8 cursor-pointer"
          onClick={() => onChangeView(userRole === UserRole.MENTOR ? View.MENTOR_DASHBOARD : View.DASHBOARD)}
        >
          <img 
            src="/icons/icon128.png" 
            alt="FairFound Logo" 
            className="w-8 h-8"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight leading-none">FairFound</span>
            {userRole === UserRole.MENTOR && <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">Mentor</span>}
          </div>
          {isPro && userRole === UserRole.FREELANCER && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 ml-auto">PRO</span>}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Main Menu Items */}
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}

      </nav>

      {/* Bottom Section - Pro Badge Only (No Sign Out) */}
      {userRole === UserRole.FREELANCER && isPro && (
        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-700/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard size={14}/>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-emerald-300">Mentor Connected</h4>
              <p className="text-[10px] text-slate-400">Full access unlocked</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
