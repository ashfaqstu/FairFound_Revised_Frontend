/**
 * Chat Service for FairFound
 * Handles all chat-related API calls including messages, attachments, and voice notes
 */

// @ts-ignore - Vite env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Types
export interface ChatParticipant {
  id: number;
  name: string;
  avatarUrl: string | null;
  role?: string;
}

export interface ChatAttachment {
  id: number;
  type: 'file' | 'image' | 'voice';
  name: string;
  url: string;
  size?: string;
  duration?: string;
}

export interface ChatMessage {
  id: number;
  sender: number;
  sender_name: string;
  text: string;
  is_read: boolean;
  is_me: boolean;
  attachments: ChatAttachment[];
  thread_id?: number;
  reply_count?: number;
  created_at: string;
}

export interface Chat {
  id: number;
  participant: ChatParticipant;
  last_message: string;
  unread_count: number;
  updated_at: string;
}

// API Functions
export const chatAPI = {
  // Get all chats for current user
  getChats: async (): Promise<Chat[]> => {
    console.log('[CHAT] Fetching chats');
    const response = await fetch(`${API_BASE_URL}/chats/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    const data = await response.json();
    // Handle both paginated and non-paginated responses
    const chats = Array.isArray(data) ? data : (data.results || []);
    console.log('[CHAT] ✅ Fetched chats:', chats.length);
    return chats;
  },

  // Get or create a chat with a specific user
  getOrCreateChat: async (userId: number): Promise<Chat> => {
    console.log('[CHAT] Getting or creating chat with user:', userId);
    const response = await fetch(`${API_BASE_URL}/chats/with/${userId}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to get or create chat');
    }
    return response.json();
  },

  // Get messages for a chat
  getMessages: async (chatId: number): Promise<ChatMessage[]> => {
    console.log('[CHAT] Fetching messages for chat:', chatId);
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    // Handle both paginated and non-paginated responses
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Send a text message
  sendMessage: async (chatId: number, text: string, threadId?: number): Promise<ChatMessage> => {
    console.log('[CHAT] Sending message to chat:', chatId);
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/send/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, thread_id: threadId }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  },

  // Upload file attachment
  uploadAttachment: async (
    chatId: number,
    file: File,
    type: 'file' | 'image' | 'voice',
    text?: string
  ): Promise<ChatMessage> => {
    console.log('[CHAT] Uploading attachment to chat:', chatId, type);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (text) formData.append('text', text);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/attachments/`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload attachment');
    }
    return response.json();
  },

  // Mark messages as read
  markAsRead: async (chatId: number): Promise<void> => {
    console.log('[CHAT] Marking messages as read:', chatId);
    await fetch(`${API_BASE_URL}/chats/${chatId}/read/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
  },

  // Get thread replies
  getThreadReplies: async (chatId: number, messageId: number): Promise<ChatMessage[]> => {
    console.log('[CHAT] Fetching thread replies:', messageId);
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/${messageId}/replies/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch thread replies');
    }
    const data = await response.json();
    // Handle both paginated and non-paginated responses
    return Array.isArray(data) ? data : (data.results || []);
  },
};

// Helper to format message time
export const formatMessageTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to format chat time
export const formatChatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
