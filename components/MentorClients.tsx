import React, { useState, useEffect } from 'react';
import { Mentee, Task, RoadmapStep } from '../types';
import { generateMenteeTasks, generateRoadmapStepForMentee, generateSingleTaskForMentee } from '../services/geminiService';
import { 
  Search, Plus, ChevronRight, MessageCircle, 
  CheckCircle, Clock, Sparkles, X, Trash2, Users,
  Video, Phone, Calendar, ListTodo, FileText, Bell, Send,
  ChevronDown, Map, Edit
} from 'lucide-react';

const MOCK_MENTEES: Mentee[] = [
  {
    id: '1', name: 'Alex Rivera', title: 'Frontend Developer',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff',
    progress: 65, nextSession: 'Dec 5, 2:00 PM', status: 'active',
    roadmap: [
      { id: 'r1', title: 'Master React Hooks', description: 'Deep dive into useEffect, useMemo, and custom hooks', duration: '1 week', status: 'completed', type: 'skill' },
      { id: 'r2', title: 'Build Portfolio Project', description: 'Create a data dashboard with React and Recharts', duration: '2 weeks', status: 'in-progress', type: 'project' },
      { id: 'r3', title: 'Optimize LinkedIn Profile', description: 'Update with new skills and project showcases', duration: '3 days', status: 'pending', type: 'branding' }
    ],
    tasks: [
      { id: 't1', title: 'Refactor Todo App with Redux', description: 'Migrate state management to Redux Toolkit', dueDate: 'Dec 8', status: 'pending', stepId: 'r1' },
      { id: 't2', title: 'Read Clean Code Ch. 1-3', description: 'Take notes on key principles', dueDate: 'Dec 10', status: 'pending', stepId: 'r2' }
    ]
  },
  {
    id: '2', name: 'Sarah Jenkins', title: 'UX Designer',
    avatarUrl: 'https://picsum.photos/200/200?random=13',
    progress: 40, nextSession: 'Dec 7, 10:00 AM', status: 'active',
    roadmap: [
      { id: 'r4', title: 'Learn Figma Advanced', description: 'Master auto-layout and components', duration: '1 week', status: 'in-progress', type: 'skill' }
    ], 
    tasks: []
  },
  {
    id: '3', name: 'Mike Chen', title: 'Backend Developer',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mike+Chen&background=10b981&color=fff',
    progress: 25, nextSession: 'Dec 9, 3:00 PM', status: 'active',
    roadmap: [], tasks: []
  }
];

