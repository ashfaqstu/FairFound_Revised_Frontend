
import React, { useState } from 'react';
import { FreelancerProfile } from '../types';
import { generateProposalWithGemini } from '../services/geminiService';
import { FileText, Send, Copy, Loader2, Sparkles, Check, History, Lock } from 'lucide-react';

interface ProposalGeneratorProps {
  profile: FreelancerProfile | null;
  isSignedUp?: boolean;
  onSignup?: () => void;
}

const ProposalGenerator: React.FC<ProposalGeneratorProps> = ({ profile, isSignedUp = true, onSignup }) => {
  const [jobDesc, setJobDesc] = useState('');
  const [clientName, setClientName] = useState('');
  const [tone, setTone] = useState('Professional & Confident');
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!profile || !jobDesc) return;
    setLoading(true);
    setCopied(false);
    try {
      const result = await generateProposalWithGemini(profile, jobDesc, tone, clientName);
      setProposal(result);
      setHistory(prev => [result, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) return <div className="p-8 text-slate-500 dark:text-slate-400">Please complete onboarding first.</div>;

  // Locked overlay for non-signed-up users
  const LockedOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Proposal Generator</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Sign up to generate winning proposals tailored to each job posting.
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
    <div className="h-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors relative">
      {/* Input Section */}
      <div className="w-full md:w-1/2 p-8 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="text-indigo-600 dark:text-indigo-400"/> Proposal Writer
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
                Paste a job description and we'll craft a tailored proposal highlighting your relevant skills.
            </p>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client Name (Optional)</label>
                <input 
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800 outline-none dark:text-white"
                    placeholder="e.g. John, or Company Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Description</label>
                <textarea 
                    className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed resize-none bg-slate-50 dark:bg-slate-800 transition-colors"
                    placeholder="Paste the client's job description here..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tone of Voice</label>
                <div className="grid grid-cols-3 gap-3">
                    {['Professional', 'Casual', 'Enthusiastic'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all border ${
                                tone === t 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={loading || !jobDesc}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Generate Proposal
            </button>
        </div>
      </div>

      {/* Output Section */}
      <div className={`w-full md:w-1/2 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col transition-colors ${!isSignedUp ? 'blur-sm pointer-events-none' : ''}`}>
        {proposal ? (
            <div className="flex-1 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white">Generated Draft</h3>
                    <button 
                        onClick={handleCopy}
                        className={`text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                            copied ? 'bg-emerald-100 text-emerald-700' : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30'
                        }`}
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />} 
                        {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 transition-colors">
                     <textarea 
                        className="w-full h-full outline-none text-slate-700 dark:text-slate-300 leading-loose resize-none font-serif text-lg bg-transparent"
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                    />
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                <Send size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
                <p>Your proposal will appear here</p>
                {history.length > 0 && (
                     <div className="mt-8 w-full max-w-sm">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1 justify-center">
                            <History size={12}/> Recent Drafts
                        </div>
                        <div className="space-y-2">
                            {history.slice(0, 3).map((hist, i) => (
                                <button key={i} onClick={() => setProposal(hist)} className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 hover:border-indigo-300 truncate transition-colors shadow-sm">
                                    {hist.substring(0, 50)}...
                                </button>
                            ))}
                        </div>
                     </div>
                )}
            </div>
        )}
      </div>
      
      {/* Locked overlay for non-signed-up users */}
      {!isSignedUp && <LockedOverlay />}
    </div>
  );
};

export default ProposalGenerator;
