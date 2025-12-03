import React, { useState, useEffect } from 'react';
import { View, FreelancerProfile, AnalysisData, RoadmapStep, Notification, UserRole, Mentor } from './types';
import { analyzeProfileWithGemini, generateRoadmapWithGemini } from './services/geminiService';
import { analyzeProfileWithAgents, saveProfileToBackend } from './services/agentsService';
import { authAPI, clearTokens, isAuthenticated, initializeAuth, notificationsAPI, agentsAPI, profileAPI } from './services/api';
import { mapConnectedMentorToFrontend } from './services/mentorService';
import { INITIAL_ROADMAP } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Roadmap from './components/Roadmap';
import Mentors from './components/Mentors';
import MyMentor from './components/MyMentor';
import Insights from './components/Insights';
import PortfolioBuilder from './components/PortfolioBuilder';
import ProposalGenerator from './components/ProposalGenerator';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import Community from './components/Community';
import LandingPage from './components/LandingPage';
import Breadcrumbs from './components/Breadcrumbs';
import ThemeToggle from './components/ThemeToggle';
import Pricing from './components/Pricing';
import Profile from './components/Profile';
import Checkout from './components/Checkout';
import MentorDashboard from './components/MentorDashboard';
import MentorClients from './components/MentorClients';
import MentorSessions from './components/MentorSessions';
import MentorProfile from './components/MentorProfile';
import ChatSystem from './components/ChatSystem';
import Login from './components/Login';
import Signup from './components/Signup';
import AIChatbot from './components/AIChatbot';
import { Bell, Search, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.FREELANCER);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>(INITIAL_ROADMAP);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [gamification] = useState({
    xp: 240,
    level: 3,
    streak: 5,
    badges: ['Early Adopter']
  });
  const [connectedMentor, setConnectedMentor] = useState<Mentor | null>(null);

  // Load theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[APP] Checking authentication...');
      if (isAuthenticated()) {
        try {
          const userProfile = await initializeAuth();
          if (userProfile) {
            console.log('[APP] ✅ User authenticated:', userProfile.username);
            setIsSignedUp(true);
            setUserRole(userProfile.role === 'mentor' ? UserRole.MENTOR : UserRole.FREELANCER);
            setProfile({
              name: userProfile.name || userProfile.username,
              title: userProfile.title || 'Frontend Developer',
              bio: userProfile.bio || '',
              skills: userProfile.skills || [],
              experienceYears: userProfile.experience_years || 0,
              hourlyRate: userProfile.hourly_rate || 0,
              email: userProfile.email,
              location: userProfile.location,
              githubUsername: userProfile.github_username,
              portfolioUrl: userProfile.portfolio_url,
              avatarUrl: userProfile.avatar
            });
            // Load notifications after successful auth
            loadNotifications();
            
            // Load connected mentor from profile
            if (userProfile.role !== 'mentor') {
              try {
                const profileData = await profileAPI.getProfile();
                if (profileData.connected_mentor_details) {
                  console.log('[APP] ✅ Found connected mentor:', profileData.connected_mentor_details.name);
                  setConnectedMentor(mapConnectedMentorToFrontend(profileData.connected_mentor_details));
                  setIsPro(true);
                }
              } catch {
                console.log('[APP] Could not load connected mentor');
              }
            }
            
            // Load stored analysis from backend
            if (userProfile.role !== 'mentor') {
              try {
                const storedAnalysis = await agentsAPI.getLatestAnalysis();
                if (storedAnalysis.has_analysis && storedAnalysis.evaluation) {
                  console.log('[APP] ✅ Loaded stored analysis');
                  const analysisData: AnalysisData = {
                    globalReadinessScore: (storedAnalysis.overall_score || 0) * 100,
                    marketPercentile: storedAnalysis.percentile || 0,
                    projectedEarnings: (storedAnalysis.evaluation?.market_position?.suggested_hourly_rate || 45) * 160,
                    strengths: storedAnalysis.evaluation?.strengths || [],
                    weaknesses: storedAnalysis.evaluation?.areas_for_improvement || [],
                    opportunities: ['Remote work opportunities', 'Growing demand for React developers'],
                    threats: ['Increasing competition', 'Rapid technology changes'],
                    skillGaps: storedAnalysis.benchmark?.market_insights?.skill_gaps || [],
                    pricingSuggestion: {
                      current: userProfile.hourly_rate || 0,
                      recommended: storedAnalysis.evaluation?.market_position?.suggested_hourly_rate || 45,
                      reasoning: storedAnalysis.evaluation?.summary || ''
                    },
                    metrics: {
                      portfolioScore: (storedAnalysis.breakdown?.portfolio_quality?.raw_score || 0.5) * 100,
                      githubScore: (storedAnalysis.breakdown?.github_activity?.raw_score || 0.5) * 100,
                      communicationScore: 75,
                      techStackScore: (storedAnalysis.breakdown?.skill_strength?.raw_score || 0.5) * 100
                    }
                  };
                  setAnalysis(analysisData);
                }
              } catch {
                console.log('[APP] No stored analysis found');
              }
            }
            
            setCurrentView(userProfile.role === 'mentor' ? View.MENTOR_DASHBOARD : View.DASHBOARD);
          }
        } catch {
          console.log('[APP] Auth check failed, clearing tokens');
          clearTokens();
        }
      }
    };
    checkAuth();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev: boolean) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newTheme;
    });
  };

  // Load notifications from backend
  const loadNotifications = async () => {
    if (!isAuthenticated()) return;
    try {
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.notifications);
      setUnreadNotificationCount(response.unread_count);
    } catch (err) {
      console.error('[APP] Failed to load notifications:', err);
    }
  };

  // Poll notifications every 10 seconds when signed in
  useEffect(() => {
    if (!isSignedUp) return;
    
    const pollNotifications = setInterval(() => {
      loadNotifications();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollNotifications);
  }, [isSignedUp]);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[APP] Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error('[APP] Failed to mark all as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[APP] Failed to delete notification:', err);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationsAPI.clearAll();
      setNotifications([]);
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error('[APP] Failed to clear notifications:', err);
    }
  };

  const addNotification = (notif: Notification) => {
    setNotifications((prev: Notification[]) => [notif, ...prev]);
    if (!notif.read) {
      setUnreadNotificationCount(prev => prev + 1);
    }
  };

  const handleOnboardingComplete = async (data: FreelancerProfile) => {
    setLoading(true);
    setProfile(data);
    console.log('[APP] Onboarding complete, starting analysis...');
    console.log('[APP] Is authenticated:', isAuthenticated());
    console.log('[APP] Is signup flow:', isSignupFlow);
    
    try {
      // Save profile to backend if authenticated
      if (isAuthenticated()) {
        console.log('[APP] Saving profile to backend...');
        await saveProfileToBackend(data);
      }
      
      // Use agents API for analysis
      let result: AnalysisData;
      try {
        console.log('[APP] Running agents analysis...');
        result = await analyzeProfileWithAgents(data);
        console.log('[APP] ✅ Agents analysis complete');
      } catch (agentError) {
        console.log('[APP] Agents failed, falling back to Gemini:', agentError);
        result = await analyzeProfileWithGemini(data);
      }
      setAnalysis(result);
      
      // Generate roadmap if we have skill gaps
      if (result.skillGaps.length > 0) {
        console.log('[APP] Generating roadmap for skill gaps:', result.skillGaps);
        const aiRoadmap = await generateRoadmapWithGemini(data, result.skillGaps);
        if (aiRoadmap.length > 0) {
          setRoadmap(aiRoadmap);
        }
      }
      
      // Handle different signup flows
      if (isSignupFlow) {
        setIsSignedUp(true);
        setIsSignupFlow(false);
        addNotification({
          id: Date.now(),
          title: 'Account Created!',
          message: 'Welcome to FairFound! You now have full access to all features.',
          time: 'Just now',
          read: false,
          type: 'success'
        });
      } else if (isAuthenticated()) {
        setIsSignedUp(true);
        addNotification({
          id: Date.now(),
          title: 'Profile Updated!',
          message: 'Your profile has been analyzed and saved.',
          time: 'Just now',
          read: false,
          type: 'success'
        });
      } else {
        addNotification({
          id: Date.now(),
          title: 'Welcome Aboard',
          message: 'Your profile setup is complete. Sign up to unlock all features!',
          time: 'Just now',
          read: false,
          type: 'success'
        });
      }
      
      setCurrentView(View.DASHBOARD);
    } catch (e) {
      console.error('[APP] ❌ Onboarding error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (role: UserRole, userData?: { name: string; email: string }) => {
    console.log('[APP] handleAuth called, role:', role);
    if (role === UserRole.MENTOR) {
      // Mentor login - fetch profile from backend
      setUserRole(UserRole.MENTOR);
      setIsSignedUp(true);
      try {
        const userProfile = await authAPI.getMe();
        setProfile({
          name: userProfile.name || userProfile.username,
          title: userProfile.title || 'Senior Mentor',
          bio: userProfile.bio || '',
          skills: userProfile.skills || [],
          experienceYears: userProfile.experience_years || 0,
          hourlyRate: userProfile.hourly_rate || 0,
          email: userProfile.email,
          avatarUrl: userProfile.avatar
        });
        loadNotifications();
      } catch {
        // Use fallback data if profile fetch fails
        setProfile({
          name: userData?.name || 'Mentor',
          title: 'Senior Mentor',
          bio: '',
          skills: [],
          experienceYears: 0,
          hourlyRate: 0,
          email: userData?.email
        });
      }
      setCurrentView(View.MENTOR_DASHBOARD);
    } else {
      setUserRole(UserRole.FREELANCER);
      setIsSignedUp(true);
      
      try {
        console.log('[APP] Fetching user profile...');
        const userProfile = await authAPI.getMe();
        const freelancerProfile: FreelancerProfile = {
          name: userProfile.name || userProfile.username,
          title: userProfile.title || 'Frontend Developer',
          bio: userProfile.bio || '',
          skills: userProfile.skills || [],
          experienceYears: userProfile.experience_years || 0,
          hourlyRate: userProfile.hourly_rate || 0,
          email: userProfile.email,
          location: userProfile.location,
          githubUsername: userProfile.github_username,
          portfolioUrl: userProfile.portfolio_url,
          avatarUrl: userProfile.avatar
        };
        setProfile(freelancerProfile);
        
        // Load notifications after successful auth
        loadNotifications();
        
        // Load connected mentor from profile
        try {
          const profileData = await profileAPI.getProfile();
          if (profileData.connected_mentor_details) {
            console.log('[APP] ✅ Found connected mentor:', profileData.connected_mentor_details.name);
            setConnectedMentor(mapConnectedMentorToFrontend(profileData.connected_mentor_details));
            setIsPro(true);
          }
        } catch {
          console.log('[APP] Could not load connected mentor');
        }
        
        // Fetch stored analysis from backend (don't run agents on login)
        try {
          console.log('[APP] Fetching stored analysis from backend...');
          const storedAnalysis = await agentsAPI.getLatestAnalysis();
          
          if (storedAnalysis.has_analysis && storedAnalysis.evaluation) {
            console.log('[APP] ✅ Found stored analysis, loading...');
            // Convert backend response to AnalysisData format
            const analysisData: AnalysisData = {
              globalReadinessScore: (storedAnalysis.overall_score || 0) * 100,
              marketPercentile: storedAnalysis.percentile || 0,
              projectedEarnings: (storedAnalysis.evaluation?.market_position?.suggested_hourly_rate || 45) * 160,
              strengths: storedAnalysis.evaluation?.strengths || [],
              weaknesses: storedAnalysis.evaluation?.areas_for_improvement || [],
              opportunities: ['Remote work opportunities', 'Growing demand for React developers'],
              threats: ['Increasing competition', 'Rapid technology changes'],
              skillGaps: storedAnalysis.benchmark?.market_insights?.skill_gaps || [],
              pricingSuggestion: {
                current: freelancerProfile.hourlyRate || 0,
                recommended: storedAnalysis.evaluation?.market_position?.suggested_hourly_rate || 45,
                reasoning: storedAnalysis.evaluation?.summary || ''
              },
              metrics: {
                portfolioScore: (storedAnalysis.breakdown?.portfolio_quality?.raw_score || 0.5) * 100,
                githubScore: (storedAnalysis.breakdown?.github_activity?.raw_score || 0.5) * 100,
                communicationScore: 75,
                techStackScore: (storedAnalysis.breakdown?.skill_strength?.raw_score || 0.5) * 100
              }
            };
            setAnalysis(analysisData);
            setCurrentView(View.DASHBOARD);
          } else {
            // No stored analysis, check if user has skills
            if (freelancerProfile.skills && freelancerProfile.skills.length > 0) {
              console.log('[APP] No stored analysis but has skills, going to dashboard');
              setCurrentView(View.DASHBOARD);
            } else {
              console.log('[APP] No analysis and no skills, redirecting to onboarding');
              setCurrentView(View.ONBOARDING);
            }
          }
        } catch (analysisErr) {
          console.log('[APP] Failed to fetch stored analysis:', analysisErr);
          // Still go to dashboard, analysis can be generated there
          setCurrentView(View.DASHBOARD);
        }
      } catch {
        console.log('[APP] Profile fetch failed, going to onboarding');
        setProfile({
          name: userData?.name || 'User',
          title: 'Frontend Developer',
          bio: '',
          skills: [],
          experienceYears: 0,
          hourlyRate: 0,
          email: userData?.email
        });
        setCurrentView(View.ONBOARDING);
      }
    }
  };

  const handleSignOut = async () => {
    console.log('[APP] Signing out...');
    try {
      if (isAuthenticated()) {
        await authAPI.logout();
      }
    } catch {
      // Ignore logout errors
    }
    clearTokens();
    setCurrentView(View.LANDING);
    setProfile(null);
    setAnalysis(null);
    setIsPro(false);
    setIsSignedUp(false);
    setIsSignupFlow(false);
    setUserRole(UserRole.FREELANCER);
    setConnectedMentor(null);
  };

  const handleSignup = async (_username: string, email: string) => {
    console.log('[APP] Signup complete for:', email);
    setIsSignedUp(true);
    
    if (profile) {
      setProfile({ ...profile, email, name: profile.name || _username });
    }
    
    if (isSignupFlow) {
      // From login → signup: go to onboarding to complete profile
      addNotification({
        id: Date.now(),
        title: 'Account Created',
        message: "Great! Let's personalize your profile to get accurate insights.",
        time: 'Just now',
        read: false,
        type: 'success'
      });
      setCurrentView(View.ONBOARDING);
    } else {
      setCurrentView(View.DASHBOARD);
      addNotification({
        id: Date.now(),
        title: 'Account Created!',
        message: 'Welcome to FairFound! You now have full access to all features.',
        time: 'Just now',
        read: false,
        type: 'success'
      });
    }
  };

  // Handle re-evaluation of profile from Dashboard
  const handleReEvaluate = async (data: { githubUsername?: string; portfolioUrl?: string }) => {
    console.log('[APP] Re-evaluating profile with:', data);
    
    if (!profile) {
      throw new Error('No profile found. Please complete onboarding first.');
    }

    // Update profile with new data
    const updatedProfile = {
      ...profile,
      githubUsername: data.githubUsername || profile.githubUsername,
      portfolioUrl: data.portfolioUrl || profile.portfolioUrl
    };
    setProfile(updatedProfile);

    // Call the agents API to run analysis
    const result = await analyzeProfileWithAgents(updatedProfile);
    setAnalysis(result);

    // Add success notification
    addNotification({
      id: Date.now(),
      title: 'Profile Re-Evaluated',
      message: `Your new Global Readiness Score is ${result.globalReadinessScore}. Check your updated insights!`,
      time: 'Just now',
      read: false,
      type: 'success'
    });

    console.log('[APP] ✅ Re-evaluation complete');
  };


  const handleProUpgrade = async () => {
    const pendingMentorStr = localStorage.getItem('pending_mentor');
    if (pendingMentorStr) {
      const pendingMentor = JSON.parse(pendingMentorStr) as Mentor;
      localStorage.removeItem('pending_mentor');
      
      // Call backend API to connect mentor
      try {
        const { mentorAPI } = await import('./services/mentorService');
        await mentorAPI.connectMentor(Number(pendingMentor.id));
        console.log('[APP] ✅ Connected to mentor via API');
      } catch (err) {
        console.error('[APP] Error connecting to mentor:', err);
        // Still proceed with local state update even if API fails
      }
      
      setConnectedMentor(pendingMentor);
      setIsPro(true);
      setCurrentView(View.MY_MENTOR);
      addNotification({
        id: Date.now(),
        title: 'Mentor Connected!',
        message: `Payment successful! You are now connected with ${pendingMentor.name}.`,
        time: 'Just now',
        read: false,
        type: 'success'
      });
    } else {
      setIsPro(true);
      setCurrentView(View.DASHBOARD);
      addNotification({
        id: Date.now(),
        title: 'Payment Successful!',
        message: 'Your payment was processed successfully.',
        time: 'Just now',
        read: false,
        type: 'success'
      });
    }
  };

  const markAllRead = () => {
    markAllNotificationsAsRead();
  };

  const renderContent = () => {
    switch (currentView) {
      case View.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} isLoading={loading} onBack={() => setCurrentView(View.LANDING)} />;
      case View.DASHBOARD:
        return <Dashboard 
          analysis={analysis} 
          gamification={gamification} 
          isDark={isDark} 
          onNavigate={setCurrentView} 
          isSignedUp={isSignedUp} 
          onSignup={() => setCurrentView(View.SIGNUP)} 
          onReEvaluate={handleReEvaluate}
          profile={profile}
        />;
      case View.ROADMAP:
        return <Roadmap 
          steps={roadmap} 
          isSignedUp={isSignedUp} 
          hasMentor={!!connectedMentor} 
          onSignup={() => setCurrentView(View.SIGNUP)} 
          onFindMentor={() => setCurrentView(View.MENTORS)} 
          skillGaps={analysis?.skillGaps || []}
        />;
      case View.INSIGHTS:
        return analysis ? <Insights analysis={analysis} isSignedUp={isSignedUp} onSignup={() => setCurrentView(View.SIGNUP)} /> : <div>No analysis available</div>;
      case View.MENTORS:
        return <Mentors 
          isSignedUp={isSignedUp} 
          onSignup={() => setCurrentView(View.SIGNUP)} 
          connectedMentor={connectedMentor}
          onViewMentor={() => setCurrentView(View.MY_MENTOR)}
          onCancelContract={() => {
            setConnectedMentor(null);
            setIsPro(false);
            addNotification({
              id: Date.now(),
              title: 'Contract Cancelled',
              message: 'Your mentorship has been cancelled. You can now connect with a new mentor.',
              time: 'Just now',
              read: false,
              type: 'info'
            });
          }}
          onPaymentRequired={(mentor: Mentor) => {
            localStorage.setItem('pending_mentor', JSON.stringify(mentor));
            setCurrentView(View.CHECKOUT);
          }}
          onMentorConnected={(mentor: Mentor) => {
            setConnectedMentor(mentor);
            setIsPro(true);
            setCurrentView(View.MY_MENTOR);
            addNotification({
              id: Date.now(),
              title: 'Mentor Connected!',
              message: `You are now connected with ${mentor.name}. Start your mentorship journey!`,
              time: 'Just now',
              read: false,
              type: 'success'
            });
          }}
        />;
      case View.MY_MENTOR:
        return <MyMentor 
          mentor={connectedMentor} 
          onCancelContract={() => {
            setConnectedMentor(null);
            setCurrentView(View.MENTORS);
            addNotification({
              id: Date.now(),
              title: 'Contract Cancelled',
              message: 'Your mentorship has been cancelled. You can now connect with a new mentor.',
              time: 'Just now',
              read: false,
              type: 'info'
            });
          }}
        />;
      case View.PORTFOLIO:
        return <PortfolioBuilder profile={profile} isSignedUp={isSignedUp} onSignup={() => setCurrentView(View.SIGNUP)} />;
      case View.PROPOSALS:
        return <ProposalGenerator profile={profile} isSignedUp={isSignedUp} onSignup={() => setCurrentView(View.SIGNUP)} />;
      case View.SENTIMENT:
        return <SentimentAnalyzer isSignedUp={isSignedUp} onSignup={() => setCurrentView(View.SIGNUP)} />;
      case View.COMMUNITY:
        return <Community isSignedUp={isSignedUp} onSignup={() => setCurrentView(View.SIGNUP)} />;
      case View.PRICING:
        return <Pricing onUpgrade={() => setCurrentView(View.CHECKOUT)} isPro={isPro} onNavigate={setCurrentView} />;
      case View.CHECKOUT:
        return <Checkout onComplete={handleProUpgrade} onCancel={() => setCurrentView(View.PRICING)} />;
      case View.PROFILE:
        return <Profile profile={profile} onUpdate={setProfile} isSignedUp={isSignedUp} onSignup={() => setCurrentView(View.SIGNUP)} onSignOut={handleSignOut} />;
      case View.MENTOR_DASHBOARD:
        return <MentorDashboard onNavigate={setCurrentView} />;
      case View.MENTOR_CLIENTS:
        return <MentorClients />;
      case View.MENTOR_SESSIONS:
        return <MentorSessions />;
      case View.MENTOR_CHAT:
        return <ChatSystem currentUser={{id: 'me', name: profile?.name || 'Mentor'}} role={UserRole.MENTOR} />;
      case View.MENTOR_PROFILE:
        return <MentorProfile onSignOut={handleSignOut} />;
      default:
        return <div className="p-8 dark:text-slate-400">Coming Soon</div>;
    }
  };

  // Full screen views (No Sidebar)
  if (currentView === View.LANDING) {
    return (
      <LandingPage 
        onStart={() => {
          setUserRole(UserRole.FREELANCER);
          setCurrentView(View.ONBOARDING);
        }} 
        onLogin={() => setCurrentView(View.LOGIN)}
        onMentorLogin={async (email: string, password: string) => {
          // Authenticate mentor directly from landing page
          const response = await authAPI.login({ email, password });
          if (response.user.role !== 'mentor') {
            throw new Error('This account is not a mentor account. Please use the freelancer login.');
          }
          handleAuth(UserRole.MENTOR, { name: response.user.username, email: response.user.email });
        }}
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
    );
  }

  if (currentView === View.LOGIN) {
    return (
      <Login 
        onLogin={handleAuth} 
        onBack={() => setCurrentView(View.LANDING)}
        onSignUp={() => {
          setIsSignupFlow(true);
          setCurrentView(View.SIGNUP);
        }}
      />
    );
  }

  if (currentView === View.SIGNUP) {
    return (
      <Signup 
        profile={profile}
        onSignup={handleSignup}
        onBack={() => isSignupFlow ? setCurrentView(View.LOGIN) : setCurrentView(View.DASHBOARD)}
        onGoToOnboarding={() => {
          setCurrentView(View.ONBOARDING);
        }}
      />
    );
  }

  if (currentView === View.ONBOARDING) {
    return renderContent();
  }

  // Use the state variable for unread count (updated from backend)
  const unreadCount = unreadNotificationCount;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view: View) => {
          if (view === View.LANDING) {
            handleSignOut();
          } else {
            setCurrentView(view);
          }
        }} 
        isPro={isPro}
        userRole={userRole}
      />
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 z-10 transition-colors duration-300">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <Breadcrumbs currentView={currentView} onNavigate={setCurrentView} />
                <h1 className="text-xl font-bold text-slate-800 dark:text-white capitalize tracking-tight flex items-center gap-2">
                  {currentView.toLowerCase().replace('_', ' ').replace('mentor', '')}
                  {isPro && userRole === UserRole.FREELANCER && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">PRO</span>}
                  {userRole === UserRole.MENTOR && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">MENTOR</span>}
                </h1>
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-64 transition-colors">
                  <Search size={16} className="text-slate-400 mr-2" />
                  <input type="text" placeholder="Search..." className="bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200 w-full placeholder-slate-400 dark:placeholder-slate-500" />
                </div>

                <div className="flex items-center gap-3 relative">
                  <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                  
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h4>
                        <button onClick={markAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">No new notifications</div>
                        ) : (
                          notifications.map((notif: Notification) => (
                            <div 
                              key={notif.id} 
                              className={`p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                              onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold ${!notif.read ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={clearAllNotifications}
                            className="w-full text-xs text-slate-500 hover:text-red-500 transition-colors py-1"
                          >
                            Clear all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {showNotifications && (
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)}></div>
                  )}
                  
                  <div 
                    className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
                    onClick={() => setCurrentView(userRole === UserRole.MENTOR ? View.MENTOR_PROFILE : View.PROFILE)}
                  >
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{profile?.name || 'Guest User'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {userRole === UserRole.MENTOR ? 'Senior Mentor' : `Lvl ${gamification.level} Freelancer`}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm overflow-hidden">
                      {profile?.avatarUrl ? (
                        <img 
                          src={profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `http://localhost:8000${profile.avatarUrl}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        profile?.name ? profile.name.charAt(0) : 'G'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          {renderContent()}
        </div>
      </main>

      {userRole === UserRole.FREELANCER && (
        <AIChatbot 
          pageContext={`Current page: ${currentView}. User: ${profile?.name || 'Guest'}. Role: ${userRole}. Skills: ${profile?.skills?.join(', ') || 'Not set'}. Has mentor: ${!!connectedMentor}. Is Pro: ${isPro}.`}
        />
      )}
    </div>
  );
};

export default App;
