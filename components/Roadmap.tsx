import React, { useState, useEffect, useRef } from 'react';
import { RoadmapStep, RoadmapTask } from '../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Code,
  PenTool,
  Layout,
  Lock,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronUp,
  Plus,
  ListTodo,
  CheckSquare,
  Square,
  Crown,
  Loader2,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Youtube,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import { roadmapAPI, mapStepToFrontend } from '../services/roadmapService';

interface RoadmapProps {
  steps?: RoadmapStep[];
  isSignedUp?: boolean;
  hasMentor?: boolean;
  onSignup?: () => void;
  onFindMentor?: () => void;
  skillGaps?: string[];
}

const Roadmap: React.FC<RoadmapProps> = ({
  steps: initialSteps,
  isSignedUp = true,
  hasMentor = false,
  onSignup,
  onFindMentor,
  skillGaps = [],
}) => {
  const [steps, setSteps] = useState<RoadmapStep[]>(initialSteps || []);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch roadmap from backend on mount
  useEffect(() => {
    if (isSignedUp) {
      fetchRoadmap();
    }
  }, [isSignedUp]);

  // Polling for roadmap updates (every 30 seconds)
  useEffect(() => {
    if (!isSignedUp) return;

    pollingRef.current = setInterval(async () => {
      try {
        const data = await roadmapAPI.getRoadmap();
        if (data.length > 0) {
          const newSteps = data.map(mapStepToFrontend);
          // Check for changes in steps and tasks
          const currentState = steps.map(s => `${s.id}-${s.status}-${s.tasks?.map(t => `${t.id}:${t.completed}`).join(',')}`).join('|');
          const newState = newSteps.map(s => `${s.id}-${s.status}-${s.tasks?.map(t => `${t.id}:${t.completed}`).join(',')}`).join('|');
          if (currentState !== newState) {
            setSteps(newSteps);
            setLastUpdated(new Date());
            console.log('[ROADMAP POLLING] Updated roadmap with task changes');
          }
        }
      } catch (err) {
        console.error('[ROADMAP POLLING] Error:', err);
      }
    }, 10000); // Poll every 10 seconds for faster task updates

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isSignedUp, steps]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roadmapAPI.getRoadmap();
      if (data.length > 0) {
        setSteps(data.map(mapStepToFrontend));
      } else if (skillGaps.length > 0) {
        // No roadmap exists, generate one
        await handleGenerateRoadmap();
      }
    } catch (err: any) {
      console.error('[ROADMAP] Error fetching:', err);
      setError('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (skillGaps.length === 0) {
      setError('No skill gaps identified. Complete your profile analysis first.');
      return;
    }
    try {
      setGenerating(true);
      setError(null);
      const response = await roadmapAPI.generateRoadmap(skillGaps);
      setSteps(response.steps.map(mapStepToFrontend));
    } catch (err: any) {
      console.error('[ROADMAP] Error generating:', err);
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (stepId: string, newStatus: string) => {
    try {
      await roadmapAPI.updateStepStatus(Number(stepId), newStatus);
      setSteps(prev =>
        prev.map(s => (s.id === stepId ? { ...s, status: newStatus as any } : s))
      );
    } catch (err) {
      console.error('[ROADMAP] Error updating status:', err);
    }
  };

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

  // Parse markdown links in description and render as clickable
  const renderDescription = (description: string) => {
    // Match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(description)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(description.slice(lastIndex, match.index));
      }
      // Add the link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          {match[1]}
          <ExternalLink size={12} />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < description.length) {
      parts.push(description.slice(lastIndex));
    }
    return parts.length > 0 ? parts : description;
  };

  const getMockTasks = (stepId: string): RoadmapTask[] => [
    { id: `${stepId}-t1`, title: 'Watch introductory video course', description: 'Complete the fundamentals module', completed: false },
    { id: `${stepId}-t2`, title: 'Build a practice project', description: 'Apply concepts in a real scenario', completed: false },
    { id: `${stepId}-t3`, title: 'Submit for mentor review', description: 'Get feedback from your assigned mentor', completed: false },
  ];

  const LockedOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20 rounded-2xl">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unlock Your Full Roadmap</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Sign up to see your complete personalized growth path.</p>
        <button onClick={onSignup} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
          Sign Up Free
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading roadmap...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Your Growth Roadmap</h2>
          <div className="flex items-center gap-2">
            {hasMentor && (
              <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] md:text-xs font-bold">
                <Crown size={12} /> MENTOR GUIDED
              </span>
            )}
            {isSignedUp && !hasMentor && steps.length > 0 && (
              <button
                onClick={handleGenerateRoadmap}
                disabled={generating || skillGaps.length === 0}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span className="hidden sm:inline">Regenerate</span>
                <span className="sm:hidden">Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Badge */}
        <div className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm ${
          hasMentor
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
            : 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
        }`}>
          <Sparkles size={14} className={`md:w-4 md:h-4 ${hasMentor ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
          <span className={hasMentor ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-700 dark:text-indigo-300'}>
            <span className="hidden sm:inline">{hasMentor ? 'Personalized roadmap with tasks from your mentor' : 'AI-generated roadmap with learning resources'}</span>
            <span className="sm:hidden">{hasMentor ? 'Mentor guided' : 'AI-generated'}</span>
          </span>
          <Shield size={14} className={`md:w-4 md:h-4 hidden sm:block ${hasMentor ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
        </div>

        {!hasMentor && isSignedUp && (
          <p className="text-slate-500 dark:text-slate-400 mt-3 md:mt-4 text-xs md:text-sm">
            Click on the resource links to access tutorials, documentation, and courses.
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Empty State - Generate Roadmap */}
      {isSignedUp && steps.length === 0 && !loading && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Generate Your Roadmap</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {skillGaps.length > 0
              ? `We've identified ${skillGaps.length} skill gaps. Generate a personalized learning roadmap with curated resources.`
              : 'Complete your profile analysis first to identify skill gaps and generate a personalized roadmap.'}
          </p>
          <button
            onClick={handleGenerateRoadmap}
            disabled={generating || skillGaps.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Roadmap</>}
          </button>
        </div>
      )}

      {/* Find Mentor Banner */}
      {!hasMentor && isSignedUp && steps.length > 0 && (
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base md:text-lg font-bold mb-1">Get Personalized Tasks & Guidance</h3>
              <p className="text-indigo-100 text-xs md:text-sm">Connect with a mentor to unlock detailed tasks, feedback, and 1:1 sessions.</p>
            </div>
            <button onClick={onFindMentor} className="bg-white text-indigo-700 px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold hover:bg-indigo-50 transition-colors shrink-0 text-sm md:text-base w-full sm:w-auto">
              Find a Mentor
            </button>
          </div>
        </div>
      )}

      {/* Roadmap Steps */}
      {steps.length > 0 && (
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

          <div className={`space-y-3 md:space-y-4 ${!isSignedUp ? 'blur-sm pointer-events-none select-none' : ''}`}>
            {steps.map((step, index) => {
              const isExpanded = expandedSteps.includes(step.id);
              const tasks = step.tasks || (hasMentor ? getMockTasks(step.id) : []);
              const shouldFade = !isSignedUp && index > 1;

              return (
                <div key={step.id} className={`relative ${shouldFade ? 'opacity-40' : ''}`}>
                  {/* Node */}
                  <div className={`absolute left-2 md:left-4 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-white dark:border-slate-950 z-10 ${
                    step.status === 'completed' ? 'bg-emerald-500' :
                    step.status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}></div>

                  {/* Card */}
                  <div className="ml-10 md:ml-14">
                    <div className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${
                      step.status === 'in-progress'
                        ? 'border-indigo-200 dark:border-indigo-800 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                    }`}>
                      {/* Step Header */}
                      <div className="p-4 md:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium border ${getStatusColor(step.status)}`}>
                              {step.status === 'completed' ? <CheckCircle2 size={10} className="md:w-3 md:h-3" /> : <Clock size={10} className="md:w-3 md:h-3" />}
                              {step.status.replace('-', ' ')}
                            </span>
                            <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">{step.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 dark:text-slate-500 text-[10px] md:text-xs">
                            {getIcon(step.type)}
                            <span className="uppercase tracking-wide">{step.type}</span>
                          </div>
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {renderDescription(step.description)}
                        </p>

                        {/* Learning Resources */}
                        {step.resources && step.resources.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                              <BookOpen size={14} /> Learning Resources
                            </p>
                            <div className="space-y-2">
                              {step.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                                >
                                  {resource.type === 'youtube' ? (
                                    <Youtube size={14} className="text-red-500 shrink-0" />
                                  ) : resource.type === 'docs' ? (
                                    <FileText size={14} className="text-blue-500 shrink-0" />
                                  ) : resource.type === 'course' ? (
                                    <BookOpen size={14} className="text-green-500 shrink-0" />
                                  ) : (
                                    <LinkIcon size={14} className="text-slate-500 shrink-0" />
                                  )}
                                  <span className="truncate">{resource.title}</span>
                                  <ExternalLink size={12} className="shrink-0 opacity-50" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mentor: Show tasks toggle */}
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

                        {/* Free tier: Mark as completed */}
                        {!hasMentor && isSignedUp && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => {
                                const newStatus = step.status === 'completed' ? 'pending' : 'completed';
                                handleUpdateStatus(step.id, newStatus);
                              }}
                              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {step.status === 'completed' ? (
                                <CheckSquare size={18} className="text-emerald-500" />
                              ) : (
                                <Square size={18} />
                              )}
                              {step.status === 'completed' ? 'Completed' : 'Mark as completed'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Mentor: Expanded Tasks */}
                      {hasMentor && isExpanded && tasks.length > 0 && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                            <Lock size={14} className="text-amber-600 dark:text-amber-400" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Your mentor manages task completion. Contact them to update progress.
                            </p>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                            {tasks.map(task => (
                              <div key={task.id} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
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

                            <button className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors">
                              <Plus size={16} />
                              Request mentor to add task
                            </button>
                          </div>

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
      )}
    </div>
  );
};

export default Roadmap;
