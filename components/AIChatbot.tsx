import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Send, Loader2, Sparkles, Minimize2, GripVertical, 
  Trash2, RotateCcw, Copy, Check, ChevronDown, Bot, User
} from 'lucide-react';
import { quickChat } from '../services/aiChatService';

interface AIChatbotProps {
  pageContext: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ pageContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your FairFound AI assistant powered by Gemini. I can help you with questions about freelancing, your roadmap, mentorship, and more. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Drag state
  // Position above bottom nav on mobile (80px from bottom), normal on desktop
  const getInitialPosition = () => {
    const isMobileDevice = window.innerWidth < 768;
    const bottomOffset = isMobileDevice ? 80 : 0;
    return { 
      x: window.innerWidth - 80, 
      y: window.innerHeight - 80 - bottomOffset 
    };
  };
  const [position, setPosition] = useState<Position>(getInitialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize to keep bubble in bounds
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, position above bottom nav (64px nav + 16px padding)
      const bottomOffset = mobile ? 80 : 0;
      
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - (isOpen ? (mobile ? window.innerWidth - 16 : 384) : 56)),
        y: Math.min(prev.y, window.innerHeight - (isOpen ? (mobile ? 450 : 500) : 56) - bottomOffset)
      }));
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: position.x, startPosY: position.y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragRef.current = { startX: touch.clientX, startY: touch.clientY, startPosX: position.x, startPosY: position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.startPosX + deltaX;
      const newY = dragRef.current.startPosY + deltaY;
      const maxX = window.innerWidth - (isOpen ? 384 : 56);
      const maxY = window.innerHeight - (isOpen ? 500 : 56);
      setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !dragRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragRef.current.startX;
      const deltaY = touch.clientY - dragRef.current.startY;
      const newX = dragRef.current.startPosX + deltaX;
      const newY = dragRef.current.startPosY + deltaY;
      const maxX = window.innerWidth - (isOpen ? 384 : 56);
      const maxY = window.innerHeight - (isOpen ? 500 : 56);
      setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) });
    };

    const handleMouseUp = () => { setIsDragging(false); dragRef.current = null; };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isOpen]);

  const handleSend = async () => {
    console.log('[AI CHATBOT] handleSend called, input:', input, 'isLoading:', isLoading);
    if (!input.trim() || isLoading) {
      console.log('[AI CHATBOT] Skipping - empty input or loading');
      return;
    }
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev: Message[]) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      console.log('[AI CHATBOT] Calling quickChat API...');
      const chatHistory = messages.map((m: Message) => ({ role: m.role, content: m.content }));
      const response = await quickChat(currentInput, pageContext, chatHistory);
      console.log('[AI CHATBOT] Got response:', response);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[AI CHATBOT] Chat error:', error);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      console.log('[AI CHATBOT] Enter pressed, sending message...');
      handleSend(); 
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([{ id: Date.now().toString(), role: 'assistant', content: "Chat cleared! How can I help you today?", timestamp: new Date() }]);
  };

  const handleRegenerateLastResponse = async () => {
    const lastUserMessage = [...messages].reverse().find((m: Message) => m.role === 'user');
    if (!lastUserMessage || isLoading) return;
    setMessages((prev: Message[]) => {
      const lastAssistantIndex = prev.map((m: Message) => m.role).lastIndexOf('assistant');
      if (lastAssistantIndex > 0) return prev.slice(0, lastAssistantIndex);
      return prev;
    });
    setIsLoading(true);
    try {
      const chatHistory = messages.slice(0, -1).map((m: Message) => ({ role: m.role, content: m.content }));
      const response = await quickChat(lastUserMessage.content, pageContext, chatHistory);
      const assistantMessage: Message = { id: Date.now().toString(), role: 'assistant', content: response, timestamp: new Date() };
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Regenerate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = ["What should I focus on?", "How can I improve my rates?", "Explain this page", "Find me a mentor"];


  if (!isOpen) {
    return (
      <div style={{ left: position.x, top: position.y }} className={`fixed z-50 ${isDragging ? 'cursor-grabbing' : ''}`}>
        <button
          onMouseDown={!isMobile ? handleMouseDown : undefined}
          onTouchStart={!isMobile ? handleTouchStart : undefined}
          onClick={() => !isDragging && setIsOpen(true)}
          className={`w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
          aria-label="Open AI Assistant"
        >
          <Sparkles size={isMobile ? 20 : 24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ left: position.x, top: position.y }} className={`fixed z-50 ${isMinimized ? 'w-72' : 'w-96'}`}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <GripVertical size={16} className="text-white/70" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm flex items-center gap-1"><Bot size={14} /> AI Assistant</h3>
              {!isMinimized && <p className="text-indigo-200 text-xs">Powered by Gemini</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isMinimized && (
              <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleClearChat(); }} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Clear chat">
                <Trash2 size={14} />
              </button>
            )}
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={isMinimized ? "Expand" : "Minimize"}>
              <Minimize2 size={16} />
            </button>
            <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div ref={messagesContainerRef} onScroll={handleScroll} className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 relative">
              {messages.map((message: Message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'}`}>
                      {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className="group relative">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-bl-md'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'assistant' && (
                        <div className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button onClick={() => handleCopy(message.content, message.id)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded" title="Copy">
                            {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                          {message.id === messages[messages.length - 1]?.id && (
                            <button onClick={handleRegenerateLastResponse} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded" title="Regenerate" disabled={isLoading}>
                              <RotateCcw size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Bot size={12} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-indigo-500" />
                        <span className="text-sm text-slate-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
              {showScrollButton && (
                <button onClick={scrollToBottom} className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <ChevronDown size={16} className="text-slate-600 dark:text-slate-400" />
                </button>
              )}
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q: string, i: number) => (
                    <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <input ref={inputRef} type="text" value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask me anything..." className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500" disabled={isLoading} />
                <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Send message">
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">AI responses may not always be accurate</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatbot;
