/**
 * Mentor Dashboard Service for FairFound
 * Handles all mentor-side API calls for managing mentees, roadmaps, and tasks
 */

// @ts-ignore - Vite env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://fairfound-backend.onrender.com/api';
const MEDIA_BASE_URL = API_BASE_URL.replace('/api', '');

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Types
export interface MenteeData {
  id: number;
  user_id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  title: string;
  bio: string;
  skills: string[];
  experience_years: number;
  hourly_rate: number;
  location: string;
  roadmap: RoadmapStepData[];
  tasks: TaskData[];
  analysis?: AnalysisData;
}

export interface RoadmapStepData {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'skill' | 'project' | 'branding';
  mentor_approved: boolean;
  mentor_notes: string;
  order: number;
  tasks: TaskData[];
  created_at: string;
}

export interface TaskData {
  id: number;
  step_id: number | null;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'review' | 'completed';
  feedback: string;
  created_at: string;
}

export interface AnalysisData {
  overall_score: number;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
  skill_gaps: string[];
  summary?: string;
  market_position?: {
    suggested_hourly_rate?: number;
    market_demand?: string;
  };
  metrics?: {
    portfolio_score: number;
    github_score: number;
    skill_score: number;
    experience_score: number;
  };
}

export interface MentorReviewData {
  id: number;
  mentor: number;
  reviewer: number;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  comment: string;
  helpful: number;
  created_at: string;
}

export interface AvailabilitySlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
}

export interface AvailabilityData {
  slots: AvailabilitySlot[];
  session_duration: number;
  timezone: string;
}

export interface SessionData {
  id: number;
  mentor: number;
  mentee: number;
  mentee_name: string;
  mentee_avatar: string | null;
  mentor_name: string;
  date: string;
  time: string;
  duration: number;
  topic: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes: string;
  meeting_link: string | null;
  created_at: string;
}

