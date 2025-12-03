import React, { useState, useEffect, useRef } from 'react';
import { mentorProfileAPI, MentorProfileData, profileAPI, getMediaUrl } from '../services/api';
import { Camera, Mail, MapPin, Save, LogOut, Loader2, X, Plus, Check, DollarSign, Clock, Globe } from 'lucide-react';

interface MentorProfileProps {
  onSignOut?: () => void;
}

const MentorProfile: React.FC<MentorProfileProps> = ({ onSignOut }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [showSpecialtyInput, setShowSpecialtyInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<MentorProfileData>({
    name: '',
    title: '',
    company: '',
    bio: '',
    specialties: [],
    rate: 0,
    is_available: true,
    session_duration: 45,
    timezone: 'America/New_York',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mentorProfileAPI.getProfile();
      setFormData({
        ...data,
        specialties: data.specialties || [],
      });
    } catch (err: any) {
      console.error('[MENTOR PROFILE] Error loading:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updateData: Partial<MentorProfileData> = {
        title: formData.title,
        company: formData.company,
        bio: formData.bio,
        specialties: formData.specialties,
        rate: formData.rate,
        is_available: formData.is_available,
        session_duration: formData.session_duration,
        timezone: formData.timezone,
      };
      
      const response = await mentorProfileAPI.updateProfile(updateData);
      setFormData(prev => ({ ...prev, ...response }));
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[MENTOR PROFILE] Error saving:', err);
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
      setFormData(prev => ({ ...prev, image_url: response.avatar_url }));
      setSuccess('Avatar updated!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[MENTOR PROFILE] Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecialty = () => {
    if (!newSpecialty.trim()) return;
    if (formData.specialties?.includes(newSpecialty.trim())) {
      setError('Specialty already exists');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      specialties: [...(prev.specialties || []), newSpecialty.trim()]
    }));
    setNewSpecialty('');
    setShowSpecialtyInput(false);
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter(s => s !== specialty)
    }));
  };

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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

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
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mentor Profile</h2>
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
                  {formData.image_url ? (
                    <img 
                      src={getMediaUrl(formData.image_url)} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    (formData.name || 'M').charAt(0).toUpperCase()
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name || 'Not set'}</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Title</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-lg text-slate-700 dark:text-slate-300">{formData.title || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Company</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.company || ''}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="e.g., Google, Meta, etc."
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-lg text-slate-700 dark:text-slate-300">{formData.company || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Bio</label>
                {isEditing ? (
                  <textarea 
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell mentees about yourself..."
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
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <DollarSign size={14} /> Hourly Rate
                  </label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.rate || 0}
                      onChange={(e) => setFormData({...formData, rate: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">${formData.rate}/hr</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Clock size={14} /> Session Duration
                  </label>
                  {isEditing ? (
                    <select 
                      value={formData.session_duration || 45}
                      onChange={(e) => setFormData({...formData, session_duration: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  ) : (
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{formData.session_duration} min</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Globe size={14} /> Timezone
                </label>
                {isEditing ? (
                  <select 
                    value={formData.timezone || 'America/New_York'}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                  </select>
                ) : (
                  <p className="text-lg text-slate-700 dark:text-slate-300">{formData.timezone || 'Not set'}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Available for new mentees</label>
                <button
                  onClick={() => isEditing && setFormData({...formData, is_available: !formData.is_available})}
                  className={`w-12 h-6 rounded-full transition-colors ${formData.is_available ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'} ${!isEditing && 'cursor-default'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.is_available ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">{formData.mentee_count || 0}</p>
                    <p className="text-xs text-slate-500">Active Mentees</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-2xl font-bold text-amber-500">{Number(formData.rating || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">{formData.total_reviews || 0} Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialties Section */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {(formData.specialties || []).map(specialty => (
                <span 
                  key={specialty} 
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800 flex items-center gap-1"
                >
                  {specialty}
                  {isEditing && (
                    <button 
                      onClick={() => handleRemoveSpecialty(specialty)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              
              {isEditing && (
                showSpecialtyInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
                      placeholder="Enter specialty"
                      className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-32"
                      autoFocus
                    />
                    <button onClick={handleAddSpecialty} className="p-1 text-green-600 hover:text-green-700">
                      <Check size={18} />
                    </button>
                    <button onClick={() => { setShowSpecialtyInput(false); setNewSpecialty(''); }} className="p-1 text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowSpecialtyInput(true)}
                    className="px-3 py-1 border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 rounded-full text-sm hover:border-indigo-500 hover:text-indigo-500 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Specialty
                  </button>
                )
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

export default MentorProfile;