const MentorClients: React.FC = () => {
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'tasks'>('overview');
  const [mentees, setMentees] = useState<Mentee[]>(MOCK_MENTEES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingStep, setIsGeneratingStep] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showEditStepModal, setShowEditStepModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showBulkNotifyModal, setShowBulkNotifyModal] = useState(false);
  const [newStep, setNewStep] = useState({ title: '', description: '', duration: '1 week', type: 'skill' as const });
  const [generatedStep, setGeneratedStep] = useState<RoadmapStep | null>(null);
  const [generatedTask, setGeneratedTask] = useState<Task | null>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [isGeneratingTask, setIsGeneratingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', stepId: '' });
  const [bulkNotification, setBulkNotification] = useState({ title: '', message: '', selectedMentees: [] as string[] });
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    const connections = JSON.parse(localStorage.getItem('fairfound_connections') || '[]');
    if (connections.length > 0) {
      const newMentees = connections.map((conn: any, index: number) => ({
        id: `new-${index}`, name: conn.menteeName, title: 'Senior Frontend Engineer',
        avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff',
        progress: 0, nextSession: 'Not Scheduled', status: 'active', roadmap: [], tasks: []
      }));
      setMentees(prev => [...prev, ...newMentees]);
    }
  }, []);

  const updateMenteeState = (updated: Mentee) => {
    setMentees(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMentee(updated);
  };

  const handleGenerateTasks = async () => {
    if (!selectedMentee || selectedMentee.roadmap.length === 0) return;
    setIsGeneratingTask(true);
    try {
      // Use the first in-progress or pending step as context
      const activeStep = selectedMentee.roadmap.find(s => s.status === 'in-progress') || selectedMentee.roadmap.find(s => s.status === 'pending') || selectedMentee.roadmap[0];
      const task = await generateSingleTaskForMentee(selectedMentee.name, selectedMentee.title, activeStep.title);
      task.stepId = activeStep.id;
      setGeneratedTask(task);
      setShowEditTaskModal(true);
    } catch (e) { console.error(e); }
    finally { setIsGeneratingTask(false); }
  };

  const handleSubmitGeneratedTask = () => {
    if (!selectedMentee || !generatedTask || !generatedTask.stepId) return;
    updateMenteeState({ ...selectedMentee, tasks: [...selectedMentee.tasks, generatedTask] });
    setGeneratedTask(null);
    setShowEditTaskModal(false);
  };

  const handleAddStep = () => {
    if (!selectedMentee || !newStep.title) return;
    const step: RoadmapStep = {
      id: `step-${Date.now()}`, ...newStep, status: 'pending'
    };
    updateMenteeState({ ...selectedMentee, roadmap: [...selectedMentee.roadmap, step] });
    setNewStep({ title: '', description: '', duration: '1 week', type: 'skill' });
    setShowAddStepModal(false);
  };

  const handleGenerateStep = async () => {
    if (!selectedMentee) return;
    setIsGeneratingStep(true);
    try {
      const existingStepTitles = selectedMentee.roadmap.map(s => s.title);
      const step = await generateRoadmapStepForMentee(selectedMentee.name, selectedMentee.title, existingStepTitles);
      setGeneratedStep(step);
      setShowEditStepModal(true);
    } catch (e) { console.error(e); }
    finally { setIsGeneratingStep(false); }
  };

  const handleSubmitGeneratedStep = () => {
    if (!selectedMentee || !generatedStep) return;
    updateMenteeState({ ...selectedMentee, roadmap: [...selectedMentee.roadmap, generatedStep] });
    setGeneratedStep(null);
    setShowEditStepModal(false);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!selectedMentee) return;
    // Also remove tasks associated with this step
    updateMenteeState({ 
      ...selectedMentee, 
      roadmap: selectedMentee.roadmap.filter(s => s.id !== stepId),
      tasks: selectedMentee.tasks.filter(t => t.stepId !== stepId)
    });
  };

  const handleUpdateStepStatus = (stepId: string, status: RoadmapStep['status']) => {
    if (!selectedMentee) return;
    updateMenteeState({
      ...selectedMentee,
      roadmap: selectedMentee.roadmap.map(s => s.id === stepId ? { ...s, status } : s)
    });
  };

  const handleAddTask = () => {
    if (!selectedMentee || !newTask.title || !newTask.stepId) return;
    const task: Task = { id: `task-${Date.now()}`, ...newTask, status: 'pending' };
    updateMenteeState({ ...selectedMentee, tasks: [...selectedMentee.tasks, task] });
    setNewTask({ title: '', description: '', dueDate: '', stepId: '' });
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedMentee) return;
    updateMenteeState({ ...selectedMentee, tasks: selectedMentee.tasks.filter(t => t.id !== taskId) });
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    if (!selectedMentee) return;
    updateMenteeState({
      ...selectedMentee,
      tasks: selectedMentee.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    });
  };

  const handleSendBulkNotification = () => {
    if (!bulkNotification.title || !bulkNotification.message) return;
    // In real app, this would send to backend
    console.log('Sending notification to:', bulkNotification.selectedMentees.length === 0 ? 'All mentees' : bulkNotification.selectedMentees);
    setNotificationSent(true);
    setTimeout(() => {
      setNotificationSent(false);
      setShowBulkNotifyModal(false);
      setBulkNotification({ title: '', message: '', selectedMentees: [] });
    }, 2000);
  };

  const toggleMenteeSelection = (menteeId: string) => {
    setBulkNotification(prev => ({
      ...prev,
      selectedMentees: prev.selectedMentees.includes(menteeId)
        ? prev.selectedMentees.filter(id => id !== menteeId)
        : [...prev.selectedMentees, menteeId]
    }));
  };

  const getStepName = (stepId?: string) => {
    if (!selectedMentee || !stepId) return 'Unassigned';
    const step = selectedMentee.roadmap.find(s => s.id === stepId);
    return step?.title || 'Unassigned';
  };

  const getTasksForStep = (stepId: string) => {
    if (!selectedMentee) return [];
    return selectedMentee.tasks.filter(t => t.stepId === stepId);
  };

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Mentees</h2>
            <button 
              onClick={() => setShowBulkNotifyModal(true)}
              className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              title="Send Bulk Notification"
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
          {mentees.map(mentee => (
            <div key={mentee.id} onClick={() => setSelectedMentee(mentee)}
              className={`p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedMentee?.id === mentee.id ? 'bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-600' : ''}`}>
              <div className="flex items-center gap-3">
                <img src={mentee.avatarUrl} alt={mentee.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{mentee.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{mentee.title}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-full ${mentee.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>{mentee.status}</span>
                <span className="text-slate-500">{mentee.progress}% complete</span>
              </div>
            </div>
          ))}
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
                <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Phone size={18} /></button>
                <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"><Video size={18} /></button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"><MessageCircle size={18} /> Chat</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6">
              <div className="flex gap-8">
                {(['overview', 'roadmap', 'tasks'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
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
                    {/* Progress Overview */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Progress Overview</h3>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Overall Progress</span>
                          <span className="font-bold text-slate-900 dark:text-white">{selectedMentee.progress}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${selectedMentee.progress}%` }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedMentee.roadmap.filter(r => r.status === 'completed').length}</p>
                          <p className="text-xs text-slate-500">Steps Done</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedMentee.tasks.filter(t => t.status === 'completed').length}</p>
                          <p className="text-xs text-slate-500">Tasks Done</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-indigo-600">12</p>
                          <p className="text-xs text-slate-500">Sessions</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">8</p>
                          <p className="text-xs text-slate-500">Weeks Active</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis Scores */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">AI Analysis Scores</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Readiness Score</span>
                            <span className="text-lg font-bold text-indigo-600">78</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Market Percentile</span>
                            <span className="text-lg font-bold text-emerald-600">65%</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Portfolio Score</span>
                            <span className="text-lg font-bold text-amber-600">60</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Tech Stack Score</span>
                            <span className="text-lg font-bold text-purple-600">80</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SWOT Analysis */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">SWOT Analysis</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                          <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">Strengths</h4>
                          <ul className="text-xs text-emerald-600 dark:text-emerald-300 space-y-1">
                            <li>• Strong React fundamentals</li>
                            <li>• Good communication style</li>
                            <li>• Quick learner</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Weaknesses</h4>
                          <ul className="text-xs text-red-600 dark:text-red-300 space-y-1">
                            <li>• Lack of backend knowledge</li>
                            <li>• Portfolio is generic</li>
                            <li>• Limited testing experience</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">Opportunities</h4>
                          <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                            <li>• High demand for Fullstack</li>
                            <li>• SaaS niche growing</li>
                            <li>• Remote work expansion</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                          <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">Threats</h4>
                          <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-1">
                            <li>• AI code generation saturation</li>
                            <li>• Market competition</li>
                            <li>• Skill obsolescence risk</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Skill Gaps */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Identified Skill Gaps</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Next.js', 'PostgreSQL', 'System Design', 'Testing', 'CI/CD'].map(skill => (
                          <span key={skill} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Private Notes */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Private Notes</h3>
                      <textarea className="w-full h-32 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none text-sm dark:text-white" placeholder="Add private notes about this mentee..."></textarea>
                    </div>
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    {/* Pricing Suggestion */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white">
                      <h3 className="font-bold mb-3">Pricing Insight</h3>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold">$85</span>
                        <span className="text-indigo-200 line-through">$68</span>
                        <span className="text-xs text-indigo-200">/hr</span>
                      </div>
                      <p className="text-xs text-indigo-100">Recommended rate based on skills and market analysis. Current rate is below market value.</p>
                    </div>

                    {/* Projected Earnings */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-3 text-slate-900 dark:text-white">Projected Earnings</h3>
                      <p className="text-3xl font-bold text-emerald-600 mb-1">$85,000</p>
                      <p className="text-xs text-slate-500">Annual potential at recommended rate</p>
                    </div>

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

                    {/* Mentee Skills */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold mb-3 text-slate-900 dark:text-white">Current Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {['React', 'TypeScript', 'Tailwind', 'Node.js'].map(skill => (
                          <span key={skill} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="max-w-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mentee Roadmap</h3>
                      <p className="text-sm text-slate-500">Create and manage learning steps for {selectedMentee.name}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleGenerateStep} disabled={isGeneratingStep}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center gap-2">
                        {isGeneratingStep ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />} AI Generate
                      </button>
                      <button onClick={() => setShowAddStepModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={16} /> Add Step
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {selectedMentee.roadmap.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <ListTodo size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 mb-2">No roadmap steps yet</p>
                        <button onClick={() => setShowAddStepModal(true)} className="text-indigo-600 font-medium hover:underline">Create the first step</button>
                      </div>
                    ) : (
                      selectedMentee.roadmap.map((step, idx) => {
                        const stepTasks = getTasksForStep(step.id);
                        return (
                          <div key={step.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : step.status === 'in-progress' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                  {step.status === 'completed' ? <CheckCircle size={18} /> : <span className="text-sm font-bold">{idx + 1}</span>}
                                </div>
                                {idx < selectedMentee.roadmap.length - 1 && <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700 mt-2"></div>}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-bold text-slate-900 dark:text-white">{step.title}</h4>
                                  <div className="flex items-center gap-2">
                                    <select value={step.status} onChange={(e) => handleUpdateStepStatus(step.id, e.target.value as RoadmapStep['status'])}
                                      className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${step.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : step.status === 'in-progress' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                      <option value="pending">Pending</option>
                                      <option value="in-progress">In Progress</option>
                                      <option value="completed">Completed</option>
                                    </select>
                                    <button onClick={() => handleDeleteStep(step.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{step.description}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                                  <span className="flex items-center gap-1"><Clock size={12} /> {step.duration}</span>
                                  <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{step.type}</span>
                                  <span className="flex items-center gap-1"><ListTodo size={12} /> {stepTasks.length} tasks</span>
                                </div>
                                {/* Tasks under this step */}
                                {stepTasks.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    {stepTasks.map(task => (
                                      <div key={task.id} className="flex items-center gap-2 text-sm">
                                        <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                          className={`w-4 h-4 rounded border flex items-center justify-center ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                          {task.status === 'completed' && <CheckCircle size={12} className="text-white" />}
                                        </button>
                                        <span className={task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}>{task.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <button 
                                  onClick={() => { setNewTask({ ...newTask, stepId: step.id }); setShowAddTaskModal(true); }}
                                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  <Plus size={12} /> Add task to this step
                                </button>
                              </div>
                            </div>
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
                      <p className="text-sm text-slate-500">Manage assignments and track progress</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleGenerateTasks} disabled={isGeneratingTask || selectedMentee.roadmap.length === 0}
                        className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGeneratingTask ? <Sparkles size={16} className="animate-spin" /> : <Sparkles size={16} />} AI Generate
                      </button>
                      <button onClick={() => setShowAddTaskModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2">
                        <Plus size={16} /> New Task
                      </button>
                    </div>
                  </div>
                  
                  {selectedMentee.roadmap.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <Map size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 mb-2">Create roadmap steps first</p>
                      <p className="text-xs text-slate-400 mb-4">Tasks must be assigned to a roadmap step</p>
                      <button onClick={() => { setActiveTab('roadmap'); setShowAddStepModal(true); }} className="text-indigo-600 font-medium hover:underline">Create a roadmap step</button>
                    </div>
                  ) : selectedMentee.tasks.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      <ListTodo size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 mb-2">No tasks assigned yet</p>
                      <button onClick={() => setShowAddTaskModal(true)} className="text-indigo-600 font-medium hover:underline">Assign a task</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedMentee.tasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <button onClick={() => handleUpdateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30' : 'border-slate-300 hover:border-indigo-500'}`}>
                                {task.status === 'completed' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                              </button>
                              <div>
                                <h4 className={`font-semibold ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                                <div className="flex items-center gap-4 mt-3 flex-wrap">
                                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> Due {task.dueDate}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${task.status === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : task.status === 'review' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>{task.status}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 flex items-center gap-1">
                                    <Map size={10} /> {getStepName(task.stepId)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Users size={64} className="mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Select a mentee to manage</p>
          </div>
        )}
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Add Roadmap Step</h3>
              <button onClick={() => setShowAddStepModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Step Title</label>
                <input type="text" value={newStep.title} onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  placeholder="e.g., Master React Hooks" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={newStep.description} onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  placeholder="What should the mentee accomplish?" rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                  <select value={newStep.duration} onChange={(e) => setNewStep({ ...newStep, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                    <option>3 days</option><option>1 week</option><option>2 weeks</option><option>1 month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select value={newStep.type} onChange={(e) => setNewStep({ ...newStep, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                    <option value="skill">Skill</option><option value="project">Project</option><option value="branding">Branding</option>
                  </select>
                </div>
              </div>
              <button onClick={handleAddStep} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Add Step</button>
            </div>
          </div>
        </div>
      )}


      {/* Edit AI Generated Step Modal */}
      {showEditStepModal && generatedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">AI Generated Step</h3>
              </div>
              <button onClick={() => { setShowEditStepModal(false); setGeneratedStep(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                Review and edit the AI-generated step before adding it to the roadmap.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Step Title</label>
                <input type="text" value={generatedStep.title} onChange={(e) => setGeneratedStep({ ...generatedStep, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={generatedStep.description} onChange={(e) => setGeneratedStep({ ...generatedStep, description: e.target.value })}
                  rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration</label>
                  <select value={generatedStep.duration} onChange={(e) => setGeneratedStep({ ...generatedStep, duration: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                    <option>3 days</option><option>1 week</option><option>2 weeks</option><option>1 month</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                  <select value={generatedStep.type} onChange={(e) => setGeneratedStep({ ...generatedStep, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white">
                    <option value="skill">Skill</option><option value="project">Project</option><option value="branding">Branding</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowEditStepModal(false); setGeneratedStep(null); }} className="flex-1 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Discard
                </button>
                <button onClick={handleSubmitGeneratedStep} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Add to Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal - Now requires parent step selection */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Assign New Task</h3>
              <button onClick={() => { setShowAddTaskModal(false); setNewTask({ title: '', description: '', dueDate: '', stepId: '' }); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Parent Step Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Parent Roadmap Step <span className="text-red-500">*</span>
                </label>
                {selectedMentee && selectedMentee.roadmap.length > 0 ? (
                  <div className="relative">
                    <select 
                      value={newTask.stepId} 
                      onChange={(e) => setNewTask({ ...newTask, stepId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none"
                    >
                      <option value="">Select a roadmap step...</option>
                      {selectedMentee.roadmap.map(step => (
                        <option key={step.id} value={step.id}>{step.title}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                    No roadmap steps available. Create a step first.
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Task Title</label>
                <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Build a Todo App" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detailed instructions..." rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <button 
                onClick={handleAddTask} 
                disabled={!newTask.stepId || !newTask.title}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit AI Generated Task Modal */}
      {showEditTaskModal && generatedTask && selectedMentee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">AI Generated Task</h3>
              </div>
              <button onClick={() => { setShowEditTaskModal(false); setGeneratedTask(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                Review and edit the AI-generated task before assigning it.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Parent Roadmap Step <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={generatedTask.stepId || ''} 
                    onChange={(e) => setGeneratedTask({ ...generatedTask, stepId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white appearance-none"
                  >
                    <option value="">Select a roadmap step...</option>
                    {selectedMentee.roadmap.map(step => (
                      <option key={step.id} value={step.id}>{step.title}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Task Title</label>
                <input type="text" value={generatedTask.title} onChange={(e) => setGeneratedTask({ ...generatedTask, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea value={generatedTask.description} onChange={(e) => setGeneratedTask({ ...generatedTask, description: e.target.value })}
                  rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                <input type="date" value={generatedTask.dueDate} onChange={(e) => setGeneratedTask({ ...generatedTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowEditTaskModal(false); setGeneratedTask(null); }} className="flex-1 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Discard
                </button>
                <button 
                  onClick={handleSubmitGeneratedTask} 
                  disabled={!generatedTask.stepId || !generatedTask.title}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={18} /> Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Notification Modal */}
      {showBulkNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Send Bulk Notification</h3>
              </div>
              <button onClick={() => { setShowBulkNotifyModal(false); setBulkNotification({ title: '', message: '', selectedMentees: [] }); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            {notificationSent ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Notification Sent!</h4>
                <p className="text-slate-500">Your message has been delivered to {bulkNotification.selectedMentees.length === 0 ? 'all mentees' : `${bulkNotification.selectedMentees.length} mentee(s)`}.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Mentee Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Recipients
                  </label>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-40 overflow-y-auto">
                    <div 
                      onClick={() => setBulkNotification(prev => ({ ...prev, selectedMentees: [] }))}
                      className={`p-3 flex items-center gap-3 cursor-pointer border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 ${bulkNotification.selectedMentees.length === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${bulkNotification.selectedMentees.length === 0 ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                        {bulkNotification.selectedMentees.length === 0 && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">All Mentees ({mentees.length})</span>
                    </div>
                    {mentees.map(mentee => (
                      <div 
                        key={mentee.id}
                        onClick={() => toggleMenteeSelection(mentee.id)}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${bulkNotification.selectedMentees.includes(mentee.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${bulkNotification.selectedMentees.includes(mentee.id) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                          {bulkNotification.selectedMentees.includes(mentee.id) && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <img src={mentee.avatarUrl} alt={mentee.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{mentee.name}</p>
                          <p className="text-xs text-slate-500">{mentee.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {bulkNotification.selectedMentees.length === 0 
                      ? 'Sending to all mentees' 
                      : `${bulkNotification.selectedMentees.length} mentee(s) selected`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notification Title</label>
                  <input 
                    type="text" 
                    value={bulkNotification.title} 
                    onChange={(e) => setBulkNotification({ ...bulkNotification, title: e.target.value })}
                    placeholder="e.g., Important Update" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                  <textarea 
                    value={bulkNotification.message} 
                    onChange={(e) => setBulkNotification({ ...bulkNotification, message: e.target.value })}
                    placeholder="Write your message to mentees..." 
                    rows={4} 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none" 
                  />
                </div>

                <button 
                  onClick={handleSendBulkNotification}
                  disabled={!bulkNotification.title || !bulkNotification.message}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send Notification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorClients;
