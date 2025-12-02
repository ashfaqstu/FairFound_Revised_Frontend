import React, { useState } from 'react';
import { Session, MentorAvailability, TimeSlot } from '../types';
import { 
  Calendar, Clock, Video, Check, X, MessageCircle, 
  ChevronLeft, ChevronRight, Filter, Search, Settings,
  User, Link as LinkIcon, ExternalLink
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
};

const MOCK_SESSIONS: Session[] = [
  {
    id: '1', menteeId: 'm1', menteeName: 'Alex Rivera', 
    menteeAvatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff',
    mentorId: 'mentor1', date: '2024-12-05', time: '14:00', duration: 45,
    topic: 'Code Review: Dashboard Project', status: 'pending'
  },
  {
    id: '2', menteeId: 'm2', menteeName: 'Sarah Jenkins',
    menteeAvatar: 'https://picsum.photos/200/200?random=13',
    mentorId: 'mentor1', date: '2024-12-06', time: '10:00', duration: 60,
    topic: 'Career Strategy Discussion', status: 'accepted', meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: '3', menteeId: 'm1', menteeName: 'Alex Rivera',
    menteeAvatar: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff',
    mentorId: 'mentor1', date: '2024-12-03', time: '15:00', duration: 30,
    topic: 'Initial Assessment', status: 'completed'
  },
  {
    id: '4', menteeId: 'm3', menteeName: 'Mike Chen',
    menteeAvatar: 'https://ui-avatars.com/api/?name=Mike+Chen&background=10b981&color=fff',
    mentorId: 'mentor1', date: '2024-12-07', time: '11:00', duration: 45,
    topic: 'Backend Architecture Review', status: 'pending'
  }
];

const MentorSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past'>('upcoming');
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [availability, setAvailability] = useState<MentorAvailability>({
    slots: [
      { day: 'monday', startTime: '09:00', endTime: '17:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'friday', startTime: '10:00', endTime: '15:00' }
    ],
    sessionDuration: 45,
    timezone: 'America/New_York'
  });

  const handleAcceptSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'accepted', meetingLink: 'https://meet.google.com/generated-link' } : s
    ));
  };

  const handleRejectSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'rejected' } : s
    ));
  };

  const handleCompleteSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, status: 'completed' } : s
    ));
  };

  const toggleDayAvailability = (day: typeof DAYS[number]) => {
    const hasDay = availability.slots.some(s => s.day === day);
    if (hasDay) {
      setAvailability(prev => ({
        ...prev,
        slots: prev.slots.filter(s => s.day !== day)
      }));
    } else {
      setAvailability(prev => ({
        ...prev,
        slots: [...prev.slots, { day, startTime: '09:00', endTime: '17:00' }]
      }));
    }
  };

  const updateSlotTime = (day: typeof DAYS[number], field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => ({
      ...prev,
      slots: prev.slots.map(s => s.day === day ? { ...s, [field]: value } : s)
    }));
  };

  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'past') return s.status === 'completed' || s.status === 'rejected' || s.status === 'cancelled';
    return s.status === 'accepted';
  });

  const pendingCount = sessions.filter(s => s.status === 'pending').length;

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Session Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your mentoring sessions and availability</p>
          </div>
          <button 
            onClick={() => setShowAvailabilityModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
          >
            <Settings size={18} />
            Set Availability
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
                <p className="text-xs text-slate-500">Pending Requests</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.filter(s => s.status === 'accepted').length}</p>
                <p className="text-xs text-slate-500">Upcoming Sessions</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Check size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{sessions.filter(s => s.status === 'completed').length}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Video size={20} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{availability.slots.length}</p>
                <p className="text-xs text-slate-500">Available Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {(['upcoming', 'pending', 'past'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">{pendingCount}</span>
                )}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
              </button>
            ))}
          </div>


          {/* Sessions List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400">No {activeTab} sessions</p>
              </div>
            ) : (
              filteredSessions.map(session => (
                <div key={session.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={session.menteeAvatar} alt={session.menteeName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{session.menteeName}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{session.topic}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(session.date)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {session.time}</span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {session.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleAcceptSession(session.id)}
                            className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                            title="Accept"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleRejectSession(session.id)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {session.status === 'accepted' && (
                        <>
                          {session.meetingLink && (
                            <a 
                              href={session.meetingLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                            >
                              <Video size={16} /> Join
                            </a>
                          )}
                          <button 
                            onClick={() => handleCompleteSession(session.id)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Mark Complete"
                          >
                            <Check size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Set Your Availability</h3>
              <button onClick={() => setShowAvailabilityModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Session Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Session Duration</label>
                <div className="flex gap-2">
                  {[30, 45, 60].map(duration => (
                    <button
                      key={duration}
                      onClick={() => setAvailability(prev => ({ ...prev, sessionDuration: duration }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        availability.sessionDuration === duration
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                <select 
                  value={availability.timezone}
                  onChange={(e) => setAvailability(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Available Days & Hours</label>
                <div className="space-y-3">
                  {DAYS.map(day => {
                    const slot = availability.slots.find(s => s.day === day);
                    const isActive = !!slot;
                    return (
                      <div key={day} className={`p-3 rounded-lg border transition-colors ${isActive ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleDayAvailability(day)}
                            className="flex items-center gap-3"
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isActive ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                              {isActive && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`font-medium capitalize ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                              {day}
                            </span>
                          </button>
                          
                          {isActive && slot && (
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateSlotTime(day, 'startTime', e.target.value)}
                                className="px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                              />
                              <span className="text-slate-400">to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateSlotTime(day, 'endTime', e.target.value)}
                                className="px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => setShowAvailabilityModal(false)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Save Availability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorSessions;
