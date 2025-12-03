
export enum View {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  ROADMAP = 'ROADMAP',
  MENTORS = 'MENTORS',
  MY_MENTOR = 'MY_MENTOR', // Freelancer's connected mentor page
  INSIGHTS = 'INSIGHTS',
  PORTFOLIO = 'PORTFOLIO',
  PROPOSALS = 'PROPOSALS',
  SENTIMENT = 'SENTIMENT', // Sentiment Analysis Tool
  COMMUNITY = 'COMMUNITY',
  PRICING = 'PRICING',
  PROFILE = 'PROFILE',
  CHECKOUT = 'CHECKOUT',
  // Mentor Views
  MENTOR_DASHBOARD = 'MENTOR_DASHBOARD',
  MENTOR_CLIENTS = 'MENTOR_CLIENTS',
  MENTOR_CHAT = 'MENTOR_CHAT',
  MENTOR_SESSIONS = 'MENTOR_SESSIONS',
  MENTOR_PROFILE = 'MENTOR_PROFILE'
}

export enum UserRole {
  FREELANCER = 'FREELANCER',
  MENTOR = 'MENTOR'
}

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface FreelancerProfile {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  hourlyRate: number;
  githubUsername?: string;
  portfolioUrl?: string;
  email?: string;
  location?: string;
  avatarUrl?: string;
}

export interface AnalysisData {
  globalReadinessScore: number;
  marketPercentile: number;
  projectedEarnings: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  skillGaps: string[];
  pricingSuggestion: {
    current: number;
    recommended: number;
    reasoning: string;
  };
  metrics: {
    portfolioScore: number;
    githubScore: number;
    communicationScore: number;
    techStackScore: number;
  };
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  resources?: string[];
}

export interface RoadmapResource {
  title: string;
  url: string;
  type: 'docs' | 'youtube' | 'course' | 'link';
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'skill' | 'project' | 'branding';
  tasks?: RoadmapTask[]; // Tasks for pro mode
  resources?: RoadmapResource[]; // Learning resources with links
  mentorApproved?: boolean; // Whether a mentor has approved this step
  mentorNotes?: string; // Notes from mentor
}

export interface Mentor {
  id: string;
  userId?: number; // The user ID for chat/messaging
  name: string;
  role: string;
  company: string;
  imageUrl: string;
  specialties: string[];
  rate: number;
  rating: number;
  available: boolean;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
}

export interface PortfolioContent {
  tagline: string;
  about: string;
  projects: {
    title: string;
    description: string;
    tags: string[];
  }[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
  created_at?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'voice';
  url: string;
  size?: string;
  duration?: string; // For voice messages
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachments?: ChatAttachment[];
  isVoice?: boolean;
}

export interface Chat {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
  };
  lastMessage: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'review' | 'completed';
  feedback?: string;
  stepId?: string; // Parent roadmap step this task belongs to
}

export interface Mentee {
  id: string;
  userId?: number; // The user ID for API calls (different from profile id)
  name: string;
  title: string;
  avatarUrl: string;
  progress: number;
  nextSession: string;
  status: 'active' | 'paused';
  roadmap: RoadmapStep[];
  tasks: Task[];
  skills?: string[];
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
  location?: string;
  githubUsername?: string;
  portfolioUrl?: string;
  analysis?: {
    overall_score?: number;
    percentile?: number;
    strengths?: string[];
    weaknesses?: string[];
    skill_gaps?: string[];
    summary?: string;
    market_position?: {
      suggested_hourly_rate?: number;
      market_demand?: string;
    };
    metrics?: {
      portfolio_score?: number;
      github_score?: number;
      skill_score?: number;
      experience_score?: number;
    };
  };
}

// Session Booking Types
export interface TimeSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
}

export interface MentorAvailability {
  slots: TimeSlot[];
  sessionDuration: number; // in minutes (30, 45, 60)
  timezone: string;
}

export interface Session {
  id: string;
  menteeId: string;
  menteeName: string;
  menteeAvatar: string;
  mentorId: string;
  date: string; // ISO date string
  time: string; // e.g., "14:00"
  duration: number; // in minutes
  topic: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
}

// Mentor Review Types
export interface MentorReview {
  id: string;
  mentorId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string;
  helpful: number; // Number of people who found this helpful
}
