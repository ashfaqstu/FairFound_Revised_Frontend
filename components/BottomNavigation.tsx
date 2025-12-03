import React, { useState } from 'react';
import { View, UserRole } from '../types';
import { 
  LayoutDashboard, Map, Lightbulb, Users, Globe, 
  GraduationCap, Calendar, MessageSquare, User
} from 'lucide-react';

interface BottomNavigationProps {
  currentView: View;
  onChangeView: (view: View) => void;
  userRole: UserRole;
  connectedMentor: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentView, 
  onChangeView, 
  userRole,
  connectedMentor 
}) => {
  const [showMentorMenu, setShowMentorMenu] = useState(false);

  // Freelancer navigation items (left to right): AI Insights, Roadmap, Overview (center), Mentor, Community
  const freelancerItems = [
    { id: View.INSIGHTS, label: 'Insights', icon: Lightbulb },
    { id: View.ROADMAP, label: 'Roadmap', icon: Map },
    { id: View.DASHBOARD, label: 'Overview', icon: LayoutDashboard, isCenter: true },
    { id: 'MENTOR_MENU', label: 'Mentor', icon: GraduationCap, hasMenu: true },
    { id: View.COMMUNITY, label: 'Community', icon: Globe },
  ];

  // Mentor navigation items
  const mentorItems = [
    { id: View.MENTOR_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, isCenter: true },
    { id: View.MENTOR_CLIENTS, label: 'Mentees', icon: Users },
    { id: View.MENTOR_SESSIONS, label: 'Sessions', icon: Calendar },
    { id: View.MENTOR_CHAT, label: 'Messages', icon: MessageSquare },
    { id: View.MENTOR_PROFILE, label: 'Profile', icon: User },
  ];

  const navItems = userRole === UserRole.MENTOR ? mentorItems : freelancerItems;

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'MENTOR_MENU') {
      setShowMentorMenu(!showMentorMenu);
    } else {
      setShowMentorMenu(false);
      onChangeView(item.id as View);
    }
  };

  const isActive = (itemId: string) => {
    if (itemId === 'MENTOR_MENU') {
      return currentView === View.MENTORS || currentView === View.MY_MENTOR;
    }
    return currentView === itemId;
  };

  return (
    <>
      {/* Mentor popup menu */}
      {showMentorMenu && userRole === UserRole.FREELANCER && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20" 
            onClick={() => setShowMentorMenu(false)}
          />
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden min-w-[160px]">
            <button
              onClick={() => {
                setShowMentorMenu(false);
                onChangeView(View.MENTORS);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                currentView === View.MENTORS 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Users size={18} />
              Find Mentor
            </button>
            <div className="border-t border-slate-100 dark:border-slate-800" />
            <button
              onClick={() => {
                setShowMentorMenu(false);
                onChangeView(View.MY_MENTOR);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                currentView === View.MY_MENTOR 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap size={18} />
              My Mentor
              {connectedMentor && (
                <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-all ${
                  item.isCenter ? 'px-1' : 'px-1'
                }`}
              >
                {item.isCenter ? (
                  // Center button (Overview/Dashboard) - larger and highlighted
                  <div className={`w-12 h-12 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    active 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    <Icon size={22} />
                  </div>
                ) : (
                  <>
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      active 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[10px] mt-0.5 font-medium ${
                      active 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
                
                {/* Active indicator dot */}
                {active && !item.isCenter && (
                  <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNavigation;
