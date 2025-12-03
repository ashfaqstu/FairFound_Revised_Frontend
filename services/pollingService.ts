/**
 * Polling Service for FairFound
 * Provides real-time updates via polling for notifications, chats, and roadmap
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

// Types for polling callbacks
export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

export interface ChatUpdateData {
  chatId: number;
  lastMessageId: number;
  unreadCount: number;
  hasNewMessages: boolean;
}

export interface RoadmapUpdateData {
  stepsCount: number;
  tasksCount: number;
  completedSteps: number;
  completedTasks: number;
  lastUpdated: string;
}

type NotificationCallback = (notifications: NotificationData[], unreadCount: number) => void;
type ChatCallback = (updates: ChatUpdateData[]) => void;
type RoadmapCallback = (update: RoadmapUpdateData) => void;

class PollingService {
  private notificationInterval: NodeJS.Timeout | null = null;
  private chatInterval: NodeJS.Timeout | null = null;
  private roadmapInterval: NodeJS.Timeout | null = null;
  
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private chatCallbacks: Set<ChatCallback> = new Set();
  private roadmapCallbacks: Set<RoadmapCallback> = new Set();
  
  private lastNotificationCheck: string | null = null;
  private lastChatMessageIds: Map<number, number> = new Map();
  
  // Default polling intervals (in ms)
  private readonly NOTIFICATION_INTERVAL = 10000; // 10 seconds
  private readonly CHAT_INTERVAL = 5000; // 5 seconds
  private readonly ROADMAP_INTERVAL = 30000; // 30 seconds

  // ============ NOTIFICATIONS ============
  
  subscribeToNotifications(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    
    // Start polling if not already running
    if (!this.notificationInterval) {
      this.startNotificationPolling();
    }
    
    // Immediately fetch notifications
    this.fetchNotifications();
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
      if (this.notificationCallbacks.size === 0) {
        this.stopNotificationPolling();
      }
    };
  }

  private startNotificationPolling(): void {
    console.log('[POLLING] Starting notification polling');
    this.notificationInterval = setInterval(() => {
      this.fetchNotifications();
    }, this.NOTIFICATION_INTERVAL);
  }

  private stopNotificationPolling(): void {
    if (this.notificationInterval) {
      console.log('[POLLING] Stopping notification polling');
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
    }
  }

  private async fetchNotifications(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const notifications = data.notifications || [];
      const unreadCount = data.unread_count || 0;
      
      // Notify all subscribers
      this.notificationCallbacks.forEach(callback => {
        callback(notifications, unreadCount);
      });
    } catch (error) {
      console.error('[POLLING] Error fetching notifications:', error);
    }
  }

  // ============ CHATS ============
  
  subscribeToChats(callback: ChatCallback, chatIds?: number[]): () => void {
    this.chatCallbacks.add(callback);
    
    // Start polling if not already running
    if (!this.chatInterval) {
      this.startChatPolling();
    }
    
    // Return unsubscribe function
    return () => {
      this.chatCallbacks.delete(callback);
      if (this.chatCallbacks.size === 0) {
        this.stopChatPolling();
      }
    };
  }

  private startChatPolling(): void {
    console.log('[POLLING] Starting chat polling');
    this.chatInterval = setInterval(() => {
      this.fetchChatUpdates();
    }, this.CHAT_INTERVAL);
  }

  private stopChatPolling(): void {
    if (this.chatInterval) {
      console.log('[POLLING] Stopping chat polling');
      clearInterval(this.chatInterval);
      this.chatInterval = null;
    }
  }

  private async fetchChatUpdates(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const chats = Array.isArray(data) ? data : (data.results || []);
      
      const updates: ChatUpdateData[] = chats.map((chat: any) => ({
        chatId: chat.id,
        lastMessageId: chat.last_message_id || 0,
        unreadCount: chat.unread_count || 0,
        hasNewMessages: this.lastChatMessageIds.has(chat.id) 
          ? (chat.last_message_id || 0) > (this.lastChatMessageIds.get(chat.id) || 0)
          : false,
      }));
      
      // Update last message IDs
      chats.forEach((chat: any) => {
        this.lastChatMessageIds.set(chat.id, chat.last_message_id || 0);
      });
      
      // Notify all subscribers
      this.chatCallbacks.forEach(callback => {
        callback(updates);
      });
    } catch (error) {
      console.error('[POLLING] Error fetching chat updates:', error);
    }
  }

  // Poll specific chat for new messages
  async pollChatMessages(chatId: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return Array.isArray(data) ? data : (data.results || []);
    } catch (error) {
      console.error('[POLLING] Error polling chat messages:', error);
      return [];
    }
  }

  // ============ ROADMAP ============
  
  subscribeToRoadmap(callback: RoadmapCallback): () => void {
    this.roadmapCallbacks.add(callback);
    
    // Start polling if not already running
    if (!this.roadmapInterval) {
      this.startRoadmapPolling();
    }
    
    // Immediately fetch roadmap
    this.fetchRoadmapUpdates();
    
    // Return unsubscribe function
    return () => {
      this.roadmapCallbacks.delete(callback);
      if (this.roadmapCallbacks.size === 0) {
        this.stopRoadmapPolling();
      }
    };
  }

  private startRoadmapPolling(): void {
    console.log('[POLLING] Starting roadmap polling');
    this.roadmapInterval = setInterval(() => {
      this.fetchRoadmapUpdates();
    }, this.ROADMAP_INTERVAL);
  }

  private stopRoadmapPolling(): void {
    if (this.roadmapInterval) {
      console.log('[POLLING] Stopping roadmap polling');
      clearInterval(this.roadmapInterval);
      this.roadmapInterval = null;
    }
  }

  private async fetchRoadmapUpdates(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap/steps/`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return;
      
      const data = await response.json();
      const steps = Array.isArray(data) ? data : (data.results || []);
      
      // Fetch tasks too
      const tasksResponse = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: getAuthHeaders(),
      });
      
      let tasks: any[] = [];
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        tasks = Array.isArray(tasksData) ? tasksData : (tasksData.results || []);
      }
      
      const update: RoadmapUpdateData = {
        stepsCount: steps.length,
        tasksCount: tasks.length,
        completedSteps: steps.filter((s: any) => s.status === 'completed').length,
        completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
        lastUpdated: new Date().toISOString(),
      };
      
      // Notify all subscribers
      this.roadmapCallbacks.forEach(callback => {
        callback(update);
      });
    } catch (error) {
      console.error('[POLLING] Error fetching roadmap updates:', error);
    }
  }

  // ============ UTILITY ============
  
  // Stop all polling (call on logout)
  stopAll(): void {
    this.stopNotificationPolling();
    this.stopChatPolling();
    this.stopRoadmapPolling();
    this.notificationCallbacks.clear();
    this.chatCallbacks.clear();
    this.roadmapCallbacks.clear();
    this.lastChatMessageIds.clear();
    console.log('[POLLING] All polling stopped');
  }

  // Force refresh all data
  async refreshAll(): Promise<void> {
    await Promise.all([
      this.fetchNotifications(),
      this.fetchChatUpdates(),
      this.fetchRoadmapUpdates(),
    ]);
  }
}

// Export singleton instance
export const pollingService = new PollingService();
