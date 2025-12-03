/**
 * Mentor Service for FairFound
 * Handles all mentor-related API calls
 */

// @ts-ignore - Vite env
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://fairfound-backend.onrender.com/api';
const MEDIA_BASE_URL = API_BASE_URL.replace('/api', '');

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Types
export interface MentorData {
  id: number;
  user_id: number; // The user ID for chat/messaging
  name: string;
  image_url: string | null;
  title: string;
  company: string;
  bio: string;
  specialties: string[];
  rate: number;
  rating: number;
  total_reviews: number;
  is_available: boolean;
  session_duration: number;
  timezone: string;
  mentee_count: number;
}

export interface MentorReview {
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

export interface ConnectedMentor {
  id: number;
  name: string;
  image_url: string | null;
  title: string;
  company: string;
  specialties: string[];
  rate: number;
  rating: number;
}

// API Functions
export const mentorAPI = {
  // Get all available mentors
  getMentors: async (): Promise<MentorData[]> => {
    console.log('[MENTOR] Fetching mentors list');
    const response = await fetch(`${API_BASE_URL}/mentors/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch mentors');
    }
    const data = await response.json();
    console.log('[MENTOR] ✅ Fetched mentors:', data.length || data.results?.length);
    return data.results || data;
  },

  // Get single mentor details
  getMentor: async (mentorId: number): Promise<MentorData> => {
    console.log('[MENTOR] Fetching mentor:', mentorId);
    const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch mentor');
    }
    return response.json();
  },

  // Get mentor reviews
  getMentorReviews: async (mentorId: number): Promise<MentorReview[]> => {
    console.log('[MENTOR] Fetching reviews for mentor:', mentorId);
    const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}/reviews/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    const data = await response.json();
    return data.results || data;
  },

  // Connect with a mentor
  connectMentor: async (mentorId: number): Promise<{ message: string }> => {
    console.log('[MENTOR] Connecting with mentor:', mentorId);
    const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}/connect/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect with mentor');
    }
    console.log('[MENTOR] ✅ Connected successfully');
    return response.json();
  },

  // Disconnect from mentor
  disconnectMentor: async (mentorId: number): Promise<{ message: string }> => {
    console.log('[MENTOR] Disconnecting from mentor:', mentorId);
    console.log('[MENTOR] Request URL:', `${API_BASE_URL}/mentors/${mentorId}/disconnect/`);
    
    const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}/disconnect/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    console.log('[MENTOR] Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('[MENTOR] ❌ Disconnect failed:', error);
      throw new Error(error.error || 'Failed to disconnect');
    }
    
    const result = await response.json();
    console.log('[MENTOR] ✅ Disconnect response:', result);
    return result;
  },

  // Submit a review for a mentor
  submitReview: async (mentorId: number, rating: number, comment: string): Promise<MentorReview> => {
    console.log('[MENTOR] Submitting review for mentor:', mentorId);
    console.log('[MENTOR] Review data:', { rating, comment: comment.substring(0, 50) + '...' });
    
    const response = await fetch(`${API_BASE_URL}/mentors/${mentorId}/reviews/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    
    console.log('[MENTOR] Review response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('[MENTOR] ❌ Review submission failed:', error);
      throw new Error(error.error || 'Failed to submit review');
    }
    
    const result = await response.json();
    console.log('[MENTOR] ✅ Review submitted successfully:', result);
    return result;
  },

  // Get current user's connected mentor (from profile)
  getConnectedMentor: async (): Promise<ConnectedMentor | null> => {
    console.log('[MENTOR] Fetching connected mentor');
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      return null;
    }
    const profile = await response.json();
    if (profile.connected_mentor) {
      // Fetch full mentor details
      return mentorAPI.getMentor(profile.connected_mentor);
    }
    return null;
  },
};

// Helper to convert backend mentor to frontend Mentor type
export const mapMentorToFrontend = (mentor: MentorData) => ({
  id: String(mentor.id),
  userId: mentor.user_id, // Include user ID for chat
  name: mentor.name,
  role: mentor.title,
  company: mentor.company,
  imageUrl: mentor.image_url 
    ? (mentor.image_url.startsWith('http') ? mentor.image_url : `${MEDIA_BASE_URL}${mentor.image_url}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff`,
  specialties: mentor.specialties || [],
  rate: Number(mentor.rate),
  rating: Number(mentor.rating),
  available: mentor.is_available,
  totalReviews: mentor.total_reviews,
});

export const mapReviewToFrontend = (review: MentorReview) => ({
  id: String(review.id),
  mentorId: String(review.mentor),
  reviewerId: String(review.reviewer),
  reviewerName: review.reviewer_name,
  reviewerAvatar: review.reviewer_avatar || 'bg-indigo-500',
  rating: review.rating,
  comment: review.comment,
  date: review.created_at,
  helpful: review.helpful,
});


// Helper to convert connected mentor details from profile API to frontend Mentor type
export const mapConnectedMentorToFrontend = (mentor: {
  id: number;
  user_id?: number;
  name: string;
  title: string;
  company: string;
  specialties: string[];
  rate: number;
  rating: number;
  image_url?: string | null;
}) => ({
  id: String(mentor.id),
  userId: mentor.user_id, // Include user ID for chat (may be undefined)
  name: mentor.name,
  role: mentor.title,
  company: mentor.company,
  imageUrl: mentor.image_url 
    ? (mentor.image_url.startsWith('http') ? mentor.image_url : `${MEDIA_BASE_URL}${mentor.image_url}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=6366f1&color=fff`,
  specialties: mentor.specialties || [],
  rate: Number(mentor.rate),
  rating: Number(mentor.rating),
  available: true,
});
