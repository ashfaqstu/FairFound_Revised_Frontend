/**
 * React Hooks for Polling Service
 * Easy-to-use hooks for real-time updates in components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { pollingService, NotificationData, ChatUpdateData, RoadmapUpdateData } from './pollingService';
import { chatAPI, ChatMessage } from './chatService';

// ============ NOTIFICATIONS HOOK ============

export interface UseNotificationsResult {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  refresh: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = pollingService.subscribeToNotifications((notifs, count) => {
      setNotifications(notifs);
      setUnreadCount(count);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    pollingService.refreshAll();
  }, []);

  return { notifications, unreadCount, loading, refresh };
}

// ============ CHAT POLLING HOOK ============

export interface UseChatPollingResult {
  updates: ChatUpdateData[];
  hasNewMessages: boolean;
  totalUnread: number;
}

export function useChatPolling(): UseChatPollingResult {
  const [updates, setUpdates] = useState<ChatUpdateData[]>([]);

  useEffect(() => {
    const unsubscribe = pollingService.subscribeToChats((chatUpdates) => {
      setUpdates(chatUpdates);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const hasNewMessages = updates.some(u => u.hasNewMessages);
  const totalUnread = updates.reduce((sum, u) => sum + u.unreadCount, 0);

  return { updates, hasNewMessages, totalUnread };
}

// ============ CHAT MESSAGES POLLING HOOK ============

export interface UseChatMessagesResult {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (text: string) => Promise<void>;
  refresh: () => void;
}

export function useChatMessages(chatId: number | null, pollInterval = 3000): UseChatMessagesResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<number>(0);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    
    try {
      const newMessages = await chatAPI.getMessages(chatId);
      
      // Check if there are new messages
      const latestId = newMessages.length > 0 ? Math.max(...newMessages.map(m => m.id)) : 0;
      
      if (latestId !== lastMessageIdRef.current) {
        setMessages(newMessages);
        lastMessageIdRef.current = latestId;
      }
      
      setLoading(false);
    } catch (error) {
      console.error('[CHAT POLLING] Error fetching messages:', error);
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Initial fetch
    setLoading(true);
    fetchMessages();

    // Start polling
    intervalRef.current = setInterval(fetchMessages, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chatId, pollInterval, fetchMessages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!chatId || !text.trim()) return;
    
    try {
      const newMessage = await chatAPI.sendMessage(chatId, text);
      setMessages(prev => [...prev, newMessage]);
      lastMessageIdRef.current = newMessage.id;
    } catch (error) {
      console.error('[CHAT POLLING] Error sending message:', error);
      throw error;
    }
  }, [chatId]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  return { messages, loading, sendMessage, refresh };
}

// ============ ROADMAP POLLING HOOK ============

export interface UseRoadmapPollingResult {
  stepsCount: number;
  tasksCount: number;
  completedSteps: number;
  completedTasks: number;
  progress: number;
  lastUpdated: string | null;
  loading: boolean;
}

export function useRoadmapPolling(): UseRoadmapPollingResult {
  const [data, setData] = useState<RoadmapUpdateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = pollingService.subscribeToRoadmap((update) => {
      setData(update);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const progress = data && data.stepsCount > 0 
    ? Math.round((data.completedSteps / data.stepsCount) * 100) 
    : 0;

  return {
    stepsCount: data?.stepsCount || 0,
    tasksCount: data?.tasksCount || 0,
    completedSteps: data?.completedSteps || 0,
    completedTasks: data?.completedTasks || 0,
    progress,
    lastUpdated: data?.lastUpdated || null,
    loading,
  };
}

// ============ GENERIC POLLING HOOK ============

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 10000,
  enabled: boolean = true
): { data: T | null; loading: boolean; error: Error | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Initial fetch
    fetch();

    // Start polling
    intervalRef.current = setInterval(fetch, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetch, interval, enabled]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh };
}
