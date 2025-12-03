/**
 * Roadmap Service for FairFound
 * Handles all roadmap-related API calls
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
export interface ResourceData {
  title: string;
  url: string;
  type: 'docs' | 'youtube' | 'course' | 'link';
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
  resources?: ResourceData[];
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

export interface RoadmapStatusResponse {
  has_roadmap: boolean;
  message?: string;
  total_steps?: number;
  completed?: number;
  in_progress?: number;
  pending?: number;
  progress_percentage?: number;
}

export interface GenerateRoadmapResponse {
  message: string;
  steps: RoadmapStepData[];
}

// API Functions
export const roadmapAPI = {
  // Get all roadmap steps for current user
  getRoadmap: async (): Promise<RoadmapStepData[]> => {
    console.log('[ROADMAP] Fetching roadmap');
    const response = await fetch(`${API_BASE_URL}/roadmap/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch roadmap');
    }
    const data = await response.json();
    console.log('[ROADMAP] ✅ Fetched roadmap:', data.length || data.results?.length || 0, 'steps');
    return data.results || data;
  },

  // Check roadmap status
  getStatus: async (): Promise<RoadmapStatusResponse> => {
    console.log('[ROADMAP] Checking roadmap status');
    const response = await fetch(`${API_BASE_URL}/roadmap/status/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to check roadmap status');
    }
    return response.json();
  },

  // Generate new roadmap with Gemini AI
  generateRoadmap: async (skillGaps: string[]): Promise<GenerateRoadmapResponse> => {
    console.log('[ROADMAP] Generating roadmap for skill gaps:', skillGaps);
    const response = await fetch(`${API_BASE_URL}/roadmap/generate/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill_gaps: skillGaps }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate roadmap');
    }
    const data = await response.json();
    console.log('[ROADMAP] ✅ Generated roadmap:', data.steps?.length || 0, 'steps');
    return data;
  },

  // Update step status
  updateStepStatus: async (stepId: number, status: string): Promise<RoadmapStepData> => {
    console.log('[ROADMAP] Updating step status:', stepId, status);
    const response = await fetch(`${API_BASE_URL}/roadmap/steps/${stepId}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update step status');
    }
    return response.json();
  },

  // Create a new step manually
  createStep: async (step: Partial<RoadmapStepData>): Promise<RoadmapStepData> => {
    console.log('[ROADMAP] Creating step:', step.title);
    const response = await fetch(`${API_BASE_URL}/roadmap/steps/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(step),
    });
    if (!response.ok) {
      throw new Error('Failed to create step');
    }
    return response.json();
  },

  // Delete a step
  deleteStep: async (stepId: number): Promise<void> => {
    console.log('[ROADMAP] Deleting step:', stepId);
    const response = await fetch(`${API_BASE_URL}/roadmap/steps/${stepId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete step');
    }
  },
};

// Helper to convert backend step to frontend RoadmapStep type
export const mapStepToFrontend = (step: RoadmapStepData) => ({
  id: String(step.id),
  title: step.title,
  description: step.description,
  duration: step.duration,
  status: step.status,
  type: step.type,
  mentorApproved: step.mentor_approved,
  mentorNotes: step.mentor_notes,
  tasks: step.tasks?.map(task => ({
    id: String(task.id),
    title: task.title,
    description: task.description,
    completed: task.status === 'completed',
    dueDate: task.due_date,
  })) || [],
  resources: step.resources || [],
});
