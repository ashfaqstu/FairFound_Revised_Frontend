import React, { useState, useEffect, useRef } from 'react';
import { FreelancerProfile } from '../types';
import { profileAPI, FreelancerProfileData } from '../services/api';
import { Camera, Mail, MapPin, Link as LinkIcon, Save, Github, LogOut, Lock, Loader2, X, Plus, Check } from 'lucide-react';

interface ProfileProps {
  profile: FreelancerProfile | null;
  onUpdate: (profile: FreelancerProfile) => void;
  isSignedUp?: boolean;
  onSignup?: () => void;
  onSignOut?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onUpdate, isSignedUp = true, onSignup, onSignOut }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FreelancerProfile>({
    name: '',
    title: '',
    bio: '',
    skills: [],
    experienceYears: 0,
    hourlyRate: 0,
    email: '',
    location: '',
    githubUsername: '',
    portfolioUrl: '',
    avatarUrl: ''
  });

  // Load profile from backend on mount
  useEffect(() => {
    if (isSignedUp) {
      loadProfile();
    }
  }, [isSignedUp]);

  // Update form when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileAPI.getProfile();
      const mappedProfile: FreelancerProfile = {
        name: data.name || '',
        title: data.title || '',
        bio: data.bio || '',
        skills: data.skills || [],
        experienceYears: data.experience_years || 0,
        hourlyRate: data.hourly_rate || 0,
        email: data.email || '',
        location: data.location || '',
        githubUsername: data.github_username || '',
        portfolioUrl: data.portfolio_url || '',
        avatarUrl: data.avatar_url || ''
      };
      setFormData(mappedProfile);
      onUpdate(mappedProfile);
    } catch (err: any) {
      console.error('[PROFILE] Error loading:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Map frontend format to backend format
      const updateData: Partial<FreelancerProfileData> = {
        title: formData.title,
        bio: formData.bio,
        skills: formData.skills,
        experience_years: formData.experienceYears,
        hourly_rate: formData.hourlyRate,
        location: formData.location,
        github_username: formData.githubUsername,
        portfolio_url: formData.portfolioUrl,
      };
      
      const response = await profileAPI.updateProfile(updateData);
      
      // Map response back to frontend format
      const updatedProfile: FreelancerProfile = {
        name: response.name || formData.name,
        title: response.title || '',
        bio: response.bio || '',
        skills: response.skills || [],
        experienceYears: response.experience_years || 0,
        hourlyRate: response.hourly_rate || 0,
        email: response.email || formData.email,
        location: response.location || '',
        githubUsername: response.github_username || '',
        portfolioUrl: response.portfolio_url || '',
        avatarUrl: response.avatar_url || formData.avatarUrl
      };
      
      setFormData(updatedProfile);
      onUpdate(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[PROFILE] Error saving:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setSaving(true);
      setError(null);
      const response = await profileAPI.uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatarUrl: response.avatar_url }));
      onUpdate({ ...formData, avatarUrl: response.avatar_url });
      setSuccess('Avatar updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[PROFILE] Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    if (formData.skills.includes(newSkill.trim())) {
      setError('Skill already exists');
      return;
    }
    
    const updatedSkills = [...formData.skills, newSkill.trim()];
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
    setNewSkill('');
    setShowSkillInput(false);
    
    // If not in edit mode, save immediately
    if (!isEditing) {
      try {
        await profileAPI.patchProfile({ skills: updatedSkills });
        onUpdate({ ...formData, skills: updatedSkills });
      } catch (err) {
        console.error('[PROFILE] Error adding skill:', err);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = formData.skills.filter(s => s !== skillToRemove);
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
    
    // If not in edit mode, save immediately
    if (!isEditing) {
      try {
        await profileAPI.patchProfile({ skills: updatedSkills });
        onUpdate({ ...formData, skills: updatedSkills });
      } catch (err) {
        console.error('[PROFILE] Error removing skill:', err);
      }
    }
  };

  // Show signup prompt if not signed up
  if (!isSignedUp) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-indigo-600 dark:text-indigo-400" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Create Your Account</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            Sign up to save your profile, track your progress, and access all features.
          </p>
          <button 
            onClick={onSignup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
          >
            Sign Up Free
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
          <span className="ml-3 text-slate-600 dark:text-slate-400">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Hidden file input for avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
          <Check size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h2>
        <button 
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={saving}
          className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isEditing 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50' 
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : isEditing ? (
            <><Save size={18} /> Save Changes</>
          ) : (
            'Edit Profile'
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 p-1">
                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 overflow-hidden">
                  {formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `http://localhost:8000${formData.avatarUrl}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    formData.name.charAt(0).toUpperCase() || '?'
                  )}
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Camera size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name || 'Not set'}</h3>
                <p className="text-xs text-slate-400 mt-1">Name is set from your account</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Professional Title</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Junior Frontend Developer"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-lg text-slate-700 dark:text-slate-300">{formData.title || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Bio</label>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{formData.bio || 'No bio provided yet.'}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Hourly Rate ($)</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">${formData.hourlyRate}/hr</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Experience (Years)</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{formData.experienceYears} Years</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Mail size={18} />
                  <span>{formData.email || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <MapPin size={18} />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Remote, New York"
                      className="flex-1 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <span>{formData.location || 'Not set'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <Github size={18} />
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.githubUsername}
                      onChange={(e) => setFormData({...formData, githubUsername: e.target.value})}
                      placeholder="GitHub username"
                      className="flex-1 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    formData.githubUsername ? (
                      <a href={`https://github.com/${formData.githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500">
                        {formData.githubUsername}
                      </a>
                    ) : (
                      <span>Not connected</span>
                    )
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <LinkIcon size={18} />
                  {isEditing ? (
                    <input 
                      type="url" 
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                      placeholder="https://yourportfolio.com"
                      className="flex-1 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    formData.portfolioUrl ? (
                      <a href={formData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 hover:underline text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                        {formData.portfolioUrl}
                      </a>
                    ) : (
                      <span>No portfolio link</span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span 
                  key={skill} 
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800 flex items-center gap-1"
                >
                  {skill}
                  {isEditing && (
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              
              {showSkillInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Enter skill"
                    className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-32"
                    autoFocus
                  />
                  <button 
                    onClick={handleAddSkill}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => { setShowSkillInput(false); setNewSkill(''); }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowSkillInput(true)}
                  className="px-3 py-1 border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-full text-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Skill
                </button>
              )}
            </div>
          </div>

          {/* Account Section */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Account</h4>
            <button 
              onClick={onSignOut}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-800"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
