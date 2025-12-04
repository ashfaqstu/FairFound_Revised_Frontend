import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Edit3,
  AlertTriangle,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronUp,
  Brain,
  User,
  RefreshCw,
} from 'lucide-react';

interface AIEvaluation {
  confidence: number;
  evaluation_type: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  market_position: {
    rate_position: string;
    suggested_hourly_rate: number;
    market_outlook: string;
  };
  tier_assessment: {
    tier: string;
    percentile: number;
    interpretation: string;
  };
  self_assessment?: {
    confidence: number;
    reasoning: string;
    data_quality: string;
  };
  evaluation_metadata?: {
    iterations: number;
    final_confidence: number;
    threshold_met: boolean;
  };
}

interface ReviewData {
  job_id: number;
  created_at: string;
  ai_evaluation: AIEvaluation;
  scores: {
    overall: number;
    tier: string;
    breakdown: Record<string, any>;
  };
  benchmark: {
    percentile: number;
    avg_rate: number;
  };
  input_data: Record<string, any>;
  existing_review: {
    decision: string;
    human_confidence: number;
    accuracy_rating: number;
    relevance_rating: number;
    actionability_rating: number;
    review_notes: string;
  } | null;
}

interface HumanReviewProps {
  jobId?: number;
  onClose?: () => void;
  onReviewSubmitted?: () => void;
}

