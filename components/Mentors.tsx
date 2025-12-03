import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, CheckCircle, UserPlus, X, UserCheck, ArrowRight, ThumbsUp, Loader2 } from 'lucide-react';
import { Mentor, MentorReview } from '../types';
import { mentorAPI, mapMentorToFrontend, mapReviewToFrontend, MentorData } from '../services/mentorService';

interface MentorsProps {
    isSignedUp?: boolean;
    onSignup?: () => void;
    onMentorConnect?: (mentor: Mentor) => void;
    connectedMentor?: Mentor | null;
    onCancelContract?: () => void;
    onViewMentor?: () => void;
    onPaymentRequired?: (mentor: Mentor) => void;
    onMentorConnected?: (mentor: Mentor) => void;
}

const Mentors: React.FC<MentorsProps> = ({ 
  isSignedUp = true, 
  onSignup, 
  connectedMentor, 
  onCancelContract, 
  onViewMentor, 
  onPaymentRequired,
  onMentorConnected 
}) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviewsMentor, setReviewsMentor] = useState<Mentor | null>(null);
  const [mentorReviews, setMentorReviews] = useState<Record<string, MentorReview[]>>({});
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');

  // Fetch mentors from backend
  useEffect(() => {
    if (isSignedUp) {
      fetchMentors();
    } else {
      setLoading(false);
    }
  }, [isSignedUp]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mentorAPI.getMentors();
      const mapped = data.map(mapMentorToFrontend);
      setMentors(mapped);
    } catch (err: any) {
      console.error('[MENTORS] Error fetching:', err);
      setError('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (mentorId: string) => {
    if (mentorReviews[mentorId]) return;
    try {
      setLoadingReviews(true);
      const reviews = await mentorAPI.getMentorReviews(Number(mentorId));
      const mapped = reviews.map(mapReviewToFrontend);
      setMentorReviews(prev => ({ ...prev, [mentorId]: mapped }));
    } catch (err) {
      console.error('[MENTORS] Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleConnectClick = (mentor: Mentor) => {
    if (!isSignedUp) {
      onSignup?.();
      return;
    }
    setSelectedMentor(mentor);
    setShowBookingModal(true);
  };

  const handleProceedToPayment = () => {
    if (selectedMentor && onPaymentRequired) {
      setShowBookingModal(false);
      onPaymentRequired(selectedMentor);
    }
  };

  const handleDirectConnect = async () => {
    if (!selectedMentor) return;
    try {
      setConnecting(true);
      await mentorAPI.connectMentor(Number(selectedMentor.id));
      setShowBookingModal(false);
      onMentorConnected?.(selectedMentor);
    } catch (err: any) {
      console.error('[MENTORS] Error connecting:', err);
      setError(err.message || 'Failed to connect with mentor');
    } finally {
      setConnecting(false);
    }
  };

  const handleViewReviews = async (mentor: Mentor) => {
    setReviewsMentor(mentor);
    setShowReviewsModal(true);
    await fetchReviews(mentor.id);
  };

  const getMentorReviews = (mentorId: string): MentorReview[] => {
    return mentorReviews[mentorId] || [];
  };

  const getAverageRating = (mentor: Mentor): number => {
    const reviews = getMentorReviews(mentor.id);
    if (reviews.length === 0) return mentor.rating || 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  };

  const formatReviewDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get unique specialties for filter
  const allSpecialties = [...new Set(mentors.flatMap(m => m.specialties))];
  
  // Filter mentors by specialty
  const filteredMentors = specialtyFilter === 'all' 
    ? mentors 
    : mentors.filter(m => m.specialties.includes(specialtyFilter));

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading mentors...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={18} /></button>
        </div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {connectedMentor ? 'Your Mentor' : 'Expert Mentors'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {connectedMentor 
              ? 'You are currently connected with a mentor. Cancel the contract to connect with someone else.'
              : 'Connect with industry leaders to accelerate your growth.'
            }
          </p>
        </div>
        {!connectedMentor && (
          <div className="flex gap-2">
            <select 
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-500"
            >
              <option value="all">All Specialties</option>
              {allSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Current Mentor Card */}
      {connectedMentor && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <UserCheck size={20} />
                  <span className="text-sm font-semibold">Active Mentorship</span>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <img 
                  src={connectedMentor.imageUrl} 
                  alt={connectedMentor.name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{connectedMentor.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400">{connectedMentor.role}</p>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{connectedMentor.company}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {connectedMentor.specialties.map(spec => (
                      <span key={spec} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-100 dark:border-slate-700">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={onViewMentor}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    Open Chat <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors text-sm"
                  >
                    Cancel Contract
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Contract Modal */}
      {showCancelModal && connectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
              <h3 className="font-bold text-red-900 dark:text-red-200">Cancel Mentorship</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src={connectedMentor.imageUrl} alt={connectedMentor.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{connectedMentor.name}</p>
                  <p className="text-sm text-slate-500">{connectedMentor.role}</p>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Warning:</strong> Canceling your mentorship will end all scheduled sessions.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Keep Mentor
                </button>
                <button onClick={() => { setShowCancelModal(false); onCancelContract?.(); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                  Cancel Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Grid */}
      {!connectedMentor && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor, index) => (
            <div key={mentor.id} className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${!isSignedUp && index > 1 ? 'blur-sm pointer-events-none' : ''}`}>
              <div className="flex items-start gap-4 mb-4">
                <img src={mentor.imageUrl} alt={mentor.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{mentor.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{mentor.role}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">{mentor.company}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {mentor.specialties.map(spec => (
                  <span key={spec} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded border border-slate-100 dark:border-slate-700">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between py-4 border-t border-b border-slate-50 dark:border-slate-800 mb-4">
                <button onClick={() => handleViewReviews(mentor)} className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{getAverageRating(mentor).toFixed(1)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 hover:underline">({getMentorReviews(mentor.id).length || (mentor as any).totalReviews || 0} reviews)</span>
                </button>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  ${mentor.rate}<span className="text-slate-400 dark:text-slate-500 font-normal">/hr</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => handleViewReviews(mentor)} className="flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                  <MessageCircle size={14} /> Reviews
                </button>
              </div>

              <button onClick={() => handleConnectClick(mentor)} className="w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <UserPlus size={18} /> Connect with Mentor
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sign up CTA */}
      {!isSignedUp && !connectedMentor && (
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Connect with Expert Mentors</h3>
          <p className="text-indigo-100 mb-6 max-w-xl mx-auto text-sm">
            Sign up to browse all mentors, view their full profiles, and start your mentorship journey.
          </p>
          <button onClick={onSignup} className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
            Sign Up Free
          </button>
        </div>
      )}

      {/* Connection Modal */}
      {showBookingModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-bold text-slate-900 dark:text-white">Connect with {selectedMentor.name.split(' ')[0]}</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img src={selectedMentor.imageUrl} alt={selectedMentor.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{selectedMentor.name}</h4>
                  <p className="text-sm text-slate-500">{selectedMentor.role}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">{selectedMentor.company}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6">
                <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">What you'll get:</h5>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Personalized roadmap with tasks</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> 1-on-1 chat & video sessions</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Task assignments & feedback</li>
                  <li className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Progress tracking & insights</li>
                </ul>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Mentorship Rate</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">${selectedMentor.rate}<span className="text-sm font-normal text-slate-400">/hr</span></span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Billed per session. Cancel anytime.</p>
              </div>
                      
              {onPaymentRequired ? (
                <button onClick={handleProceedToPayment} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                  Proceed to Payment <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={handleDirectConnect} disabled={connecting} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50">
                  {connecting ? <><Loader2 size={18} className="animate-spin" /> Connecting...</> : <>Connect Now <ArrowRight size={18} /></>}
                </button>
              )}
              <button onClick={() => setShowBookingModal(false)} className="w-full mt-3 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && reviewsMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-3">
                <Star size={20} className="text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Reviews for {reviewsMentor.name}</h3>
              </div>
              <button onClick={() => setShowReviewsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <img src={reviewsMentor.imageUrl} alt={reviewsMentor.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-100" />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{reviewsMentor.name}</h4>
                  <p className="text-sm text-slate-500">{reviewsMentor.role} at {reviewsMentor.company}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Star size={24} className="text-amber-400 fill-amber-400" />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{getAverageRating(reviewsMentor).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-slate-500">{getMentorReviews(reviewsMentor.id).length} reviews</p>
                </div>
              </div>

              {/* Rating Breakdown */}
              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Rating Breakdown</h5>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = getMentorReviews(reviewsMentor.id).filter(r => r.rating === stars).length;
                    const total = getMentorReviews(reviewsMentor.id).length;
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-12">{stars} stars</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {loadingReviews ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                    <span className="ml-2 text-slate-500">Loading reviews...</span>
                  </div>
                ) : getMentorReviews(reviewsMentor.id).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500">No reviews yet</p>
                  </div>
                ) : (
                  getMentorReviews(reviewsMentor.id).map(review => (
                    <div key={review.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full ${typeof review.reviewerAvatar === 'string' && review.reviewerAvatar.startsWith('bg-') ? review.reviewerAvatar : 'bg-indigo-500'} flex items-center justify-center text-white font-bold text-sm`}>
                          {review.reviewerName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-slate-900 dark:text-white">{review.reviewerName}</h5>
                            <span className="text-xs text-slate-400">{formatReviewDate(review.date)}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={14} className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          <ThumbsUp size={12} /> Helpful ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button 
                onClick={() => { setShowReviewsModal(false); handleConnectClick(reviewsMentor); }}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={18} /> Connect with {reviewsMentor.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors;
