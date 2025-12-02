import React, { useState, useRef } from 'react';
import { Chat, ChatMessage, ChatAttachment } from '../types';
import { 
  Send, MoreVertical, Search, Phone, Video, Paperclip, Mic, 
  FileText, Image, X, Play, Pause, Download, StopCircle,
  Calendar, Clock, ListTodo
} from 'lucide-react';

interface ChatSystemProps {
  currentUser: { id: string; name: string };
  role: 'FREELANCER' | 'MENTOR';
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    participant: { id: 'f1', name: 'Alex Rivera', avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff', role: 'Mentee' },
    lastMessage: 'I finished the React module!',
    unreadCount: 2,
    messages: [
      { id: '1', senderId: 'me', text: 'Hi Alex! How is the roadmap going?', timestamp: '10:00 AM', isMe: true },
      { id: '2', senderId: 'f1', text: 'Going well! I finished the React module.', timestamp: '10:05 AM', isMe: false },
      { id: '3', senderId: 'me', text: 'That is great progress. Did you build the demo app?', timestamp: '10:07 AM', isMe: true },
      { id: '4', senderId: 'f1', text: 'Yes! Here is the code review request.', timestamp: '10:08 AM', isMe: false, attachments: [
        { id: 'a1', name: 'dashboard-component.tsx', type: 'file', url: '#', size: '12 KB' }
      ]},
    ]
  },
  {
    id: '2',
    participant: { id: 'f2', name: 'Sarah Jenkins', avatarUrl: 'https://picsum.photos/200/200?random=13', role: 'Mentee' },
    lastMessage: 'When is our next session?',
    unreadCount: 1,
    messages: []
  },
  {
    id: '3',
    participant: { id: 'f3', name: 'Mike Chen', avatarUrl: 'https://picsum.photos/200/200?random=14', role: 'Mentee' },
    lastMessage: 'Thanks for the feedback!',
    unreadCount: 0,
    messages: []
  }
];

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, role }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(MOCK_CHATS[0]);
  const [inputText, setInputText] = useState('');
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
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

    const updatedChats = chats.map(chat => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: inputText || 'Sent an attachment'
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setSelectedChat(prev => prev ? ({ ...prev, messages: [...prev.messages, newMessage] }) : null);
    setInputText('');
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
    if (isRecording && selectedChat) {
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
      
      const updatedChats = chats.map(chat => {
        if (chat.id === selectedChat.id) {
          return { ...chat, messages: [...chat.messages, voiceMessage], lastMessage: '🎤 Voice message' };
        }
        return chat;
      });
      
      setChats(updatedChats);
      setSelectedChat(prev => prev ? ({ ...prev, messages: [...prev.messages, voiceMessage] }) : null);
      setRecordingTime(0);
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="h-full flex bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl mx-4 my-4 shadow-sm">
      {/* Sidebar List */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-950">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 ${
                selectedChat?.id === chat.id 
                  ? 'bg-white dark:bg-slate-900 border-l-4 border-l-indigo-600' 
                  : 'hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div className="relative">
                <img src={chat.participant.avatarUrl} alt={chat.participant.name} className="w-12 h-12 rounded-full object-cover" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{chat.participant.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">10:00 AM</span>
                </div>
                <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={selectedChat.participant.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{selectedChat.participant.name}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Schedule Session"
              >
                <Calendar size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ListTodo size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Phone size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Video size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedChat.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%]`}>
                  {/* Voice Message */}
                  {msg.isVoice && msg.attachments?.[0] && (
                    <div className={`p-3 rounded-2xl ${
                      msg.isMe ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
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
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.isMe 
                        ? 'bg-indigo-600 text-white rounded-br-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-md'
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
                            msg.isMe ? 'bg-indigo-500/80' : 'bg-slate-100 dark:bg-slate-800'
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
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
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

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
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

                <div className="flex-1">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..." 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                  />
                </div>

                <button 
                  onClick={toggleRecording}
                  className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Mic size={20} />
                </button>

                <button 
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() && attachments.length === 0}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <p>Select a chat to start messaging</p>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showScheduleModal && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Schedule Session with {selectedChat.participant.name}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session Topic</label>
                <input type="text" placeholder="e.g., Code Review, Career Discussion" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time</label>
                  <input type="time" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSystem;
