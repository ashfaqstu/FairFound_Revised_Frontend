import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, UserRole } from '../types';
import {
  Search,
  Home,
  Map,
  Users,
  Lightbulb,
  MessageSquare,
  User,
  LogOut,
  CreditCard,
  Command,
  ArrowRight,
  Sparkles,
  Calendar,
  Moon,
  Sun,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'action' | 'settings';
  keywords?: string[];
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  onSignOut: () => void;
  userRole: UserRole;
  isPro: boolean;
  isDark: boolean;
  toggleTheme: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSignOut,
  userRole,
  isPro,
  isDark,
  toggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Define all commands
  const allCommands: CommandItem[] = useMemo(() => {
    const freelancerCommands: CommandItem[] = [
      {
        id: 'dashboard',
        title: 'Go to Dashboard',
        description: 'View your overview and stats',
        icon: <Home size={18} />,
        action: () => onNavigate(View.DASHBOARD),
        category: 'navigation',
        keywords: ['home', 'overview', 'stats'],
        shortcut: 'G D',
      },
      {
        id: 'roadmap',
        title: 'Go to Roadmap',
        description: 'View your learning path',
        icon: <Map size={18} />,
        action: () => onNavigate(View.ROADMAP),
        category: 'navigation',
        keywords: ['learning', 'path', 'skills', 'progress'],
        shortcut: 'G R',
      },
      {
        id: 'mentors',
        title: 'Browse Mentors',
        description: 'Find and connect with mentors',
        icon: <Users size={18} />,
        action: () => onNavigate(View.MENTORS),
        category: 'navigation',
        keywords: ['mentor', 'coach', 'guidance', 'help'],
        shortcut: 'G M',
      },
      {
        id: 'insights',
        title: 'View Insights',
        description: 'AI-powered career insights',
        icon: <Lightbulb size={18} />,
        action: () => onNavigate(View.INSIGHTS),
        category: 'navigation',
        keywords: ['ai', 'analysis', 'recommendations', 'swot'],
        shortcut: 'G I',
      },

      {
        id: 'community',
        title: 'Community',
        description: 'Connect with other freelancers',
        icon: <MessageSquare size={18} />,
        action: () => onNavigate(View.COMMUNITY),
        category: 'navigation',
        keywords: ['community', 'forum', 'discuss', 'network'],
      },
      {
        id: 'profile',
        title: 'My Profile',
        description: 'Edit your profile settings',
        icon: <User size={18} />,
        action: () => onNavigate(View.PROFILE),
        category: 'navigation',
        keywords: ['profile', 'settings', 'account', 'edit'],
        shortcut: 'G S',
      },
      {
        id: 'pricing',
        title: 'Pricing Plans',
        description: 'View subscription options',
        icon: <CreditCard size={18} />,
        action: () => onNavigate(View.PRICING),
        category: 'navigation',
        keywords: ['pricing', 'plans', 'subscription', 'pro', 'upgrade'],
      },
    ];

    const mentorCommands: CommandItem[] = [
      {
        id: 'mentor-dashboard',
        title: 'Mentor Dashboard',
        description: 'View your mentor overview',
        icon: <Home size={18} />,
        action: () => onNavigate(View.MENTOR_DASHBOARD),
        category: 'navigation',
        keywords: ['home', 'overview', 'stats'],
        shortcut: 'G D',
      },
      {
        id: 'mentor-clients',
        title: 'My Mentees',
        description: 'Manage your mentees',
        icon: <Users size={18} />,
        action: () => onNavigate(View.MENTOR_CLIENTS),
        category: 'navigation',
        keywords: ['mentees', 'clients', 'students'],
        shortcut: 'G C',
      },
      {
        id: 'mentor-sessions',
        title: 'Sessions',
        description: 'View and manage sessions',
        icon: <Calendar size={18} />,
        action: () => onNavigate(View.MENTOR_SESSIONS),
        category: 'navigation',
        keywords: ['sessions', 'meetings', 'calendar', 'schedule'],
        shortcut: 'G S',
      },
      {
        id: 'mentor-profile',
        title: 'Mentor Profile',
        description: 'Edit your mentor profile',
        icon: <User size={18} />,
        action: () => onNavigate(View.MENTOR_PROFILE),
        category: 'navigation',
        keywords: ['profile', 'settings', 'account'],
      },
    ];

    const actionCommands: CommandItem[] = [
      {
        id: 'toggle-theme',
        title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        description: 'Toggle color theme',
        icon: isDark ? <Sun size={18} /> : <Moon size={18} />,
        action: () => { toggleTheme(); onClose(); },
        category: 'settings',
        keywords: ['theme', 'dark', 'light', 'mode', 'color'],
        shortcut: 'T',
      },
      {
        id: 'sign-out',
        title: 'Sign Out',
        description: 'Log out of your account',
        icon: <LogOut size={18} />,
        action: () => { onSignOut(); onClose(); },
        category: 'settings',
        keywords: ['logout', 'sign out', 'exit'],
      },
    ];

    return [
      ...(userRole === UserRole.MENTOR ? mentorCommands : freelancerCommands),
      ...actionCommands,
    ];
  }, [userRole, isPro, isDark, onNavigate, onSignOut, toggleTheme, onClose]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    
    const lowerQuery = query.toLowerCase();
    return allCommands.filter(cmd => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords?.some(k => k.includes(lowerQuery));
      return titleMatch || descMatch || keywordMatch;
    });
  }, [query, allCommands]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    settings: filteredCommands.filter(c => c.category === 'settings'),
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <Search size={20} className="text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm"
            />
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">ESC</kbd>
              <span>to close</span>
            </div>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Sparkles size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500">No commands found</p>
                <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                {groupedCommands.navigation.length > 0 && (
                  <>
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Navigation</span>
                    </div>
                    {groupedCommands.navigation.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      return (
                        <CommandItem
                          key={cmd.id}
                          command={cmd}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => { cmd.action(); onClose(); }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        />
                      );
                    })}
                  </>
                )}
                
                {groupedCommands.settings.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 mt-2">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Settings</span>
                    </div>
                    {groupedCommands.settings.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      return (
                        <CommandItem
                          key={cmd.id}
                          command={cmd}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => { cmd.action(); onClose(); }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        />
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono">↵</kbd>
                select
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Command size={12} />
              <span>K to open</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Individual command item component
const CommandItem: React.FC<{
  command: CommandItem;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}> = ({ command, isSelected, onClick, onMouseEnter }) => (
  <button
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
      isSelected 
        ? 'bg-indigo-50 dark:bg-indigo-900/30' 
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${
      isSelected 
        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
    }`}>
      {command.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium ${
        isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'
      }`}>
        {command.title}
      </p>
      {command.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {command.description}
        </p>
      )}
    </div>
    {command.shortcut && (
      <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono text-slate-400">
        {command.shortcut}
      </kbd>
    )}
    {isSelected && (
      <ArrowRight size={14} className="text-indigo-500 dark:text-indigo-400" />
    )}
  </button>
);

export default CommandPalette;
