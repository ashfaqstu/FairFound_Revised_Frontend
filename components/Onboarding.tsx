
import React, { useState, useRef } from 'react';
import { FreelancerProfile } from '../types';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, Upload, FileText, Check, ArrowLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: FreelancerProfile) => void;
  isLoading: boolean;
  onBack: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, isLoading, onBack }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FreelancerProfile>({
    name: '',
    title: '',
    bio: '',
    skills: [],
    experienceYears: 0,
    hourlyRate: 0,
    githubUsername: '',
    portfolioUrl: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      // Simulate extraction delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadedFile(file.name);
        
        // Mock extraction logic - populate some fields if empty
        setFormData(prev => ({
          ...prev,
          experienceYears: prev.experienceYears || 4,
          bio: prev.bio || "Experienced professional with a strong background in software development and project management. Passionate about building scalable solutions.",
          skills: prev.skills.length > 0 ? prev.skills : ['JavaScript', 'React', 'Project Management', 'Agile']
        }));
      }, 2000);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col items-center justify-center mb-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${uploadedFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/50'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx" />
                    
                    {isUploading ? (
                        <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400">
                             <Loader2 className="h-10 w-10 mb-3 animate-spin" />
                             <p className="text-sm font-medium">Extracting data from Resume...</p>
                        </div>
                    ) : uploadedFile ? (
                        <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                             <Check className="h-10 w-10 mb-3" />
                             <p className="text-sm font-medium">Analyzed {uploadedFile}</p>
                             <p className="text-xs mt-1 opacity-70">We've pre-filled some fields for you!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload CV / Resume to Auto-Fill</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We can extract experience & skills automatically</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="e.g. Alex Rivera"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Title</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Years of Experience</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="e.g. 5"
                value={formData.experienceYears || ''}
                onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Hourly Rate ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="e.g. 85"
                value={formData.hourlyRate || ''}
                onChange={e => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">We'll use this to benchmark you against the market.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Skills (Press Enter)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="Type skill and hit Enter..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map(skill => (
                  <span key={skill} className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-indigo-900 dark:hover:text-indigo-100">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Username</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500">github.com/</span>
                <input 
                  type="text" 
                  className="w-full pl-28 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                  placeholder="username"
                  value={formData.githubUsername}
                  onChange={e => setFormData({...formData, githubUsername: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Portfolio URL</label>
              <input 
                type="url" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                placeholder="https://myportfolio.com"
                value={formData.portfolioUrl}
                onChange={e => setFormData({...formData, portfolioUrl: e.target.value})}
              />
            </div>
            
             <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Bio</label>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white resize-none"
                placeholder="Tell us a bit about your professional focus..."
                rows={4}
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-4 transition-colors">
        <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Sparkles className="text-indigo-600 dark:text-indigo-500 w-8 h-8 animate-pulse" />
            </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold text-slate-800 dark:text-white">Analyzing Profile...</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-center">
            Our AI is comparing your skills against 50,000+ global freelance profiles to generate your baseline score.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors relative">
      <button 
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm font-medium"
      >
          <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        <div className="mb-8">
            <div className="flex justify-between text-sm font-medium text-slate-400 dark:text-slate-500 mb-2">
                <span>Step {step} of 3</span>
                <span>{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {step === 1 ? 'Discover Your True Market Potential' : step === 2 ? 'Showcase Your Skills' : 'Connect Your Work'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {step === 1 ? "Let our AI analyze your experience and generate a custom career roadmap. No sign-up needed." : step === 2 ? "What do you bring to the table?" : "Where can we see your code?"}
        </p>

        {renderStep()}

        <div className="mt-10 flex justify-between">
          {step > 1 ? (
            <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <ChevronLeft size={20} /> Back
            </button>
          ) : <div></div>}
          
          <button 
            onClick={step === 3 ? () => onComplete(formData) : handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:translate-y-[-1px]"
          >
            {step === 3 ? 'Analyze Profile' : 'Next Step'} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
