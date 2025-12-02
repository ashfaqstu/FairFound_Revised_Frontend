
import React, { useState } from 'react';
import { FreelancerProfile, PortfolioContent } from '../types';
import { enhancePortfolioWithGemini } from '../services/geminiService';
import { Globe, RefreshCw, Layout, Code, ExternalLink, Loader2, Save, Download, Check, Lock } from 'lucide-react';

interface PortfolioBuilderProps {
  profile: FreelancerProfile | null;
  isSignedUp?: boolean;
  onSignup?: () => void;
}

const PortfolioBuilder: React.FC<PortfolioBuilderProps> = ({ profile, isSignedUp = true, onSignup }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [published, setPublished] = useState(false);

  const handleGenerate = async () => {
    if (!profile) return;
    setLoading(true);
    setPublished(false);
    try {
      const result = await enhancePortfolioWithGemini(profile);
      setContent(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = (field: keyof PortfolioContent, value: string) => {
    if (content) {
      setContent({ ...content, [field]: value });
    }
  };

  const updateProject = (index: number, field: string, value: string) => {
    if (content) {
      const newProjects = [...content.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      setContent({ ...content, projects: newProjects });
    }
  };

  const handlePublish = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setPublished(true);
    }, 1500);
  };

  if (!profile) return <div className="p-8 text-slate-500 dark:text-slate-400">Please complete onboarding first.</div>;

  // Locked overlay for non-signed-up users
  const LockedOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Build Your Portfolio</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Sign up to generate and publish your AI-powered portfolio website.
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
    <div className="flex h-full relative">
      {/* Sidebar Controls */}
      <div className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full overflow-y-auto transition-colors">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Portfolio Builder</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Generate a high-converting portfolio website using AI. Edit the content directly in the preview.
            </p>
        </div>

        <div className="space-y-6 flex-1">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Template Style</label>
                <div className="grid grid-cols-2 gap-3">
                    <button className="border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg text-left transition-all">
                        <div className="w-8 h-8 bg-indigo-200 dark:bg-indigo-700 rounded mb-2"></div>
                        <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">Modern</span>
                    </button>
                    <button className="border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 p-3 rounded-lg text-left transition-all">
                         <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Minimal</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <Code size={16} className="text-indigo-500"/> Data Source
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>✓ GitHub: {profile.githubUsername || 'Not connected'}</p>
                    <p>✓ Skills: {profile.skills.length} listed</p>
                    <p>✓ Role: {profile.title}</p>
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
            >
                {loading && !published ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                {content ? 'Regenerate' : 'Generate Portfolio'}
            </button>

            {content && (
                <button 
                    onClick={handlePublish}
                    disabled={loading || published}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none mt-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : published ? <Check size={20}/> : <Globe size={20} />}
                    {published ? 'Published Successfully' : 'Publish Website'}
                </button>
            )}

            {published && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg text-sm text-center border border-emerald-200 dark:border-emerald-800 animate-fade-in">
                    <p className="font-bold">Your site is live!</p>
                    <a href="#" className="underline opacity-80 hover:opacity-100">{profile.name.toLowerCase().replace(' ', '')}.fairfound.dev</a>
                </div>
            )}
        </div>
      </div>

      {/* Preview Area */}
      <div className={`flex-1 bg-slate-100 dark:bg-slate-950 p-8 overflow-y-auto transition-colors ${!isSignedUp ? 'blur-sm pointer-events-none' : ''}`}>
        {content ? (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[800px] flex flex-col relative group">
                {/* Overlay Hint */}
                <div className="absolute top-14 left-0 w-full bg-indigo-600 text-white text-xs py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    Click text elements to edit content
                </div>

                {/* Mock Browser Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2 z-10 relative">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 mx-4 bg-white border border-slate-200 rounded-md h-6 text-xs flex items-center px-2 text-slate-400">
                        {profile.name.toLowerCase().replace(' ', '')}.dev
                    </div>
                    <div className="flex gap-2">
                        <button className="text-slate-400 hover:text-slate-600" title="Save Draft">
                            <Save size={14} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600" title="Export Code">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                {/* Website Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Hero */}
                    <header className="px-12 py-20 bg-white text-slate-900">
                        <input 
                            className="text-5xl font-extrabold mb-6 leading-tight w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded p-1"
                            value={content.tagline}
                            onChange={(e) => updateContent('tagline', e.target.value)}
                        />
                        <textarea 
                            className="text-xl text-slate-600 max-w-2xl leading-relaxed mb-8 w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-100 rounded p-1 resize-none h-32"
                            value={content.about}
                            onChange={(e) => updateContent('about', e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button className="bg-black text-white px-6 py-3 rounded-full font-medium">View Work</button>
                            <button className="bg-slate-100 text-slate-900 px-6 py-3 rounded-full font-medium">Contact Me</button>
                        </div>
                    </header>

                    {/* Projects Grid */}
                    <section className="px-12 py-16 bg-slate-50">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8">Selected Work</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {content.projects.map((project, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                                    <div className="h-40 bg-slate-100 rounded-xl mb-6 flex items-center justify-center text-slate-300">
                                        <Layout size={48} />
                                    </div>
                                    <input 
                                        className="text-xl font-bold text-slate-900 mb-2 w-full bg-transparent outline-none border-none focus:ring-1 focus:ring-indigo-100"
                                        value={project.title}
                                        onChange={(e) => updateProject(i, 'title', e.target.value)}
                                    />
                                    <textarea 
                                        className="text-slate-600 text-sm mb-4 leading-relaxed w-full bg-transparent outline-none border-none focus:ring-1 focus:ring-indigo-100 resize-none"
                                        value={project.description}
                                        onChange={(e) => updateProject(i, 'description', e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <Globe size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-lg">Click "Generate Portfolio" to build your site</p>
            </div>
        )}
      </div>
      
      {/* Locked overlay for non-signed-up users */}
      {!isSignedUp && <LockedOverlay />}
    </div>
  );
};

export default PortfolioBuilder;
