/**
 * API Service for FairFound Backend
 * Handles authentication and all API calls
 */

// @ts-ignore - Vite env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api';

// Token management
let accessToken: string | null = localStorage.getItem('access_token');
let refreshToken: string | null = localStorage.getItem('refresh_token');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAccessToken = () => accessToken;

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token refresh
  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
      const retryResponse = await fetch(url, { ...options, headers });
      if (!retryResponse.ok) {
        throw new Error(`API Error: ${retryResponse.status}`);
      }
      return retryResponse.json();
    } else {
      clearTokens();
      window.location.href = '/';
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.access, refreshToken!);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================
// AUTH API
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role?: 'freelancer' | 'mentor';
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  hourly_rate?: number;
  github_username?: string;
  portfolio_url?: string;
  location?: string;
  avatar?: string;
}

// Backend response types
interface LoginResponse {
  access: string;
  refresh: string;
}

interface SignupResponse {
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

interface MeResponse {
  id: number;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  is_pro?: boolean;
  profile?: {
    title?: string;
    bio?: string;
    skills?: string[];
    experience_years?: number;
    hourly_rate?: number;
    github_username?: string;
    portfolio_url?: string;
    location?: string;
  };
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('[AUTH] Logging in user:', data.email);
    const response = await apiRequest<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(response.access, response.refresh);
    console.log('[AUTH] ✅ Login successful, tokens stored');
    
    // Fetch user details after login
    const me = await apiRequest<MeResponse>('/auth/me/');
    console.log('[AUTH] ✅ User profile fetched:', me.username);
    return {
      access: response.access,
      refresh: response.refresh,
      user: {
        id: me.id,
        username: me.username,
        email: me.email,
        role: me.role,
      },
    };
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    console.log('[AUTH] Signing up user:', data.email);
    const response = await apiRequest<SignupResponse>('/auth/signup/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(response.tokens.access, response.tokens.refresh);
    console.log('[AUTH] ✅ Signup successful, tokens stored');
    return {
      access: response.tokens.access,
      refresh: response.tokens.refresh,
      user: response.user,
    };
  },

