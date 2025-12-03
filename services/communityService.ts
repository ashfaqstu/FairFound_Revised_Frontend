/**
 * Community Service for FairFound
 * Handles all community-related API calls including pod members, heatmap, and activity
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
export interface PodMember {
  id: number;
  user_id: number;
  name: string;
  avatar_url: string | null;
  title: string;
  tasks_this_week: number;
  total_tasks: number;
  streak: number;
  is_me: boolean;
}

export interface PodResponse {
  members: PodMember[];
  mentor_name: string | null;
  mentor_title?: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface HeatmapResponse {
  weeks: HeatmapDay[][];
  total_contributions: number;
}

export interface ActivityItem {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string | null;
  task_title: string;
  step_title: string;
  completed_at: string;
  time_ago: string;
  is_me: boolean;
}

export interface ActivityResponse {
  activities: ActivityItem[];
}

// API Functions
export const communityAPI = {
  // Get pod members (freelancers under same mentor)
  getPodMembers: async (): Promise<PodResponse> => {
    console.log('[COMMUNITY] Fetching pod members');
    const response = await fetch(`${API_BASE_URL}/community/pod/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pod members');
    }
    return response.json();
  },

  // Get heatmap data for task completions
  getHeatmapData: async (): Promise<HeatmapResponse> => {
    console.log('[COMMUNITY] Fetching heatmap data');
    const response = await fetch(`${API_BASE_URL}/community/heatmap/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch heatmap data');
    }
    return response.json();
  },

  // Get recent activity from pod members
  getRecentActivity: async (): Promise<ActivityResponse> => {
    console.log('[COMMUNITY] Fetching recent activity');
    const response = await fetch(`${API_BASE_URL}/community/activity/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }
    return response.json();
  },
};
