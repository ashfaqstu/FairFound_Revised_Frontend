import React, { useState } from 'react';
import { RoadmapStep, RoadmapTask } from '../types';
import { 
  CheckCircle2, Circle, Clock, Code, PenTool, Layout, Lock, 
  Sparkles, Shield, ChevronDown, ChevronUp, Plus, ListTodo,
  CheckSquare, Square, Crown
} from 'lucide-react';

interface RoadmapProps {
  steps: RoadmapStep[];
  isSignedUp?: boolean;
  hasMentor?: boolean; // User has connected with a mentor (paid)
  onSignup?: () => void;
  onFindMentor?: () => void;
}

const Roadmap: React.FC<RoadmapProps> = ({ steps, isSignedUp = true, hasMentor = false, onSignup, onFindMentor }) => {
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const getIcon = (type: RoadmapStep['type']) => {
    switch (type) {
      case 'skill': return <Code size={16} />;
      case 'branding': return <Layout size={16} />;
      case 'project': return <PenTool size={16} />;
      default: return <Circle size={16} />;
    }
  };

  const getStatusColor = (status: RoadmapStep['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'in-progress': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Mock tasks for pro mode demo
  const getMockTasks = (stepId: string): RoadmapTask[] => [
    { id: `${stepId}-t1`, title: 'Watch introductory video course', description: 'Complete the fundamentals module', completed: false },
    { id: `${stepId}-t2`, title: 'Build a practice project', description: 'Apply concepts in a real scenario', completed: false },
    { id: `${stepId}-t3`, title: 'Submit for mentor review', description: 'Get feedback from your assigned mentor', completed: false },
  ];

  // Locked overlay for non-signed-up users
  const LockedOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20 rounded-2xl">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unlock Your Full Roadmap</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Sign up to see your complete personalized growth path.
        </p>
        <button 
          onClick={onSignup}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          Sign Up Free
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Your Growth Roadmap</h2>
          {hasMentor && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">
              <Crown size={12} /> MENTOR GUIDED
            </span>
          )}
        </div>
        
        {/* AI + Mentor Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
          hasMentor 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
        }`}>
          <Sparkles size={16} className={hasMentor ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} />
          <span className={hasMentor ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-700 dark:text-indigo-300'}>
            {hasMentor 
              ? 'Personalized roadmap with tasks from your mentor' 
              : 'AI-generated roadmap - connect with a mentor for detailed tasks'
            }
          </span>
          <Shield size={16} className={hasMentor ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'} />
        </div>

        {!hasMentor && isSignedUp && (
          <p className="text-slate-500 dark:text-slate-400 mt-4 text-sm">
            Connect with a mentor to get detailed tasks, feedback, and personalized guidance.
          </p>
        )}
      </div>

      {/* Find Mentor Banner for users without mentor */}
      {!hasMentor && isSignedUp && (
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Get Personalized Tasks & Guidance</h3>
              <p className="text-indigo-100 text-sm">Connect with a mentor to unlock detailed tasks, feedback, and 1:1 sessions.</p>
            </div>
            <button 
              onClick={onFindMentor}
              className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition-colors shrink-0"
            >
              Find a Mentor
            </button>
          </div>
        </div>
      )}

      {/* Roadmap Steps */}
      <div className="relative">
        {/* Connector Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

        <div className={`space-y-4 ${!isSignedUp ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.includes(step.id);
            const tasks = step.tasks || (hasMentor ? getMockTasks(step.id) : []);
            const shouldFade = !isSignedUp && index > 1;

            return (
              <div key={step.id} className={`relative ${shouldFade ? 'opacity-40' : ''}`}>
                {/* Node */}
                <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 z-10 ${
                  step.status === 'completed' ? 'bg-emerald-500' : 
                  step.status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}></div>

                {/* Card */}
                <div className="ml-14">
                  <div className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${
                    step.status === 'in-progress' 
                      ? 'border-indigo-200 dark:border-indigo-800 shadow-md' 
                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                  }`}>
                    {/* Step Header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                            {step.status === 'completed' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                            {step.status.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{step.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
                          {getIcon(step.type)}
                          <span className="uppercase tracking-wide">{step.type}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>

                      {/* Mentor: Show tasks toggle (read-only for mentee) */}
                      {hasMentor && tasks.length > 0 && (
                        <button 
                          onClick={() => toggleStep(step.id)}
                          className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          <ListTodo size={16} />
                          {tasks.length} Tasks
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}

                      {/* Basic: Simple checkbox (only when no mentor connected) */}
                      {!hasMentor && isSignedUp && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <button 
                            onClick={() => toggleTask(step.id)}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {completedTasks.includes(step.id) ? (
                              <CheckSquare size={18} className="text-emerald-500" />
                            ) : (
                              <Square size={18} />
                            )}
                            Mark as completed
                          </button>
                        </div>
                      )}

                      {/* When mentor is connected but no tasks expanded yet - show read-only status */}
                      {hasMentor && !isExpanded && tasks.length === 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-sm text-slate-400 cursor-not-allowed">
                            {step.status === 'completed' ? (
                              <CheckSquare size={18} className="text-emerald-500" />
                            ) : (
                              <Square size={18} />
                            )}
                            <span>{step.status === 'completed' ? 'Completed by mentor' : 'Awaiting mentor approval'}</span>
                            <Lock size={14} className="ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mentor: Expanded Tasks (Read-only for mentee - only mentor can tick) */}
                    {hasMentor && isExpanded && tasks.length > 0 && (
                      <div className="px-5 pb-5 pt-0">
                        {/* Info banner - mentee cannot tick tasks */}
                        <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                          <Lock size={14} className="text-amber-600 dark:text-amber-400" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Your mentor manages task completion. Contact them to update progress.
                          </p>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                          {tasks.map((task) => (
                            <div 
                              key={task.id}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700"
                            >
                              {/* Read-only checkbox - no onClick, just display status */}
                              <div className="mt-0.5 shrink-0 cursor-not-allowed opacity-60">
                                {task.completed || completedTasks.includes(task.id) ? (
                                  <CheckSquare size={18} className="text-emerald-500" />
                                ) : (
                                  <Square size={18} className="text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${task.completed || completedTasks.includes(task.id) ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.description}</p>
                              </div>
                            </div>
                          ))}
                          
                          {/* Request mentor to add tasks */}
                          <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors">
                            <Plus size={16} />
                            Request mentor to add task
                          </button>
                        </div>

                        {/* Mentor Notes */}
                        {step.mentorNotes && (
                          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">Mentor Note:</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">{step.mentorNotes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked overlay for non-signed-up users */}
        {!isSignedUp && <LockedOverlay />}
      </div>
    </div>
  );
};

export default Roadmap;
