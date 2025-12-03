/**
 * AI Chatbot Service - Backend API Integration
 */

// @ts-ignore - Vite env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://fairfound-backend.onrender.com/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export interface AIMessage {
  id: number | string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AIConversation {
  id: number;
  title: string;
  messages: AIMessage[];
  created_at: string;
  updated_at?: string;
  message_count?: number;
}

export interface ChatResponse {
  conversation_id: number;
  user_message: AIMessage;
  assistant_message: AIMessage;
}

export interface QuickChatResponse {
  response: string;
}

// List all AI conversations
export const getConversations = async (): Promise<AIConversation[]> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
};

// Create a new conversation
export const createConversation = async (title?: string): Promise<AIConversation> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title: title || 'New Conversation' }),
  });
  if (!response.ok) throw new Error('Failed to create conversation');
  return response.json();
};

// Get a specific conversation with messages
export const getConversation = async (conversationId: number): Promise<AIConversation> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/${conversationId}/`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch conversation');
  return response.json();
};

// Update conversation title
export const updateConversation = async (conversationId: number, title: string): Promise<AIConversation> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/${conversationId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to update conversation');
  return response.json();
};

// Delete a conversation
export const deleteConversation = async (conversationId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/${conversationId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete conversation');
};

// Send a message to an existing conversation
export const sendMessage = async (
  conversationId: number,
  message: string,
  pageContext?: string
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/${conversationId}/chat/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, page_context: pageContext }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

// Send a message and create a new conversation
export const sendMessageNewConversation = async (
  message: string,
  pageContext?: string
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/chat/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, page_context: pageContext }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

// Quick chat without saving history (for floating chatbot)
export const quickChat = async (
  message: string,
  pageContext?: string,
  history?: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> => {
  const url = `${API_BASE_URL}/chats/ai/quick/`;
  console.log('[AI SERVICE] Calling quickChat:', url);
  console.log('[AI SERVICE] Message:', message);
  console.log('[AI SERVICE] Headers:', getAuthHeaders());
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, page_context: pageContext, history: history || [] }),
  });
  
  console.log('[AI SERVICE] Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI SERVICE] Error response:', errorText);
    throw new Error(`Failed to get response: ${response.status}`);
  }
  
  const data: QuickChatResponse = await response.json();
  console.log('[AI SERVICE] Response data:', data);
  return data.response;
};

// Clear conversation history
export const clearHistory = async (conversationId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chats/ai/${conversationId}/clear/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to clear history');
};