// API Functions
export const mentorDashboardAPI = {
  // Get all mentees for the current mentor
  getMentees: async (): Promise<MenteeData[]> => {
    console.log('[MENTOR] Fetching mentees');
    const response = await fetch(`${API_BASE_URL}/mentees/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch mentees');
    }
    const data = await response.json();
    console.log('[MENTOR] ✅ Fetched mentees:', data.length);
    return data;
  },

  // Get single mentee details with roadmap and tasks
  getMentee: async (menteeId: number): Promise<MenteeData> => {
    console.log('[MENTOR] Fetching mentee:', menteeId);
    const response = await fetch(`${API_BASE_URL}/mentees/${menteeId}/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch mentee');
    }
    return response.json();
  },

  // ============ ROADMAP STEP CRUD ============

  // Create a new roadmap step for a mentee
  createStep: async (menteeUserId: number, step: Partial<RoadmapStepData>): Promise<RoadmapStepData> => {
    console.log('[MENTOR] Creating step for mentee:', menteeUserId);
    const response = await fetch(`${API_BASE_URL}/mentees/${menteeUserId}/steps/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(step),
    });
    if (!response.ok) {
      throw new Error('Failed to create step');
    }
    return response.json();
  },

  // Update a roadmap step
  updateStep: async (stepId: number, data: Partial<RoadmapStepData>): Promise<RoadmapStepData> => {
    console.log('[MENTOR] Updating step:', stepId);
    const response = await fetch(`${API_BASE_URL}/roadmap/steps/${stepId}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update step');
    }
    return response.json();
  },

  // Delete a roadmap step
  deleteStep: async (stepId: number): Promise<void> => {
    console.log('[MENTOR] Deleting step:', stepId);
    const response = await fetch(`${API_BASE_URL}/roadmap/steps/${stepId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete step');
    }
  },

  // ============ TASK CRUD ============

  // Create a new task for a mentee
  createTask: async (menteeUserId: number, task: Partial<TaskData>): Promise<TaskData> => {
    console.log('[MENTOR] Creating task for mentee:', menteeUserId);
    const response = await fetch(`${API_BASE_URL}/mentees/${menteeUserId}/tasks/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  },

  // Update a task
  updateTask: async (taskId: number, data: Partial<TaskData>): Promise<TaskData> => {
    console.log('[MENTOR] Updating task:', taskId);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  },

  // Delete a task
  deleteTask: async (taskId: number): Promise<void> => {
    console.log('[MENTOR] Deleting task:', taskId);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  },

  // Update task status
  updateTaskStatus: async (taskId: number, status: string, feedback?: string): Promise<TaskData> => {
    console.log('[MENTOR] Updating task status:', taskId, status);
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, feedback }),
    });
    if (!response.ok) {
      throw new Error('Failed to update task status');
    }
    return response.json();
  },

  // ============ DASHBOARD STATS ============

  // Get mentor dashboard stats
  getDashboardStats: async (): Promise<{
    active_mentees: number;
    pending_reviews: number;
    upcoming_sessions: number;
    total_earnings: number;
  }> => {
    console.log('[MENTOR] Fetching dashboard stats');
    const response = await fetch(`${API_BASE_URL}/mentors/dashboard/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      // Return mock data if endpoint doesn't exist yet
      return {
        active_mentees: 0,
        pending_reviews: 0,
        upcoming_sessions: 0,
        total_earnings: 0,
      };
    }
    return response.json();
  },

  // ============ REVIEWS ============

  // Get reviews for the current mentor
  getReviews: async (): Promise<MentorReviewData[]> => {
    console.log('[MENTOR] Fetching reviews');
    // Try the dedicated my-reviews endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/mentors/my-reviews/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('[MENTOR] ✅ Fetched reviews:', data.length);
        return data;
      }
    } catch {
      console.log('[MENTOR] my-reviews endpoint not available, falling back');
    }
    
    // Fallback: Get current user's mentor profile ID
    const meResponse = await fetch(`${API_BASE_URL}/auth/me/`, {
      headers: getAuthHeaders(),
    });
    if (!meResponse.ok) {
      throw new Error('Failed to get current user');
    }
    const me = await meResponse.json();
    
    // If user has mentor_profile_id, use it directly
    if (me.mentor_profile_id) {
      const reviewsResponse = await fetch(`${API_BASE_URL}/mentors/${me.mentor_profile_id}/reviews/`, {
        headers: getAuthHeaders(),
      });
      if (reviewsResponse.ok) {
        return reviewsResponse.json();
      }
    }
    
    // Last resort: search mentors list
    const profileResponse = await fetch(`${API_BASE_URL}/mentors/`, {
      headers: getAuthHeaders(),
    });
    if (!profileResponse.ok) {
      return [];
    }
    const mentorsData = await profileResponse.json();
    const mentors = mentorsData.results || mentorsData;
    const myProfile = mentors.find((m: any) => m.user_id === me.id || m.name === me.username);
    
    if (!myProfile) {
      console.log('[MENTOR] Could not find mentor profile');
      return [];
    }
    
    // Get reviews for this mentor
    const reviewsResponse = await fetch(`${API_BASE_URL}/mentors/${myProfile.id}/reviews/`, {
      headers: getAuthHeaders(),
    });
    if (!reviewsResponse.ok) {
      return [];
    }
    return reviewsResponse.json();
  },

  // ============ SESSIONS ============

  // Get all sessions for the current user (works for both mentors and mentees)
  getSessions: async (): Promise<SessionData[]> => {
    console.log('[MENTOR] Fetching sessions');
    const response = await fetch(`${API_BASE_URL}/sessions/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    const data = await response.json();
    // Handle both paginated and non-paginated responses
    return Array.isArray(data) ? data : (data.results || []);
  },

  // Update session status
  updateSessionStatus: async (sessionId: number, status: string): Promise<SessionData> => {
    console.log('[MENTOR] Updating session status:', sessionId, status);
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update session status');
    }
    return response.json();
  },

  // Create a new session
  createSession: async (session: Partial<SessionData>): Promise<SessionData> => {
    console.log('[MENTOR] Creating session');
    const response = await fetch(`${API_BASE_URL}/sessions/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(session),
    });
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    return response.json();
  },

  // Generate roadmap with tasks for a mentee (when mentor connects)
  generateMenteeRoadmap: async (menteeUserId: number, skillGaps: string[]): Promise<RoadmapStepData[]> => {
    console.log('[MENTOR] Generating roadmap for mentee:', menteeUserId);
    const response = await fetch(`${API_BASE_URL}/mentees/${menteeUserId}/generate-roadmap/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill_gaps: skillGaps }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate roadmap');
    }
    const data = await response.json();
    return data.steps;
  },

  // Generate a single AI step for preview
  generateSingleStep: async (menteeUserId: number, skillGaps: string[], userSkills: string[]): Promise<{
    title: string;
    description: string;
    duration: string;
    type: 'skill' | 'project' | 'branding';
    tasks: { title: string; description: string }[];
  }> => {
    console.log('[MENTOR] Generating single AI step for mentee:', menteeUserId);
    const response = await fetch(`${API_BASE_URL}/mentees/${menteeUserId}/generate-step/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill_gaps: skillGaps, user_skills: userSkills }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate AI step');
    }
    return response.json();
  },

  // Create a step with tasks after mentor review
  createStepWithTasks: async (menteeUserId: number, stepData: {
    title: string;
    description: string;
    duration: string;
    type: string;
    tasks: { title: string; description: string }[];
  }): Promise<RoadmapStepData> => {
    console.log('[MENTOR] Creating step with tasks for mentee:', menteeUserId);
    const response = await fetch(`${API_BASE_URL}/mentees/${menteeUserId}/create-step-with-tasks/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stepData),
    });
    if (!response.ok) {
      throw new Error('Failed to create step with tasks');
    }
    const data = await response.json();
    return data.step;
  },

  // ============ AVAILABILITY ============

  // Get mentor's availability settings
  getAvailability: async (): Promise<AvailabilityData> => {
    console.log('[MENTOR] Fetching availability');
    const response = await fetch(`${API_BASE_URL}/mentors/availability/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }
    return response.json();
  },

  // Update mentor's availability settings
  updateAvailability: async (data: AvailabilityData): Promise<AvailabilityData> => {
    console.log('[MENTOR] Updating availability');
    const response = await fetch(`${API_BASE_URL}/mentors/availability/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update availability');
    }
    return response.json();
  },

  // ============ BULK NOTIFICATIONS ============

  // Send bulk notification to multiple mentees
  sendBulkNotification: async (data: {
    mentee_ids?: number[];
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning';
  }): Promise<{ message: string; count: number }> => {
    console.log('[MENTOR] Sending bulk notification');
    const response = await fetch(`${API_BASE_URL}/notifications/bulk/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to send bulk notification');
    }
    return response.json();
  },
};

// Helper to map backend mentee to frontend format
export const mapMenteeToFrontend = (mentee: MenteeData) => ({
  id: String(mentee.id),
  userId: mentee.user_id, // Store user_id for API calls
  name: mentee.name,
  title: mentee.title,
  bio: mentee.bio,
  experienceYears: mentee.experience_years,
  hourlyRate: mentee.hourly_rate,
  location: mentee.location,
  avatarUrl: mentee.avatar_url
    ? mentee.avatar_url.startsWith('http')
      ? mentee.avatar_url
      : `${MEDIA_BASE_URL}${mentee.avatar_url}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentee.name)}&background=6366f1&color=fff`,
  progress: calculateProgress(mentee),
  nextSession: 'Not Scheduled',
  status: 'active' as const,
  roadmap: mentee.roadmap?.map(mapStepToFrontend) || [],
  tasks: mentee.tasks?.map(mapTaskToFrontend) || [],
  skills: mentee.skills || [],
  analysis: mentee.analysis,
});

export const mapStepToFrontend = (step: RoadmapStepData) => ({
  id: String(step.id),
  title: step.title,
  description: step.description,
  duration: step.duration,
  status: step.status,
  type: step.type,
  mentorApproved: step.mentor_approved,
  mentorNotes: step.mentor_notes,
  // Include nested tasks from the step
  tasks: step.tasks?.map(t => ({
    id: String(t.id),
    title: t.title,
    description: t.description,
    completed: t.status === 'completed',
    dueDate: t.due_date,
  })) || [],
});

export const mapTaskToFrontend = (task: TaskData) => ({
  id: String(task.id),
  title: task.title,
  description: task.description,
  dueDate: task.due_date,
  status: task.status,
  feedback: task.feedback,
  stepId: task.step_id ? String(task.step_id) : undefined,
});

const calculateProgress = (mentee: MenteeData): number => {
  const steps = mentee.roadmap || [];
  if (steps.length === 0) return 0;
  const completed = steps.filter(s => s.status === 'completed').length;
  return Math.round((completed / steps.length) * 100);
};