const HumanReview: React.FC<HumanReviewProps> = ({ jobId, onClose, onReviewSubmitted }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(jobId || null);
  const [expandedSections, setExpandedSections] = useState<string[]>(['ai-evaluation', 'human-review']);
  
  // Review form state
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'modified'>('approved');
  const [humanConfidence, setHumanConfidence] = useState(0.8);
  const [accuracyRating, setAccuracyRating] = useState(4);
  const [relevanceRating, setRelevanceRating] = useState(4);
  const [actionabilityRating, setActionabilityRating] = useState(4);
  const [reviewNotes, setReviewNotes] = useState('');
  const [disagreementReasons, setDisagreementReasons] = useState<string[]>([]);
  
  // Modified values (only used when decision is 'modified')
  const [modifiedStrengths, setModifiedStrengths] = useState<string[]>([]);
  const [modifiedWeaknesses, setModifiedWeaknesses] = useState<string[]>([]);
  const [modifiedRecommendations, setModifiedRecommendations] = useState<string[]>([]);

  const API_BASE_URL = import.meta.env?.VITE_API_URL || 'https://fairfound-backend.onrender.com/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    loadPendingReviews();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadReviewData(selectedJobId);
    }
  }, [selectedJobId]);

  const loadPendingReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/human-review/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data.pending_reviews || []);
        if (!selectedJobId && data.pending_reviews?.length > 0) {
          setSelectedJobId(data.pending_reviews[0].job_id);
        }
      }
    } catch (err) {
      console.error('[HUMAN REVIEW] Error loading pending reviews:', err);
    }
  };

  const loadReviewData = async (jobId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/agents/human-review/${jobId}/`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setReviewData(data);
        
        // Pre-fill form if existing review
        if (data.existing_review) {
          setDecision(data.existing_review.decision);
          setHumanConfidence(data.existing_review.human_confidence || 0.8);
          setAccuracyRating(data.existing_review.accuracy_rating || 4);
          setRelevanceRating(data.existing_review.relevance_rating || 4);
          setActionabilityRating(data.existing_review.actionability_rating || 4);
          setReviewNotes(data.existing_review.review_notes || '');
        } else {
          // Pre-fill with AI values for modification
          setModifiedStrengths(data.ai_evaluation?.strengths || []);
          setModifiedWeaknesses(data.ai_evaluation?.weaknesses || []);
          setModifiedRecommendations(data.ai_evaluation?.recommendations || []);
        }
      }
    } catch (err) {
      console.error('[HUMAN REVIEW] Error loading review data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (!selectedJobId) return;
    
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/agents/human-review/${selectedJobId}/submit/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          decision,
          human_confidence: humanConfidence,
          accuracy_rating: accuracyRating,
          relevance_rating: relevanceRating,
          actionability_rating: actionabilityRating,
          review_notes: reviewNotes,
          disagreement_reasons: disagreementReasons,
          ...(decision === 'modified' && {
            modified_strengths: modifiedStrengths,
            modified_weaknesses: modifiedWeaknesses,
            modified_recommendations: modifiedRecommendations,
          }),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[HUMAN REVIEW] ✅ Review submitted:', data);
        setSubmitSuccess(true);
        onReviewSubmitted?.();
        loadPendingReviews();
        
        // Reset form after successful submission
        setReviewNotes('');
        setDisagreementReasons([]);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.detail || 'Failed to submit review';
        console.error('[HUMAN REVIEW] ❌ Submit failed:', errorMessage);
        setSubmitError(errorMessage);
      }
    } catch (err) {
      console.error('[HUMAN REVIEW] ❌ Error submitting review:', err);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const renderStarRating = (value: number, onChange: (v: number) => void, label: string) => (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 dark:text-slate-400 w-32">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={20}
              className={star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-slate-500">{value}/5</span>
    </div>
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600 dark:text-emerald-400';
    if (confidence >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading && !reviewData) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Loading review data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Brain size={24} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Human-in-the-Loop Review</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review and validate AI agent evaluations</p>
          </div>
        </div>
      </div>

      {/* Pending Reviews Selector */}
      {pendingReviews.length > 0 && (
        <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Evaluation to Review</h3>
          <div className="flex flex-wrap gap-2">
            {pendingReviews.map(review => (
              <button
                key={review.job_id}
                onClick={() => setSelectedJobId(review.job_id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedJobId === review.job_id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Job #{review.job_id}</span>
                  {review.needs_review && (
                    <AlertTriangle size={14} className="text-amber-500" />
                  )}
                  <span className={`text-xs ${getConfidenceColor(review.ai_confidence)}`}>
                    {(review.ai_confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {reviewData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - AI Evaluation */}
          <div className="space-y-4">
            {/* AI Evaluation Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('ai-evaluation')}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">AI Evaluation</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    reviewData.ai_evaluation.confidence >= 0.8
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  }`}>
                    {(reviewData.ai_evaluation.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
                {expandedSections.includes('ai-evaluation') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {expandedSections.includes('ai-evaluation') && (
                <div className="p-4 space-y-4">
                  {/* Metadata */}
                  {reviewData.ai_evaluation.evaluation_metadata && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
                      <div className="flex flex-wrap gap-4">
                        <span>Iterations: {reviewData.ai_evaluation.evaluation_metadata.iterations}</span>
                        <span>Type: {reviewData.ai_evaluation.evaluation_type}</span>
                        <span className={reviewData.ai_evaluation.evaluation_metadata.threshold_met ? 'text-emerald-600' : 'text-amber-600'}>
                          Threshold: {reviewData.ai_evaluation.evaluation_metadata.threshold_met ? '✓ Met' : '✗ Not Met'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Summary</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{reviewData.ai_evaluation.summary}</p>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {reviewData.ai_evaluation.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ThumbsUp size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {reviewData.ai_evaluation.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {reviewData.ai_evaluation.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-indigo-500 font-medium">{i + 1}.</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Scores */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Scores</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Overall: <span className="font-semibold">{(reviewData.scores.overall * 100).toFixed(1)}%</span></div>
                      <div>Tier: <span className="font-semibold">{reviewData.scores.tier}</span></div>
                      <div>Percentile: <span className="font-semibold">{reviewData.benchmark.percentile}th</span></div>
                      <div>Rate: <span className="font-semibold">${reviewData.ai_evaluation.market_position.suggested_hourly_rate}/hr</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Human Review Form */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleSection('human-review')}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <User size={18} className="text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">Your Review</span>
                </div>
                {expandedSections.includes('human-review') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {expandedSections.includes('human-review') && (
                <div className="p-4 space-y-5">
                  {/* Decision */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Decision</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDecision('approved')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          decision === 'approved'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => setDecision('modified')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          decision === 'modified'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                        }`}
                      >
                        <Edit3 size={18} />
                        Modify
                      </button>
                      <button
                        onClick={() => setDecision('rejected')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          decision === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Confidence Slider */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Your Confidence in AI Evaluation
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={humanConfidence}
                        onChange={(e) => setHumanConfidence(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className={`text-lg font-bold ${getConfidenceColor(humanConfidence)}`}>
                        {(humanConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rate the AI Evaluation</label>
                    {renderStarRating(accuracyRating, setAccuracyRating, 'Accuracy')}
                    {renderStarRating(relevanceRating, setRelevanceRating, 'Relevance')}
                    {renderStarRating(actionabilityRating, setActionabilityRating, 'Actionability')}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any notes about this evaluation..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {/* Success/Error Messages */}
                  {submitSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2">
                      <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                        Review submitted successfully!
                      </span>
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                      <XCircle size={18} className="text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                        {submitError}
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || submitSuccess}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle size={18} />
                        Submitted!
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!reviewData && !loading && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <BarChart3 size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Evaluations to Review</h3>
          <p className="text-slate-500 dark:text-slate-400">Complete a profile analysis first to review AI evaluations.</p>
        </div>
      )}
    </div>
  );
};

export default HumanReview;
