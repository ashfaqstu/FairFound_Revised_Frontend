<div align="center">
  <img src="./images/icon128.png" alt="FairFound Logo" width="80" height="80" />
  <h1>FairFound</h1>
  <p><strong>AI-Powered Career Growth Platform for Freelancers</strong></p>
  <p>Empowering freelancers with data-driven insights, personalized roadmaps, and expert mentorship</p>
  
  ![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
  ![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)
  ![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?logo=google)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [AI Services](#ai-services)

---

## 🎯 Overview

FairFound is a comprehensive career growth platform designed to help freelancers level up their skills, optimize their pricing, and connect with experienced mentors. The platform leverages Google's Gemini AI to provide personalized insights, generate roadmaps, and assist with various career-building tasks.

### Key Value Propositions

- **For Freelancers**: Get AI-powered career analysis, personalized growth roadmaps, portfolio optimization, and connect with mentors
- **For Mentors**: Manage mentees, assign tasks, track progress, and earn income by sharing expertise

---

## ✨ Features

### Freelancer Features

| Feature | Description |
|---------|-------------|
| **AI Profile Analysis** | SWOT analysis, readiness scoring, and market positioning |
| **Dynamic Roadmaps** | Personalized week-by-week growth plans with task tracking |
| **Portfolio Builder** | AI-generated portfolio content with project showcases |
| **Proposal Generator** | AI-powered cover letter and proposal writing |
| **Sentiment Analyzer** | Analyze client reviews to identify improvement areas |
| **Mentor Matching** | Find and connect with experienced mentors |
| **AI Chatbot** | Context-aware assistant for guidance (freelancers only) |
| **Community Hub** | Connect with other freelancers, share wins, ask questions |
| **Gamification** | XP, levels, streaks, and badges for engagement |


### Mentor Features

| Feature | Description |
|---------|-------------|
| **Mentor Dashboard** | Overview of mentees, sessions, and earnings |
| **Client Management** | Manage mentees with detailed profiles and progress tracking |
| **AI Task Generation** | Generate personalized tasks for mentees with AI |
| **AI Roadmap Steps** | Create roadmap steps with AI assistance |
| **Session Management** | Schedule, accept/reject, and manage mentoring sessions |
| **Chat System** | Real-time messaging with mentees (text, files, voice) |
| **Bulk Notifications** | Send announcements to multiple mentees |

### Access Control

- **Without Mentor**: Freelancers can self-manage their roadmap tasks
- **With Mentor**: Only mentors can mark tasks as complete for accountability

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Components │  │   Services  │  │      State (useState)   │  │
│  │  (25+ TSX)  │  │ geminiSvc   │  │  Profile, Analysis,     │  │
│  │             │  │             │  │  Roadmap, Notifications │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     External Services                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Google Gemini AI (gemini-2.5-flash)        │    │
│  │  • Profile Analysis    • Roadmap Generation             │    │
│  │  • Task Generation     • Proposal Writing               │    │
│  │  • Sentiment Analysis  • Portfolio Enhancement          │    │
│  │  • AI Chatbot          • Mentor Feedback                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App.tsx (Main Router & State)
├── LandingPage.tsx (Public)
├── Login.tsx / Signup.tsx (Auth)
├── Onboarding.tsx (Profile Setup)
│
├── [Freelancer Views]
│   ├── Dashboard.tsx (Overview + Analytics)
│   ├── Insights.tsx (SWOT + Metrics)
│   ├── Roadmap.tsx (Growth Plan)
│   ├── Mentors.tsx (Find Mentors)
│   ├── MyMentor.tsx (Connected Mentor)
│   ├── PortfolioBuilder.tsx
│   ├── ProposalGenerator.tsx
│   ├── SentimentAnalyzer.tsx
│   ├── Community.tsx
│   └── Profile.tsx
│
├── [Mentor Views]
│   ├── MentorDashboard.tsx
│   ├── MentorClients.tsx (Mentee Management)
│   ├── MentorSessions.tsx (Scheduling)
│   └── ChatSystem.tsx (Messaging)
│
└── [Shared Components]
    ├── Sidebar.tsx (Navigation)
    ├── Breadcrumbs.tsx
    ├── ThemeToggle.tsx
    ├── AIChatbot.tsx (Freelancers only)
    ├── Pricing.tsx
    └── Checkout.tsx
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19.2 with TypeScript |
| **Build Tool** | Vite 6.2 |
| **Styling** | Tailwind CSS (utility classes) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **AI** | Google Gemini AI (@google/genai) |
| **State** | React useState + localStorage |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FairFound_Revised_Frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Gemini API key to .env.local
# API_KEY=your_gemini_api_key_here

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```


---

## 📁 Project Structure

```
FairFound_Revised_Frontend/
├── components/
│   ├── AIChatbot.tsx          # AI assistant (freelancers only)
│   ├── Breadcrumbs.tsx        # Navigation breadcrumbs
│   ├── ChatSystem.tsx         # Mentor-mentee messaging
│   ├── Checkout.tsx           # Payment flow
│   ├── Community.tsx          # Community hub
│   ├── Dashboard.tsx          # Freelancer dashboard
│   ├── Insights.tsx           # AI analysis results
│   ├── LandingPage.tsx        # Public landing page
│   ├── Login.tsx              # Authentication
│   ├── MentorClients.tsx      # Mentee management
│   ├── MentorDashboard.tsx    # Mentor overview
│   ├── Mentors.tsx            # Mentor discovery
│   ├── MentorSessions.tsx     # Session scheduling
│   ├── MyMentor.tsx           # Connected mentor view
│   ├── Onboarding.tsx         # Profile setup wizard
│   ├── PortfolioBuilder.tsx   # Portfolio generator
│   ├── Pricing.tsx            # Subscription plans
│   ├── Profile.tsx            # User profile
│   ├── ProposalGenerator.tsx  # AI proposal writer
│   ├── Roadmap.tsx            # Growth roadmap
│   ├── SentimentAnalyzer.tsx  # Review analysis
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── Signup.tsx             # Registration
│   └── ThemeToggle.tsx        # Dark/light mode
├── services/
│   └── geminiService.ts       # AI service layer
├── images/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── App.tsx                    # Main application
├── types.ts                   # TypeScript definitions
├── constants.ts               # App constants
├── index.tsx                  # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 👥 User Roles

### Freelancer (Default)

- Access to all self-service features
- Can connect with mentors (paid)
- AI chatbot available
- Can manage own tasks (when no mentor connected)

### Mentor

- Dedicated mentor dashboard
- Manage multiple mentees
- AI-assisted task and roadmap generation
- Session scheduling and management
- No AI chatbot (mentor-specific tools instead)

---

## 🔌 API Endpoints (Backend Required)

The frontend is designed to work with a backend API. Below are the required endpoints:

### Authentication

```
POST   /api/auth/login          # User login
POST   /api/auth/signup         # User registration
POST   /api/auth/logout         # User logout
GET    /api/auth/me             # Get current user
```

### User Profile

```
GET    /api/profile             # Get user profile
PUT    /api/profile             # Update profile
POST   /api/profile/avatar      # Upload avatar
```

### Analysis & Insights

```
POST   /api/analysis/profile    # Analyze freelancer profile
GET    /api/analysis/history    # Get analysis history
```

### Roadmap

```
GET    /api/roadmap             # Get user's roadmap
POST   /api/roadmap/steps       # Add roadmap step
PUT    /api/roadmap/steps/:id   # Update step status
DELETE /api/roadmap/steps/:id   # Delete step
POST   /api/roadmap/generate    # AI generate roadmap
```

### Tasks

```
GET    /api/tasks               # Get all tasks
POST   /api/tasks               # Create task
PUT    /api/tasks/:id           # Update task
DELETE /api/tasks/:id           # Delete task
PUT    /api/tasks/:id/status    # Update task status
```

### Mentors

```
GET    /api/mentors             # List available mentors
GET    /api/mentors/:id         # Get mentor details
GET    /api/mentors/:id/reviews # Get mentor reviews
POST   /api/mentors/:id/connect # Connect with mentor
DELETE /api/mentors/:id/disconnect # Disconnect from mentor
```

### Sessions (Mentor)

```
GET    /api/sessions            # Get all sessions
POST   /api/sessions            # Book a session
PUT    /api/sessions/:id        # Update session
PUT    /api/sessions/:id/status # Accept/reject session
DELETE /api/sessions/:id        # Cancel session
```

### Mentees (Mentor)

```
GET    /api/mentees             # Get mentor's mentees
GET    /api/mentees/:id         # Get mentee details
PUT    /api/mentees/:id/roadmap # Update mentee roadmap
PUT    /api/mentees/:id/tasks   # Update mentee tasks
```

### Chat

```
GET    /api/chats               # Get all chats
GET    /api/chats/:id/messages  # Get chat messages
POST   /api/chats/:id/messages  # Send message
POST   /api/chats/:id/attachments # Upload attachment
```

### Portfolio & Proposals

```
GET    /api/portfolio           # Get portfolio
POST   /api/portfolio/generate  # AI generate portfolio
PUT    /api/portfolio           # Update portfolio
POST   /api/proposals/generate  # AI generate proposal
```

### Sentiment Analysis

```
POST   /api/sentiment/analyze   # Analyze reviews
GET    /api/sentiment/history   # Get analysis history
```

### Community

```
GET    /api/community/posts     # Get community posts
POST   /api/community/posts     # Create post
POST   /api/community/posts/:id/like    # Like post
POST   /api/community/posts/:id/comment # Comment on post
```

### Notifications & Payments

```
GET    /api/notifications       # Get notifications
PUT    /api/notifications/read  # Mark all as read
POST   /api/payments/checkout   # Create checkout session
POST   /api/payments/webhook    # Payment webhook
```


---

## 📊 Data Models

### FreelancerProfile

```typescript
interface FreelancerProfile {
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
```

### AnalysisData

```typescript
interface AnalysisData {
  globalReadinessScore: number;    // 0-100
  marketPercentile: number;        // 0-100
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
```

### RoadmapStep

```typescript
interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'skill' | 'project' | 'branding';
  tasks?: RoadmapTask[];
  mentorApproved?: boolean;
  mentorNotes?: string;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'review' | 'completed';
  feedback?: string;
  stepId?: string;  // Parent roadmap step
}
```

### Mentee (Mentor View)

```typescript
interface Mentee {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  progress: number;
  nextSession: string;
  status: 'active' | 'paused';
  roadmap: RoadmapStep[];
  tasks: Task[];
}
```

### Session

```typescript
interface Session {
  id: string;
  menteeId: string;
  menteeName: string;
  menteeAvatar: string;
  mentorId: string;
  date: string;
  time: string;
  duration: number;
  topic: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  meetingLink?: string;
}
```

---

## 🤖 AI Services

All AI features are powered by Google Gemini (`gemini-2.5-flash`):

| Service | Function | Description |
|---------|----------|-------------|
| `analyzeProfileWithGemini` | Profile Analysis | SWOT analysis, scoring, pricing recommendations |
| `generateRoadmapWithGemini` | Roadmap Generation | 4-week personalized growth plan |
| `generateRoadmapStepForMentee` | Step Generation | Single roadmap step for mentee |
| `generateSingleTaskForMentee` | Task Generation | Single task with edit capability |
| `generateMenteeTasks` | Bulk Tasks | Multiple tasks for mentee |
| `generateProposalWithGemini` | Proposal Writing | AI-powered cover letters |
| `enhancePortfolioWithGemini` | Portfolio Content | Tagline, about, project descriptions |
| `analyzeSentiment` | Review Analysis | Sentiment scoring with actionable steps |
| `chatWithAI` | AI Chatbot | Context-aware assistant |
| `generateMentorFeedback` | Task Feedback | Constructive feedback on submissions |

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Required
API_KEY=your_gemini_api_key

# Optional (for backend integration)
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

---

## 🎨 Theming

- Dark/Light mode support with Tailwind CSS
- Theme preference saved to localStorage
- System preference detection
- Smooth transitions between themes

---

## 📱 Responsive Design

- Mobile-first approach
- Sidebar hidden on mobile (md breakpoint)
- Responsive grids and layouts
- Touch-friendly interactions

---

## 🔮 Future Enhancements

- [ ] Real-time chat with WebSockets
- [ ] Video call integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team/agency accounts
- [ ] API marketplace integration
- [ ] Multi-language support

---

## 📄 License

MIT License - see LICENSE file for details.

---

<div align="center">
  <p>Built with ❤️ for the freelance community</p>
  <p><strong>FairFound</strong> - Level Up Your Freelance Career</p>
</div>
