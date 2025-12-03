import React, { useState, useEffect, useRef } from 'react';
import { Mentee, Task, RoadmapStep } from '../types';
import {
  Search, Plus, ChevronRight, MessageCircle, CheckCircle, Clock, Sparkles, X, Trash2,
  Calendar, ListTodo, Loader2, CheckSquare, Square, Edit2, Bell, Send, RefreshCw
} from 'lucide-react';
import { mentorDashboardAPI, MenteeData, mapMenteeToFrontend } from '../services/mentorDashboardService';

const MentorClients: React.FC = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'tasks'>('overview');
  
  // Modal states
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newStep, setNewStep] = useState({ title: '', description: '', duration: '1 week', type: 'skill' as const });
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', stepId: '' });
  
  // Edit states
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editStepForm, setEditStepForm] = useState({ title: '', description: '', duration: '1 week', type: 'skill' as const });
  const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', dueDate: '', stepId: '' });
  
  // AI Generated Step state (for populating Add Step modal)
  const [aiGeneratedStep, setAiGeneratedStep] = useState<{ title: string; description: string; duration: string; type: 'skill' | 'project' | 'branding'; tasks: { title: string; description: string }[] } | null>(null);

  // Bulk notification states
  const [showBulkNotificationModal, setShowBulkNotificationModal] = useState(false);
  const [selectedMenteeIds, setSelectedMenteeIds] = useState<string[]>([]);
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', type: 'info' as 'info' | 'success' | 'warning' });
  const [sendingNotification, setSendingNotification] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadMentees();
  }, []);

  // Polling for mentee updates (every 15 seconds)
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      try {
        const data = await mentorDashboardAPI.getMentees();
        const mapped = data.map(mapMenteeToFrontend);
        
        // Check if there are changes
        const currentIds = mentees.map(m => `${m.id}-${m.progress}`).join(',');
        const newIds = mapped.map(m => `${m.id}-${m.progress}`).join(',');
        
        if (currentIds !== newIds) {
          setMentees(mapped);
          setLastUpdated(new Date());
          
          // Update selected mentee if it changed
          if (selectedMentee) {
            const updated = mapped.find(m => m.id === selectedMentee.id);
            if (updated) {
              setSelectedMentee(updated);
            }
          }
          console.log('[MENTOR CLIENTS POLLING] Updated mentees');
        }
      } catch (err) {
        console.error('[MENTOR CLIENTS POLLING] Error:', err);
      }
    }, 15000); // Poll every 15 seconds

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [mentees, selectedMentee]);

  const loadMentees = async () => {
    try {
      setLoading(true);
      const data = await mentorDashboardAPI.getMentees();
      const mapped = data.map(mapMenteeToFrontend);
      setMentees(mapped);
      if (mapped.length > 0 && !selectedMentee) {
        setSelectedMentee(mapped[0]);
      }
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error loading mentees:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMentee = async (menteeId: string) => {
    try {
      const data = await mentorDashboardAPI.getMentee(Number(menteeId));
      const mapped = mapMenteeToFrontend(data);
      setMentees(prev => prev.map(m => m.id === menteeId ? mapped : m));
      if (selectedMentee?.id === menteeId) {
        setSelectedMentee(mapped);
      }
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error refreshing mentee:', err);
    }
  };

  // Get the user_id from the mentee data for API calls
  const getMenteeUserId = (mentee: typeof selectedMentee): number => {
    // Use userId if available, otherwise fall back to profile id
    return mentee?.userId || Number(mentee?.id || 0);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!selectedMentee) return;
    try {
      await mentorDashboardAPI.deleteStep(Number(stepId));
      await refreshMentee(selectedMentee.id);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error deleting step:', err);
    }
  };

  const handleUpdateStepStatus = async (stepId: string, status: RoadmapStep['status']) => {
    if (!selectedMentee) return;
    try {
      await mentorDashboardAPI.updateStep(Number(stepId), { status });
      await refreshMentee(selectedMentee.id);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error updating step:', err);
    }
  };

  const handleAddTask = async () => {
    if (!selectedMentee || !newTask.title) return;
    try {
      setSaving(true);
      await mentorDashboardAPI.createTask(getMenteeUserId(selectedMentee), {
        title: newTask.title,
        description: newTask.description,
        due_date: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        step_id: newTask.stepId ? Number(newTask.stepId) : null,
        status: 'pending',
      });
      await refreshMentee(selectedMentee.id);
      setNewTask({ title: '', description: '', dueDate: '', stepId: '' });
      setShowAddTaskModal(false);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error adding task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedMentee) return;
    try {
      await mentorDashboardAPI.deleteTask(Number(taskId));
      await refreshMentee(selectedMentee.id);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error deleting task:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!selectedMentee) return;
    try {
      await mentorDashboardAPI.updateTaskStatus(Number(taskId), status);
      await refreshMentee(selectedMentee.id);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error updating task:', err);
    }
  };

  const handleGenerateAIStep = async () => {
    if (!selectedMentee) return;
    try {
      setIsGenerating(true);
      // Use skill gaps from analysis or default ones
      const skillGaps = selectedMentee.analysis?.skill_gaps || ['React', 'TypeScript', 'Testing'];
      const userSkills = selectedMentee.skills || [];
      
      // Call API to generate a single step
      const generatedStep = await mentorDashboardAPI.generateSingleStep(getMenteeUserId(selectedMentee), skillGaps, userSkills);
      
      // Populate the Add Step form with AI-generated data and open the modal
      setNewStep({
        title: generatedStep.title,
        description: generatedStep.description,
        duration: generatedStep.duration,
        type: generatedStep.type,
      });
      setAiGeneratedStep(generatedStep); // Store for tasks
      setShowAddStepModal(true);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error generating AI step:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddStepWithTasks = async () => {
    if (!selectedMentee || !newStep.title) return;
    try {
      setSaving(true);
      // If we have AI-generated tasks, create step with tasks
      if (aiGeneratedStep && aiGeneratedStep.tasks && aiGeneratedStep.tasks.length > 0) {
        await mentorDashboardAPI.createStepWithTasks(getMenteeUserId(selectedMentee), {
          title: newStep.title,
          description: newStep.description,
          duration: newStep.duration,
          type: newStep.type,
          tasks: aiGeneratedStep.tasks,
        });
      } else {
        // Otherwise just create the step without tasks
        await mentorDashboardAPI.createStep(getMenteeUserId(selectedMentee), {
          title: newStep.title,
          description: newStep.description,
          duration: newStep.duration,
          type: newStep.type as any,
          status: 'pending',
        });
      }
      await refreshMentee(selectedMentee.id);
      setNewStep({ title: '', description: '', duration: '1 week', type: 'skill' });
      setAiGeneratedStep(null);
      setShowAddStepModal(false);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error adding step:', err);
    } finally {
      setSaving(false);
    }
  };

  // Edit step handlers
  const openEditStepModal = (step: RoadmapStep) => {
    setEditingStep(step);
    setEditStepForm({
      title: step.title,
      description: step.description,
      duration: step.duration,
      type: step.type,
    });
    setShowEditStepModal(true);
  };

  const handleEditStep = async () => {
    if (!selectedMentee || !editingStep || !editStepForm.title) return;
    try {
      setSaving(true);
      await mentorDashboardAPI.updateStep(Number(editingStep.id), {
        title: editStepForm.title,
        description: editStepForm.description,
        duration: editStepForm.duration,
        type: editStepForm.type as any,
      });
      await refreshMentee(selectedMentee.id);
      setShowEditStepModal(false);
      setEditingStep(null);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error editing step:', err);
    } finally {
      setSaving(false);
    }
  };

  // Edit task handlers
  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      stepId: task.stepId || '',
    });
    setShowEditTaskModal(true);
  };

  const handleEditTask = async () => {
    if (!selectedMentee || !editingTask || !editTaskForm.title) return;
    try {
      setSaving(true);
      await mentorDashboardAPI.updateTask(Number(editingTask.id), {
        title: editTaskForm.title,
        description: editTaskForm.description,
        due_date: editTaskForm.dueDate || undefined,
        step_id: editTaskForm.stepId ? Number(editTaskForm.stepId) : null,
      });
      await refreshMentee(selectedMentee.id);
      setShowEditTaskModal(false);
      setEditingTask(null);
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error editing task:', err);
    } finally {
      setSaving(false);
    }
  };

  const getTasksForStep = (stepId: string) => {
    if (!selectedMentee) return [];
    return selectedMentee.tasks.filter(t => t.stepId === stepId);
  };

  // Bulk notification handlers
  const toggleMenteeSelection = (menteeId: string) => {
    setSelectedMenteeIds(prev => 
      prev.includes(menteeId) 
        ? prev.filter(id => id !== menteeId)
        : [...prev, menteeId]
    );
  };

  const selectAllMentees = () => {
    if (selectedMenteeIds.length === mentees.length) {
      setSelectedMenteeIds([]);
    } else {
      setSelectedMenteeIds(mentees.map(m => m.id));
    }
  };

  const handleSendBulkNotification = async () => {
    if (!notificationForm.message.trim()) return;
    try {
      setSendingNotification(true);
      await mentorDashboardAPI.sendBulkNotification({
        mentee_ids: selectedMenteeIds.length > 0 ? selectedMenteeIds.map(id => Number(id)) : undefined,
        title: notificationForm.title || 'Message from your mentor',
        message: notificationForm.message,
        type: notificationForm.type,
      });
      setShowBulkNotificationModal(false);
      setSelectedMenteeIds([]);
      setNotificationForm({ title: '', message: '', type: 'info' });
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('[MENTOR CLIENTS] Error sending bulk notification:', err);
      alert('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading mentees...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Mentee List */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Mentees</h2>
            <button
              onClick={() => setShowBulkNotificationModal(true)}
              className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              title="Send bulk notification"
            >
              <Bell size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Search mentees..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none dark:text-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mentees.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>No mentees connected yet</p>
            </div>
          ) : (
            mentees.map(mentee => (
              <div
                key={mentee.id}
                onClick={() => setSelectedMentee(mentee)}
                className={`p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedMentee?.id === mentee.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <img src={mentee.avatarUrl} alt={mentee.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{mentee.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{mentee.title}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">active</span>
                  <span className="text-slate-500">{mentee.progress}% complete</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedMentee ? (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img src={selectedMentee.avatarUrl} alt={selectedMentee.name} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedMentee.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    {selectedMentee.title} • <Calendar size={14} /> <span className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedMentee.nextSession}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"><MessageCircle size={18} /> Chat</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6">
              <div className="flex gap-8">
                {(['overview', 'roadmap', 'tasks'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Mentee Profile Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Mentee Profile</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Experience</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedMentee.experienceYears || 0} years</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Hourly Rate</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">${selectedMentee.hourlyRate || 0}/hr</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Location</p>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedMentee.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Status</p>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">Pro Member</span>
                        </div>
                      </div>
                      {selectedMentee.bio && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-xs text-slate-500 mb-1">Bio</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{selectedMentee.bio}</p>
                        </div>
                      )}
                    </div>

                    {/* Global Readiness Score */}
                    {selectedMentee.analysis && (
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold">Global Readiness Score</h3>
                          <span className="text-indigo-200 text-sm">Top {100 - (selectedMentee.analysis.percentile || 50)}% of freelancers</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-5xl font-bold">{selectedMentee.analysis.overall_score || 0}</p>
                            <p className="text-indigo-200 text-sm">out of 100</p>
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${selectedMentee.analysis.overall_score || 0}%` }}></div>
                            </div>
                            {selectedMentee.analysis.summary && (
                              <p className="text-indigo-100 text-xs mt-2 line-clamp-2">{selectedMentee.analysis.summary}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {selectedMentee.analysis?.metrics && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 dark:text-slate-400">Portfolio Quality</span>
                              <span className="font-medium text-slate-900 dark:text-white">{selectedMentee.analysis.metrics.portfolio_score || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedMentee.analysis.metrics.portfolio_score || 0}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 dark:text-slate-400">GitHub Activity</span>
                              <span className="font-medium text-slate-900 dark:text-white">{selectedMentee.analysis.metrics.github_score || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedMentee.analysis.metrics.github_score || 0}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 dark:text-slate-400">Skill Strength</span>
                              <span className="font-medium text-slate-900 dark:text-white">{selectedMentee.analysis.metrics.skill_score || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${selectedMentee.analysis.metrics.skill_score || 0}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-600 dark:text-slate-400">Experience Depth</span>
                              <span className="font-medium text-slate-900 dark:text-white">{selectedMentee.analysis.metrics.experience_score || 0}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedMentee.analysis.metrics.experience_score || 0}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress Overview */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Roadmap Progress</h3>
                        {selectedMentee.roadmap.length > 0 && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full flex items-center gap-1">
                            <Sparkles size={10} /> AI Roadmap Active
                          </span>
                        )}
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedMentee.progress}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${selectedMentee.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{selectedMentee.roadmap.filter(r => r.status === 'completed').length}</p>
                          <p className="text-xs text-slate-500">Steps Done</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{selectedMentee.tasks.filter(t => t.status === 'completed').length}</p>
                          <p className="text-xs text-slate-500">Tasks Done</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-indigo-600">{selectedMentee.roadmap.length}</p>
                          <p className="text-xs text-slate-500">Total Steps</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{selectedMentee.tasks.length}</p>
                          <p className="text-xs text-slate-500">Total Tasks</p>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    {selectedMentee.analysis && (selectedMentee.analysis.strengths?.length > 0 || selectedMentee.analysis.weaknesses?.length > 0) && (
                      <div className="grid grid-cols-2 gap-6">
                        {selectedMentee.analysis.strengths && selectedMentee.analysis.strengths.length > 0 && (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                              <CheckCircle size={16} className="text-emerald-500" /> Strengths
                            </h3>
                            <ul className="space-y-2">
                              {selectedMentee.analysis.strengths.slice(0, 4).map((strength, i) => (
                                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <span className="text-emerald-500 mt-1">•</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedMentee.analysis.weaknesses && selectedMentee.analysis.weaknesses.length > 0 && (
                          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                            <h3 className="font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                              <Clock size={16} className="text-amber-500" /> Areas to Improve
                            </h3>
                            <ul className="space-y-2">
                              {selectedMentee.analysis.weaknesses.slice(0, 4).map((weakness, i) => (
                                <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                  <span className="text-amber-500 mt-1">•</span>
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skills */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Current Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedMentee.skills || ['React', 'JavaScript', 'CSS']).map(skill => (
                          <span key={skill} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Skill Gaps (if available) */}
                    {selectedMentee.analysis?.skill_gaps && selectedMentee.analysis.skill_gaps.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Skill Gaps to Address</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedMentee.analysis.skill_gaps.map(gap => (
                            <span key={gap} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
                              {gap}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-3">Focus your mentorship on these areas for maximum impact</p>
                      </div>
                    )}
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Quick Actions</h3>
                      <div className="space-y-2">
                        <button onClick={() => { setActiveTab('roadmap'); setShowAddStepModal(true); }} className="w-full p-3 text-left text-sm bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Plus size={16} className="text-indigo-600" /> Add Roadmap Step
                        </button>
                        <button onClick={() => { setActiveTab('tasks'); setShowAddTaskModal(true); }} className="w-full p-3 text-left text-sm bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <ListTodo size={16} className="text-indigo-600" /> Assign New Task
                        </button>
                      </div>
                    </div>

                    {/* Market Position */}
                    {selectedMentee.analysis?.market_position && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Market Position</h3>
                        <div className="space-y-3">
                          {selectedMentee.analysis.market_position.suggested_hourly_rate && (
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Suggested Rate</p>
                              <p className="text-lg font-bold text-emerald-600">${selectedMentee.analysis.market_position.suggested_hourly_rate}/hr</p>
                              {selectedMentee.hourlyRate && selectedMentee.hourlyRate < selectedMentee.analysis.market_position.suggested_hourly_rate && (
                                <p className="text-xs text-amber-600 mt-1">Currently underpriced by ${selectedMentee.analysis.market_position.suggested_hourly_rate - selectedMentee.hourlyRate}/hr</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mentorship Tips */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <h3 className="font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-600" /> Mentorship Tips
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        {selectedMentee.analysis?.skill_gaps && selectedMentee.analysis.skill_gaps.length > 0 && (
                          <li>• Focus on {selectedMentee.analysis.skill_gaps[0]} first</li>
                        )}
                        {selectedMentee.progress < 30 && (
                          <li>• Help them build momentum with quick wins</li>
                        )}
                        {selectedMentee.tasks.filter(t => t.status === 'pending').length > 5 && (
                          <li>• Consider reducing task load to avoid overwhelm</li>
                        )}
                        <li>• Schedule regular check-ins for accountability</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="max-w-4xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Mentee Roadmap
                        {selectedMentee.roadmap.length > 0 && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full flex items-center gap-1">
                            <Sparkles size={10} /> AI Generated
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500">Personalized learning path with tasks for {selectedMentee.name}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleGenerateAIStep} disabled={isGenerating} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200 dark:shadow-none">
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {isGenerating ? 'Generating...' : 'Generate with AI'}
                      </button>
                      <button onClick={() => setShowAddStepModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={16} /> Add Step
                      </button>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  {selectedMentee.roadmap.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{selectedMentee.roadmap.length}</p>
                        <p className="text-xs text-slate-500">Total Steps</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{selectedMentee.roadmap.filter(s => s.status === 'completed').length}</p>
                        <p className="text-xs text-slate-500">Completed</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-2xl font-bold text-amber-600">{selectedMentee.tasks.length}</p>
                        <p className="text-xs text-slate-500">Total Tasks</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-2xl font-bold text-purple-600">{selectedMentee.tasks.filter(t => t.status === 'completed').length}</p>
                        <p className="text-xs text-slate-500">Tasks Done</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedMentee.roadmap.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20">
                        <Sparkles size={48} className="mx-auto mb-4 text-purple-400" />
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">No roadmap steps yet</p>
                        <p className="text-sm text-slate-500 mb-4">Generate an AI-powered step or add one manually</p>
                        <button onClick={handleGenerateAIStep} disabled={isGenerating} className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 flex items-center gap-2 mx-auto disabled:opacity-50">
                          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate with AI
                        </button>
                      </div>
                    ) : (
                      selectedMentee.roadmap.map((step, index) => {
                        const stepTasks = getTasksForStep(step.id);
                        const completedTasks = stepTasks.filter(t => t.status === 'completed').length;
                        return (
                          <div key={step.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Step Header */}
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    step.status === 'completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    step.status === 'in-progress' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}>
                                    {step.status === 'completed' ? <CheckCircle size={16} /> : index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className={`font-bold ${step.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{step.title}</h4>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        step.type === 'skill' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                        step.type === 'project' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                      }`}>{step.type}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                      <Clock size={12} /> {step.duration}
                                      {stepTasks.length > 0 && <span>• {completedTasks}/{stepTasks.length} tasks</span>}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={step.status}
                                    onChange={(e) => handleUpdateStepStatus(step.id, e.target.value as any)}
                                    className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                  <button onClick={() => openEditStepModal(step)} className="p-1 text-slate-400 hover:text-indigo-500" title="Edit step">
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleDeleteStep(step.id)} className="p-1 text-slate-400 hover:text-red-500" title="Delete step">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 ml-12">{step.description}</p>
                            </div>
                            
                            {/* Tasks for this step */}
                            {stepTasks.length > 0 && (
                              <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <ListTodo size={12} /> Tasks ({completedTasks}/{stepTasks.length} completed)
                                </p>
                                <div className="space-y-2">
                                  {stepTasks.map(task => (
                                    <div key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                                      <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')} className="mt-0.5">
                                        {task.status === 'completed' ? <CheckSquare size={16} className="text-emerald-500" /> : <Square size={16} className="text-slate-400 hover:text-indigo-500" />}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{task.title}</p>
                                        {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                                        {task.dueDate && <p className="text-xs text-slate-400 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                                      </div>
                                      <button onClick={() => openEditTaskModal(task)} className="p-1 text-slate-300 hover:text-indigo-500" title="Edit task">
                                        <Edit2 size={14} />
                                      </button>
                                      <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-300 hover:text-red-500" title="Delete task">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="max-w-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Tasks</h3>
                      <p className="text-sm text-slate-500">Manage tasks for {selectedMentee.name}</p>
                    </div>
                    <button onClick={() => setShowAddTaskModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                      <Plus size={16} /> Add Task
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedMentee.tasks.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <CheckCircle size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 mb-2">No tasks assigned yet</p>
                        <button onClick={() => setShowAddTaskModal(true)} className="text-indigo-600 font-medium hover:underline">Assign the first task</button>
                      </div>
                    ) : (
                      selectedMentee.tasks.map((task) => (
                        <div key={task.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
                          <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')} className="mt-1">
                            {task.status === 'completed' ? <CheckSquare size={20} className="text-emerald-500" /> : <Square size={20} className="text-slate-400" />}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                              <span>Due: {task.dueDate}</span>
                              {task.stepId && <span>Step: {selectedMentee.roadmap.find(s => s.id === task.stepId)?.title || 'Unknown'}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                              className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="review">In Review</option>
                              <option value="completed">Completed</option>
                            </select>
                            <button onClick={() => openEditTaskModal(task)} className="p-1 text-slate-400 hover:text-indigo-500" title="Edit task">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500" title="Delete task">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ListTodo size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Select a Mentee</h3>
              <p className="text-slate-500">Choose a mentee from the list to view their details</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col ${aiGeneratedStep ? 'max-w-lg' : 'max-w-md'}`}>
            <div className={`p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center ${aiGeneratedStep ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20' : ''}`}>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {aiGeneratedStep && <Sparkles size={18} className="text-purple-600" />}
                {aiGeneratedStep ? 'AI Generated Step - Review & Edit' : 'Add Roadmap Step'}
              </h3>
              <button onClick={() => { setShowAddStepModal(false); setAiGeneratedStep(null); setNewStep({ title: '', description: '', duration: '1 week', type: 'skill' }); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {aiGeneratedStep && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-purple-700 dark:text-purple-300">Review and edit the AI-generated step before adding it to the roadmap.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newStep.title}
                  onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  placeholder="e.g., Learn TypeScript"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newStep.description}
                  onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  placeholder="Describe what the mentee should learn..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <select
                    value={newStep.duration}
                    onChange={(e) => setNewStep({ ...newStep, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="3 days">3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newStep.type}
                    onChange={(e) => setNewStep({ ...newStep, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="skill">Skill</option>
                    <option value="project">Project</option>
                    <option value="branding">Branding</option>
                  </select>
                </div>
              </div>
              
              {/* AI Generated Tasks Section */}
              {aiGeneratedStep && aiGeneratedStep.tasks && aiGeneratedStep.tasks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <ListTodo size={14} /> Tasks ({aiGeneratedStep.tasks.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aiGeneratedStep.tasks.map((task, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => {
                            const newTasks = [...aiGeneratedStep.tasks];
                            newTasks[index] = { ...newTasks[index], title: e.target.value };
                            setAiGeneratedStep({ ...aiGeneratedStep, tasks: newTasks });
                          }}
                          className="w-full px-2 py-1 text-sm font-medium bg-transparent border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-purple-500 mb-1"
                        />
                        <input
                          type="text"
                          value={task.description}
                          onChange={(e) => {
                            const newTasks = [...aiGeneratedStep.tasks];
                            newTasks[index] = { ...newTasks[index], description: e.target.value };
                            setAiGeneratedStep({ ...aiGeneratedStep, tasks: newTasks });
                          }}
                          className="w-full px-2 py-1 text-xs bg-transparent text-slate-500 dark:text-slate-400 outline-none focus:text-slate-700 dark:focus:text-slate-300"
                          placeholder="Task description..."
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddStepWithTasks}
                disabled={saving || !newStep.title}
                className={`w-full py-3 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${aiGeneratedStep ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {saving ? 'Adding...' : aiGeneratedStep ? 'Add to Roadmap' : 'Add Step'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Add Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Complete React tutorial"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roadmap Step</label>
                  <select
                    value={newTask.stepId}
                    onChange={(e) => setNewTask({ ...newTask, stepId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No step</option>
                    {selectedMentee?.roadmap.map(step => (
                      <option key={step.id} value={step.id}>{step.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddTask}
                disabled={saving || !newTask.title}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {saving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Step Modal */}
      {showEditStepModal && editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-600" /> Edit Roadmap Step
              </h3>
              <button onClick={() => { setShowEditStepModal(false); setEditingStep(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editStepForm.title}
                  onChange={(e) => setEditStepForm({ ...editStepForm, title: e.target.value })}
                  placeholder="e.g., Learn TypeScript"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={editStepForm.description}
                  onChange={(e) => setEditStepForm({ ...editStepForm, description: e.target.value })}
                  placeholder="Describe what the mentee should learn..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                  <select
                    value={editStepForm.duration}
                    onChange={(e) => setEditStepForm({ ...editStepForm, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="3 days">3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={editStepForm.type}
                    onChange={(e) => setEditStepForm({ ...editStepForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="skill">Skill</option>
                    <option value="project">Project</option>
                    <option value="branding">Branding</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleEditStep}
                disabled={saving || !editStepForm.title}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Edit2 size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-600" /> Edit Task
              </h3>
              <button onClick={() => { setShowEditTaskModal(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editTaskForm.title}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                  placeholder="e.g., Complete React tutorial"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={editTaskForm.description}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editTaskForm.dueDate}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Roadmap Step</label>
                  <select
                    value={editTaskForm.stepId}
                    onChange={(e) => setEditTaskForm({ ...editTaskForm, stepId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No step</option>
                    {selectedMentee?.roadmap.map(step => (
                      <option key={step.id} value={step.id}>{step.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleEditTask}
                disabled={saving || !editTaskForm.title}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Edit2 size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Notification Modal */}
      {showBulkNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={18} className="text-indigo-600" /> Send Bulk Notification
              </h3>
              <button onClick={() => { setShowBulkNotificationModal(false); setSelectedMenteeIds([]); setNotificationForm({ title: '', message: '', type: 'info' }); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Mentee Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Recipients</label>
                  <button
                    onClick={selectAllMentees}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {selectedMenteeIds.length === mentees.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                  {mentees.map(mentee => (
                    <div
                      key={mentee.id}
                      onClick={() => toggleMenteeSelection(mentee.id)}
                      className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${selectedMenteeIds.includes(mentee.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedMenteeIds.includes(mentee.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                        {selectedMenteeIds.includes(mentee.id) && <CheckCircle size={14} className="text-white" />}
                      </div>
                      <img src={mentee.avatarUrl} alt={mentee.name} className="w-8 h-8 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{mentee.name}</p>
                        <p className="text-xs text-slate-500 truncate">{mentee.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedMenteeIds.length === 0 ? 'No selection = send to all mentees' : `${selectedMenteeIds.length} mentee(s) selected`}
                </p>
              </div>

              {/* Notification Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="Message from your mentor"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Notification Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message *</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Write your message to mentees..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                <div className="flex gap-2">
                  {(['info', 'success', 'warning'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNotificationForm({ ...notificationForm, type })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                        notificationForm.type === type
                          ? type === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : type === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => { setShowBulkNotificationModal(false); setSelectedMenteeIds([]); setNotificationForm({ title: '', message: '', type: 'info' }); }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBulkNotification}
                disabled={sendingNotification || !notificationForm.message.trim()}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingNotification ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {sendingNotification ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MentorClients;
