import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, MoreVertical, Search, Paperclip, 
  FileText, Image, X, Download,
  Calendar, Clock, ListTodo, Loader2, Reply, ChevronLeft, RefreshCw
} from 'lucide-react';
import { chatAPI, Chat, ChatMessage, ChatAttachment, formatMessageTime, formatChatTime } from '../services/chatService';
import { useChatPolling } from '../services/usePolling';
import { getMediaUrl } from '../services/api';

interface ChatSystemProps {
  currentUser: { id: string; name: string };
  role: 'FREELANCER' | 'MENTOR';
  initialUserId?: number; // Optional: open chat with specific user
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, role, initialUserId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showThread, setShowThread] = useState<ChatMessage | null>(null);
  const [threadMessages, setThreadMessages] = useState<ChatMessage[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagePollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(0);

  // Chat polling for unread counts
  const { updates: chatUpdates, totalUnread } = useChatPolling();

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Poll for new messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
      return;
    }

    // Start polling for new messages every 3 seconds
    const pollMessages = async () => {
      try {
        const newMessages = await chatAPI.getMessages(selectedChat.id);
        const latestId = newMessages.length > 0 ? Math.max(...newMessages.map(m => m.id)) : 0;
        
        // Only update if there are new messages
        if (latestId > lastMessageIdRef.current) {
          setMessages(newMessages);
          lastMessageIdRef.current = latestId;
          // Mark as read
          await chatAPI.markAsRead(selectedChat.id);
        }
      } catch (err) {
        console.error('[CHAT POLLING] Error:', err);
      }
    };

    messagePollingRef.current = setInterval(pollMessages, 3000);

    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
        messagePollingRef.current = null;
      }
    };
  }, [selectedChat?.id]);

  // Update chat list when polling detects changes
  useEffect(() => {
    if (chatUpdates.length > 0) {
      setChats(prev => prev.map(chat => {
        const update = chatUpdates.find(u => u.chatId === chat.id);
        if (update && update.unreadCount !== chat.unread_count) {
          return { ...chat, unread_count: update.unreadCount };
        }
        return chat;
      }));
    }
  }, [chatUpdates]);

  // Open chat with initial user if provided
  useEffect(() => {
    if (initialUserId && !loading) {
      openChatWithUser(initialUserId);
    }
  }, [initialUserId, loading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getChats();
      const chatList = Array.isArray(data) ? data : [];
      setChats(chatList);
      if (chatList.length > 0 && !selectedChat) {
        setSelectedChat(chatList[0]);
        loadMessages(chatList[0].id);
      }
    } catch (err) {
      console.error('[CHAT] Error loading chats:', err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const openChatWithUser = async (userId: number) => {
    try {
      const chat = await chatAPI.getOrCreateChat(userId);
      // Check if chat already exists in list
      const existingIndex = chats.findIndex(c => c.id === chat.id);
      if (existingIndex === -1) {
        setChats(prev => [chat, ...prev]);
      }
      setSelectedChat(chat);
      loadMessages(chat.id);
    } catch (err) {
      console.error('[CHAT] Error opening chat:', err);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      setLoadingMessages(true);
      const data = await chatAPI.getMessages(chatId);
      setMessages(data);
      // Track last message ID for polling
      lastMessageIdRef.current = data.length > 0 ? Math.max(...data.map(m => m.id)) : 0;
      // Mark as read
      await chatAPI.markAsRead(chatId);
      // Update unread count in chat list
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c));
    } catch (err) {
      console.error('[CHAT] Error loading messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadThreadReplies = async (message: ChatMessage) => {
    try {
      if (!selectedChat) return;
      const replies = await chatAPI.getThreadReplies(selectedChat.id, message.id);
      setThreadMessages(replies);
      setShowThread(message);
    } catch (err) {
      console.error('[CHAT] Error loading thread:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || !selectedChat || sending) return;

    try {
      setSending(true);
      let newMessage: ChatMessage;

      if (attachments.length > 0) {
        // Upload each attachment
        for (const file of attachments) {
          const type = file.type.startsWith('image') ? 'image' : 'file';
          newMessage = await chatAPI.uploadAttachment(selectedChat.id, file, type, inputText);
        }
      } else {
        newMessage = await chatAPI.sendMessage(
          selectedChat.id, 
          inputText, 
          replyingTo?.id || (showThread?.id)
        );
      }

      // Add to messages list
      if (showThread) {
        setThreadMessages(prev => [...prev, newMessage!]);
      } else {
        setMessages(prev => [...prev, newMessage!]);
      }

      // Update chat list
      setChats(prev => prev.map(c => 
        c.id === selectedChat.id 
          ? { ...c, last_message: inputText || 'Sent an attachment', updated_at: new Date().toISOString() }
          : c
      ));

      setInputText('');
      setAttachments([]);
      setReplyingTo(null);
    } catch (err) {
      console.error('[CHAT] Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownload = (url: string, filename: string) => {
    const fullUrl = getMediaUrl(url);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredChats = (chats || []).filter(chat => 
    chat.participant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = (msg: ChatMessage, isThread = false) => (
    <div key={msg.id} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-[70%]`}>
        {/* Text Message */}
        {msg.text && (
          <div className={`p-4 rounded-2xl shadow-sm ${
            msg.is_me 
              ? 'bg-indigo-600 text-white rounded-br-md' 
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-md'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        )}

        {/* File/Image Attachments */}
        {msg.attachments?.map(att => (
          <div 
            key={att.id}
            className={`mt-2 flex items-center gap-3 p-3 rounded-xl ${
              msg.is_me ? 'bg-indigo-500/80' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            {att.type === 'image' ? (
              <>
                <Image size={20} className={msg.is_me ? 'text-white' : 'text-slate-500'} />
                {att.url && (
                  <img src={getMediaUrl(att.url)} alt={att.name} className="max-w-[200px] rounded-lg" />
                )}
              </>
            ) : (
              <>
                <FileText size={20} className={msg.is_me ? 'text-white' : 'text-slate-500'} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${msg.is_me ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {att.name}
                  </p>
                  {att.size && <p className={`text-xs ${msg.is_me ? 'text-white/70' : 'text-slate-500'}`}>{att.size}</p>}
                </div>
                <button 
                  onClick={() => handleDownload(att.url, att.name)}
                  className={`p-1.5 rounded-lg ${msg.is_me ? 'hover:bg-white/10' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  <Download size={16} className={msg.is_me ? 'text-white' : 'text-slate-500'} />
                </button>
              </>
            )}
          </div>
        ))}

        {/* Message footer */}
        <div className={`flex items-center gap-2 mt-1 ${msg.is_me ? 'justify-end' : ''}`}>
          <span className="text-xs text-slate-400">{formatMessageTime(msg.created_at)}</span>
          {!isThread && msg.reply_count > 0 && (
            <button 
              onClick={() => loadThreadReplies(msg)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {msg.reply_count} {msg.reply_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
          {!isThread && !msg.is_me && (
            <button 
              onClick={() => setReplyingTo(msg)}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity"
            >
              <Reply size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading chats...</span>
      </div>
    );
  }

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Connect with a {role === 'MENTOR' ? 'mentee' : 'mentor'} to start chatting</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => { setSelectedChat(chat); loadMessages(chat.id); setShowThread(null); }}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 ${
                  selectedChat?.id === chat.id 
                    ? 'bg-white dark:bg-slate-900 border-l-4 border-l-indigo-600' 
                    : 'hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="relative">
                  {chat.participant?.avatarUrl ? (
                    <img src={chat.participant.avatarUrl} alt={chat.participant.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                      {chat.participant?.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{chat.participant?.name}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatChatTime(chat.updated_at)}</span>
                  </div>
                  <p className={`text-sm truncate ${chat.unread_count > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
                {chat.unread_count > 0 && (
                  <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    {chat.unread_count}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
            {showThread ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setShowThread(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Thread</h3>
                  <p className="text-xs text-slate-500">Replying to message</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {selectedChat.participant?.avatarUrl ? (
                  <img src={selectedChat.participant.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                    {selectedChat.participant?.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedChat.participant?.name}</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowScheduleModal(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Schedule Session">
                <Calendar size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              </div>
            ) : showThread ? (
              <>
                {renderMessage(showThread, false)}
                <div className="border-l-2 border-indigo-200 dark:border-indigo-800 pl-4 ml-4 space-y-4">
                  {threadMessages.map(msg => renderMessage(msg, true))}
                </div>
              </>
            ) : (
              messages.map(msg => renderMessage(msg))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply indicator */}
          {replyingTo && !showThread && (
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply size={16} className="text-indigo-600" />
                <span className="text-sm text-indigo-700 dark:text-indigo-300">Replying to {replyingTo.sender_name}</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
          )}

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2 flex-wrap">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    {file.type.startsWith('image') ? <Image size={16} className="text-slate-500" /> : <FileText size={16} className="text-slate-500" />}
                    <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => removeAttachment(index)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-end gap-3">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.txt" />
              <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <Paperclip size={20} />
              </button>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder={showThread ? "Reply in thread..." : "Type your message..."} 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                />
              </div>
              <button onClick={() => handleSendMessage()} disabled={(!inputText.trim() && attachments.length === 0) || sending} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
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
              <h3 className="font-bold text-slate-900 dark:text-white">Schedule Session with {selectedChat.participant?.name}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session Topic</label>
                <input type="text" placeholder="e.g., Code Review" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
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
              <button onClick={() => setShowScheduleModal(false)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
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