  logout: async (): Promise<void> => {
    console.log('[AUTH] Logging out user');
    try {
      await apiRequest('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });
      console.log('[AUTH] ✅ Logout successful');
    } finally {
      clearTokens();
    }
  },

  getMe: async (): Promise<UserProfile> => {
    console.log('[AUTH] Fetching current user profile');
    const response = await apiRequest<MeResponse>('/auth/me/');
    console.log('[AUTH] ✅ Profile fetched:', response.username);
    return {
      id: response.id,
      username: response.username,
      email: response.email,
      role: response.role,
      avatar: response.avatar,
      name: response.profile?.title ? response.username : response.username,
      title: response.profile?.title,
      bio: response.profile?.bio,
      skills: response.profile?.skills,
      experience_years: response.profile?.experience_years,
      hourly_rate: response.profile?.hourly_rate,
      github_username: response.profile?.github_username,
      portfolio_url: response.profile?.portfolio_url,
      location: response.profile?.location,
    };
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    console.log('[AUTH] Updating user profile');
    const response = await apiRequest<MeResponse>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    console.log('[AUTH] ✅ Profile updated');
    return {
      id: response.id,
      username: response.username,
      email: response.email,
      role: response.role,
      ...response.profile,
    };
  },
};

// ============================================
// PROFILE API
// ============================================

export interface FreelancerProfileData {
  id?: number;
  name?: string;
  email?: string;
  avatar_url?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  hourly_rate?: number;
  github_username?: string;
  portfolio_url?: string;
  location?: string;
  connected_mentor?: number | null;
  connected_mentor_details?: {
    id: number;
    name: string;
    title: string;
    company: string;
    specialties: string[];
    rate: number;
    rating: number;
    image_url: string | null;
  } | null;
}

export const profileAPI = {
  // Get current user's profile
  getProfile: async (): Promise<FreelancerProfileData> => {
    console.log('[PROFILE] Fetching profile');
    const response = await apiRequest<FreelancerProfileData>('/auth/profile/');
    console.log('[PROFILE] ✅ Profile fetched');
    console.log('[PROFILE] Connected mentor:', response.connected_mentor_details);
    return response;
  },

  // Update profile
  updateProfile: async (data: Partial<FreelancerProfileData>): Promise<FreelancerProfileData> => {
    console.log('[PROFILE] Updating profile', data);
    const response = await apiRequest<FreelancerProfileData>('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    console.log('[PROFILE] ✅ Profile updated');
    return response;
  },

  // Partial update profile
  patchProfile: async (data: Partial<FreelancerProfileData>): Promise<FreelancerProfileData> => {
    console.log('[PROFILE] Patching profile', data);
    const response = await apiRequest<FreelancerProfileData>('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    console.log('[PROFILE] ✅ Profile patched');
    return response;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    console.log('[PROFILE] Uploading avatar');
    const formData = new FormData();
    formData.append('avatar', file);
    
    const url = `${API_BASE_URL}/auth/avatar/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
    
    const result = await response.json();
    console.log('[PROFILE] ✅ Avatar uploaded');
    return result;
  },

  // Add skill to profile
  addSkill: async (skill: string): Promise<FreelancerProfileData> => {
    const profile = await profileAPI.getProfile();
    const skills = [...(profile.skills || []), skill];
    return profileAPI.patchProfile({ skills });
  },

  // Remove skill from profile
  removeSkill: async (skill: string): Promise<FreelancerProfileData> => {
    const profile = await profileAPI.getProfile();
    const skills = (profile.skills || []).filter(s => s !== skill);
    return profileAPI.patchProfile({ skills });
  },
};

// ============================================
// MENTOR PROFILE API
// ============================================

export interface MentorProfileData {
  id?: number;
  name?: string;
  image_url?: string;
  title?: string;
  company?: string;
  bio?: string;
  specialties?: string[];
  rate?: number;
  rating?: number;
  total_reviews?: number;
  is_available?: boolean;
  session_duration?: number;
  timezone?: string;
  mentee_count?: number;
}

export const mentorProfileAPI = {
  // Get current mentor's profile
  getProfile: async (): Promise<MentorProfileData> => {
    console.log('[MENTOR PROFILE] Fetching profile');
    const response = await apiRequest<MentorProfileData>('/auth/mentor-profile/');
    console.log('[MENTOR PROFILE] ✅ Profile fetched');
    return response;
  },

  // Update mentor profile
  updateProfile: async (data: Partial<MentorProfileData>): Promise<MentorProfileData> => {
    console.log('[MENTOR PROFILE] Updating profile', data);
    const response = await apiRequest<MentorProfileData>('/auth/mentor-profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    console.log('[MENTOR PROFILE] ✅ Profile updated');
    return response;
  },

  // Partial update mentor profile
  patchProfile: async (data: Partial<MentorProfileData>): Promise<MentorProfileData> => {
    console.log('[MENTOR PROFILE] Patching profile', data);
    const response = await apiRequest<MentorProfileData>('/auth/mentor-profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    console.log('[MENTOR PROFILE] ✅ Profile patched');
    return response;
  },
};

// Export API_BASE_URL for avatar upload
export { API_BASE_URL };

// ============================================
// AGENTS API (Junior Frontend Analysis)
// ============================================

export interface OnboardingData {
  name: string;
  email: string;
  skills: string[];
  experience_years?: number;
  hourly_rate?: number;
  github_username?: string;
  portfolio_url?: string;
  title?: string;
  bio?: string;
  location?: string;
  project_count?: number;
  has_live_demos?: boolean;
}

export interface AnalysisJob {
  id: number;
  status: 'pending' | 'running' | 'done' | 'error' | 'review';
  result?: AnalysisResult;
  error_message?: string;
  created_at: string;
  updated_at: string;
  latest_score?: {
    overall_score: number;
    confidence: number;
    flagged: boolean;
  };
  tier?: string;
  percentile?: number;
}

export interface AnalysisResult {
  overall_score: number;
  tier: string;
  tier_color: string;
  breakdown: {
    skill_strength: ScoreComponent;
    github_activity: ScoreComponent;
    portfolio_quality: ScoreComponent;
    experience_depth: ScoreComponent;
    learning_momentum: ScoreComponent;
  };
  benchmark: BenchmarkData;
  evaluation: LLMEvaluation;
  improvements: Improvement[];
  skills_detected: string[];
}

export interface ScoreComponent {
  raw_score: number;
  weight: number;
  weighted: number;
  level: string;
  details?: Record<string, unknown>;
}

export interface BenchmarkData {
  user_percentile: number;
  tier: string;
  tier_description: string;
  benchmark_percentiles: Record<number, number>;
  avg_rate: number;
  avg_experience: number;
  in_demand_skills: string[];
  sample_size: number;
  market_insights: {
    rate_suggestion: {
      suggested_rate: number;
      range: string;
      min: number;
      max: number;
    };
    skill_gaps: string[];
  };
}

export interface LLMEvaluation {
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  market_position: {
    rate_position: string;
    suggested_hourly_rate: number;
    in_demand_skills: string[];
    market_outlook: string;
  };
  tier_assessment: {
    tier: string;
    percentile: number;
    interpretation: string;
  };
}

export interface Improvement {
  priority: number;
  area: string;
  action: string;
  impact: string;
  time_estimate?: string;
}

export interface QuickAnalyzeRequest {
  skills: string[];
  experience_years?: number;
  github_username?: string;
}

export interface QuickAnalyzeResponse {
  overall_score: number;
  tier: string;
  percentile: number;
  breakdown: Record<string, ScoreComponent>;
  improvements: Improvement[];
  benchmark: BenchmarkData;
}

// Response from synchronous onboarding
export interface OnboardingResponse {
  job_id: number;
  status: string;
  overall_score: number;
  tier: string;
  percentile: number;
  breakdown: Record<string, ScoreComponent>;
  improvements: Improvement[];
  benchmark: BenchmarkData;
  evaluation?: LLMEvaluation;
}

// Response from latest analysis endpoint
export interface LatestAnalysisResponse {
  has_analysis: boolean;
  message?: string;
  job_id?: number;
  status?: string;
  overall_score?: number;
  tier?: string;
  tier_color?: string;
  percentile?: number;
  breakdown?: Record<string, ScoreComponent>;
  benchmark?: BenchmarkData;
  evaluation?: LLMEvaluation;
  improvements?: Improvement[];
  skills_detected?: string[];
  created_at?: string;
}

export const agentsAPI = {
  // Submit profile for analysis (now synchronous - returns results immediately)
  submitOnboarding: async (data: OnboardingData): Promise<OnboardingResponse> => {
    return apiRequest('/agents/onboard/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get the latest analysis for the current user (no job_id needed)
  getLatestAnalysis: async (): Promise<LatestAnalysisResponse> => {
    console.log('[AGENTS] Fetching latest analysis...');
    return apiRequest('/agents/latest-analysis/');
  },

  // Get job status and results
  getJob: async (jobId: number): Promise<AnalysisJob> => {
    return apiRequest(`/agents/jobs/${jobId}/`);
  },

  // Get detailed analysis results
  getAnalysis: async (jobId: number): Promise<AnalysisResult> => {
    return apiRequest(`/agents/jobs/${jobId}/analysis/`);
  },

  // List all jobs
  listJobs: async (): Promise<{ results: AnalysisJob[] }> => {
    return apiRequest('/agents/jobs/');
  },

  // Quick synchronous analysis (for demos)
  quickAnalyze: async (data: QuickAnalyzeRequest): Promise<QuickAnalyzeResponse> => {
    return apiRequest('/agents/quick-analyze/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get benchmark data
  getBenchmarks: async (): Promise<BenchmarkData> => {
    return apiRequest('/agents/benchmarks/');
  },

  // Regenerate analysis
  regenerateAnalysis: async (jobId: number): Promise<{ message: string; job_id: number }> => {
    return apiRequest(`/agents/jobs/${jobId}/regenerate/`, {
      method: 'POST',
    });
  },
};

// ============================================
// AI INSIGHTS API
// ============================================

export interface AIInsight {
  id: number;
  insight_type: 'market_trend' | 'skill_gap' | 'career_advice' | 'learning_path' | 'salary_insight' | 'project_suggestion';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  relevance_score: number;
  is_read: boolean;
  is_bookmarked: boolean;
  generated_at: string;
  expires_at?: string;
}

export interface InsightsResponse {
  insights: AIInsight[];
  total_count: number;
  unread_count: number;
}

export const insightsAPI = {
  // Get all insights for the user
  getInsights: async (params?: { type?: string; unread_only?: boolean }): Promise<InsightsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.unread_only) queryParams.append('unread_only', 'true');
    const query = queryParams.toString();
    return apiRequest(`/agents/insights/${query ? '?' + query : ''}`);
  },

  // Generate new insights using Gemini
  generateInsights: async (): Promise<{ message: string; insights_count: number }> => {
    return apiRequest('/agents/insights/', { method: 'POST' });
  },

  // Get single insight
  getInsight: async (insightId: number): Promise<AIInsight> => {
    return apiRequest(`/agents/insights/${insightId}/`);
  },

  // Update insight (mark as read, bookmark)
  updateInsight: async (insightId: number, data: Partial<AIInsight>): Promise<AIInsight> => {
    return apiRequest(`/agents/insights/${insightId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete insight
  deleteInsight: async (insightId: number): Promise<void> => {
    return apiRequest(`/agents/insights/${insightId}/`, { method: 'DELETE' });
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  time: string;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
  total_count: number;
}

export const notificationsAPI = {
  // Get all notifications
  getNotifications: async (): Promise<NotificationsResponse> => {
    console.log('[NOTIFICATIONS] Fetching notifications');
    return apiRequest('/notifications/');
  },

  // Mark single notification as read
  markAsRead: async (notificationId: number): Promise<Notification> => {
    console.log('[NOTIFICATIONS] Marking as read:', notificationId);
    return apiRequest(`/notifications/${notificationId}/read/`, {
      method: 'PATCH',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string; count: number }> => {
    console.log('[NOTIFICATIONS] Marking all as read');
    return apiRequest('/notifications/read-all/', {
      method: 'PUT',
    });
  },

  // Delete single notification
  deleteNotification: async (notificationId: number): Promise<void> => {
    console.log('[NOTIFICATIONS] Deleting:', notificationId);
    return apiRequest(`/notifications/${notificationId}/`, {
      method: 'DELETE',
    });
  },

  // Clear all notifications
  clearAll: async (): Promise<{ message: string; count: number }> => {
    console.log('[NOTIFICATIONS] Clearing all');
    return apiRequest('/notifications/clear-all/', {
      method: 'DELETE',
    });
  },
};

// ============================================
// HELPER: Check if user is authenticated
// ============================================

export const isAuthenticated = (): boolean => {
  return !!accessToken;
};

// ============================================
// HELPER: Initialize auth state on app load
// ============================================

export const initializeAuth = async (): Promise<UserProfile | null> => {
  if (!accessToken) return null;
  
  try {
    return await authAPI.getMe();
  } catch {
    clearTokens();
    return null;
  }
};
