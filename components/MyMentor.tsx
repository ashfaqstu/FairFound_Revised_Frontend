import React, { useState, useRef } from 'react';
import { Mentor, ChatMessage, RoadmapStep, Session, MentorReview } from '../types';
import { 
  Send, Paperclip, Mic, Phone, Video, MoreVertical,
  FileText, Image, X, Play, Pause, Calendar, Clock, Star,
  MessageSquare, Download, StopCircle, XCircle, Plus, Check, ExternalLink
} from 'lucide-react';

interface MyMentorProps {
  mentor: Mentor | null;
  onBack?: () => void;
  onCancelContract?: (review?: MentorReview) => void;
}

const MyMentor: React.FC<MyMentorProps> = ({ mentor, onCancelContract }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'sessions'>('chat');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', time: '', duration: 45, topic: '' });
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', menteeId: 'me', menteeName: 'Me', menteeAvatar: '', mentorId: 'm1', date: '2024-12-05', time: '15:00', duration: 45, topic: 'Code Review: Dashboard Project', status: 'accepted', meetingLink: 'https://meet.google.com/abc-defg' },
    { id: '2', menteeId: 'me', menteeName: 'Me', menteeAvatar: '', mentorId: 'm1', date: '2024-11-28', time: '14:00', duration: 60, topic: 'Career Strategy Discussion', status: 'completed' },
    { id: '3', menteeId: 'me', menteeName: 'Me', menteeAvatar: '', mentorId: 'm1', date: '2024-12-10', time: '10:00', duration: 30, topic: 'Portfolio Review', status: 'pending' },
  ]);

  // Mock data
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'mentor',
      text: "Hi! Welcome to our mentorship session. I've reviewed your profile and I'm excited to help you grow. Let's start by discussing your goals.",
      timestamp: '10:30 AM',
      isMe: false
    },
    {
      id: '2',
      senderId: 'me',
      text: "Thank you! I'm really looking forward to improving my React skills and landing better freelance projects.",
      timestamp: '10:32 AM',
      isMe: true
    },
    {
      id: '3',
      senderId: 'mentor',
      text: "Great goals! I've prepared a customized roadmap for you. Check the Tasks tab for your first assignments.",
      timestamp: '10:35 AM',
      isMe: false,
      attachments: [
        { id: 'a1', name: 'React_Roadmap_2024.pdf', type: 'file', url: '#', size: '2.4 MB' }
      ]
    },
    {
      id: '4',
      senderId: 'me',
      text: '',
      timestamp: '10:40 AM',
      isMe: true,
      isVoice: true,
      attachments: [
        { id: 'v1', name: 'Voice message', type: 'voice', url: '#', duration: '0:45' }
      ]
    }
  ]);

  const mockTasks: RoadmapStep[] = [
    { id: '1', title: 'Complete React Hooks Deep Dive', description: 'Watch the advanced hooks tutorial and build 3 custom hooks', duration: '1 week', status: 'in-progress', type: 'skill' },
    { id: '2', title: 'Portfolio Project: Dashboard App', description: 'Build a data visualization dashboard using React and Recharts', duration: '2 weeks', status: 'pending', type: 'project' },
    { id: '3', title: 'Update LinkedIn Profile', description: 'Optimize your profile with new skills and project showcases', duration: '2 days', status: 'pending', type: 'branding' },
  ];

  // Mentor's available hours (would come from mentor profile in real app)
  const mentorAvailability = {
    slots: [
      { day: 'monday', startTime: '09:00', endTime: '17:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'friday', startTime: '10:00', endTime: '15:00' }
    ],
    sessionDuration: 45
  };

  const handleBookSession = () => {
    if (!bookingData.date || !bookingData.time || !bookingData.topic) return;
    const newSession: Session = {
      id: `session-${Date.now()}`,
      menteeId: 'me',
      menteeName: 'Me',
      menteeAvatar: '',
      mentorId: mentor?.id || '',
      date: bookingData.date,
      time: bookingData.time,
      duration: bookingData.duration,
      topic: bookingData.topic,
      status: 'pending'
    };
    setSessions(prev => [newSession, ...prev]);
    setBookingData({ date: '', time: '', duration: 45, topic: '' });
    setShowBookingModal(false);
  };

  const handleCancelSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status: 'cancelled' } : s));
  };

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSessionStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      attachments: attachments.map((f, i) => ({
        id: `att-${i}`,
        name: f.name,
        type: f.type.startsWith('image') ? 'image' : 'file',
        url: URL.createObjectURL(f),
        size: `${(f.size / 1024).toFixed(1)} KB`
      }))
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and send voice message
      const voiceMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        isVoice: true,
        attachments: [{
          id: `voice-${Date.now()}`,
          name: 'Voice message',
          type: 'voice',
          url: '#',
          duration: `0:${recordingTime.toString().padStart(2, '0')}`
        }]
      };
      setMessages([...messages, voiceMessage]);
      setRecordingTime(0);
    }
    setIsRecording(!isRecording);
  };

  // Recording timer effect would go here in real implementation

  if (!mentor) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8">
          <MessageSquare size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Mentor Connected</h3>
          <p className="text-slate-500 dark:text-slate-400">Connect with a mentor to start your journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Mentor Info */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Mentor Profile Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={mentor.imageUrl} 
              alt={mentor.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900"
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{mentor.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{mentor.role}</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{mentor.company}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={14} className="fill-current" />
              <span className="font-medium">{mentor.rating}</span>
            </div>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">${mentor.rate}/hr</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
              <Video size={18} />
              Video Call
            </button>
            <button className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Phone size={18} />
              Voice Call
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          {(['chat', 'tasks', 'sessions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tasks' && (
            <div className="p-4 space-y-3">
              {mockTasks.map((task) => (
                <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      task.status === 'completed' ? 'bg-emerald-500' :
                      task.status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-300'
                    }`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{task.duration}</span>
                    <span className="capitalize">{task.status.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="p-4 space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className={`p-3 rounded-xl border ${
                  session.status === 'accepted' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
                    : session.status === 'pending'
                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getSessionStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                    <span className="text-xs text-slate-400">{session.duration} min</span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">{session.topic}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatSessionDate(session.date)}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {session.time}</span>
                  </div>
                  {/* Session Actions */}
                  <div className="flex gap-2 mt-2">
                    {session.status === 'accepted' && session.meetingLink && (
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                        <Video size={12} /> Join
                      </a>
                    )}
                    {(session.status === 'pending' || session.status === 'accepted') && (
                      <button onClick={() => handleCancelSession(session.id)}
                        className="flex-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setShowBookingModal(true)}
                className="w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Book New Session
              </button>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
              Chat history in main panel
            </div>
          )}
        </div>

        {/* Cancel Contract Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setShowCancelModal(true)}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
          >
            <XCircle size={18} />
            Cancel Contract
          </button>
        </div>
      </div>

      {/* Cancel Contract Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
              <h3 className="font-bold text-red-900 dark:text-red-200">Cancel Mentorship</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src={mentor.imageUrl} alt={mentor.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{mentor.name}</p>
                  <p className="text-sm text-slate-500">{mentor.role}</p>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Warning:</strong> Canceling your mentorship will end all scheduled sessions and you'll lose access to your current roadmap progress with this mentor.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Keep Mentor
                </button>
                <button 
                  onClick={() => {
                    setShowCancelModal(false);
                    setShowReviewModal(true); // Show review modal instead of immediately canceling
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Cancel Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal - shown after canceling */}
      {showReviewModal && mentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <Star size={20} className="text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Leave a Review</h3>
              </div>
              <button 
                onClick={() => {
                  setShowReviewModal(false);
                  onCancelContract?.(); // Cancel without review
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src={mentor.imageUrl} alt={mentor.name} className="w-14 h-14 rounded-full" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{mentor.name}</p>
                  <p className="text-sm text-slate-500">{mentor.role}</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                How was your experience with {mentor.name.split(' ')[0]}? Your review helps other freelancers find the right mentor.
              </p>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Rating</label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors ${
                          star <= (hoverRating || reviewRating) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-slate-500 mt-2">
                  {reviewRating === 1 && 'Poor'}
                  {reviewRating === 2 && 'Fair'}
                  {reviewRating === 3 && 'Good'}
                  {reviewRating === 4 && 'Very Good'}
                  {reviewRating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience working with this mentor..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-amber-500 dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowReviewModal(false);
                    onCancelContract?.(); // Cancel without review
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Skip
                </button>
                <button 
                  onClick={() => {
                    const review: MentorReview = {
                      id: Date.now().toString(),
                      mentorId: mentor.id,
                      reviewerId: 'current-user',
                      reviewerName: 'You',
                      reviewerAvatar: 'bg-slate-800',
                      rating: reviewRating,
                      comment: reviewComment,
                      date: new Date().toISOString(),
                      helpful: 0
                    };
                    setShowReviewModal(false);
                    setReviewRating(0);
                    setReviewComment('');
                    onCancelContract?.(review);
                  }}
                  disabled={reviewRating === 0}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Session Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Book a Session</h3>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Mentor Availability Info */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Mentor's Available Hours</p>
                <div className="flex flex-wrap gap-2">
                  {mentorAvailability.slots.map((slot, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded capitalize">
                      {slot.day}: {slot.startTime} - {slot.endTime}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session Topic</label>
                <input 
                  type="text" 
                  value={bookingData.topic} 
                  onChange={(e) => setBookingData({ ...bookingData, topic: e.target.value })}
                  placeholder="e.g., Code Review, Career Discussion" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={bookingData.date} 
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time</label>
                  <input 
                    type="time" 
                    value={bookingData.time} 
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                <div className="flex gap-2">
                  {[30, 45, 60].map(duration => (
                    <button
                      key={duration}
                      onClick={() => setBookingData({ ...bookingData, duration })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingData.duration === duration
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Note:</strong> Your booking request will be sent to {mentor.name} for approval. You'll be notified once they accept.
                </p>
              </div>

              <button 
                onClick={handleBookSession}
                disabled={!bookingData.date || !bookingData.time || !bookingData.topic}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                Request Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="font-medium text-slate-900 dark:text-white">Chat with {mentor.name}</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${msg.isMe ? 'order-2' : ''}`}>
                {/* Voice Message */}
                {msg.isVoice && msg.attachments?.[0] && (
                  <div className={`p-3 rounded-2xl ${
                    msg.isMe 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setPlayingVoice(playingVoice === msg.id ? null : msg.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          msg.isMe ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'
                        }`}
                      >
                        {playingVoice === msg.id ? (
                          <Pause size={18} className={msg.isMe ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} />
                        ) : (
                          <Play size={18} className={msg.isMe ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`h-1 rounded-full ${msg.isMe ? 'bg-white/30' : 'bg-slate-200 dark:bg-slate-600'}`}>
                          <div className={`h-full w-1/3 rounded-full ${msg.isMe ? 'bg-white' : 'bg-indigo-500'}`}></div>
                        </div>
                      </div>
                      <span className={`text-xs ${msg.isMe ? 'text-white/70' : 'text-slate-500'}`}>
                        {msg.attachments[0].duration}
                      </span>
                    </div>
                  </div>
                )}

                {/* Text Message */}
                {msg.text && (
                  <div className={`p-4 rounded-2xl ${
                    msg.isMe 
                      ? 'bg-indigo-600 text-white rounded-br-md' 
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                )}

                {/* File Attachments */}
                {msg.attachments && !msg.isVoice && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((att) => (
                      <div 
                        key={att.id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          msg.isMe 
                            ? 'bg-indigo-500/80' 
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {att.type === 'image' ? (
                          <Image size={20} className={msg.isMe ? 'text-white' : 'text-slate-500'} />
                        ) : (
                          <FileText size={20} className={msg.isMe ? 'text-white' : 'text-slate-500'} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${msg.isMe ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {att.name}
                          </p>
                          {att.size && (
                            <p className={`text-xs ${msg.isMe ? 'text-white/70' : 'text-slate-500'}`}>{att.size}</p>
                          )}
                        </div>
                        <button className={`p-1.5 rounded-lg ${msg.isMe ? 'hover:bg-white/10' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                          <Download size={16} className={msg.isMe ? 'text-white' : 'text-slate-500'} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className={`text-xs mt-1 ${msg.isMe ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2 flex-wrap">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <FileText size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeAttachment(index)} className="text-slate-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          {isRecording ? (
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 dark:text-red-400 font-medium">Recording... 0:{recordingTime.toString().padStart(2, '0')}</span>
              <div className="flex-1"></div>
              <button 
                onClick={toggleRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <StopCircle size={18} />
                Stop & Send
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Paperclip size={20} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button 
                onClick={toggleRecording}
                className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Mic size={20} />
              </button>

              <button 
                onClick={handleSend}
                disabled={!message.trim() && attachments.length === 0}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyMentor;
