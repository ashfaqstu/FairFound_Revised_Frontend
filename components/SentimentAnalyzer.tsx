import React, { useState } from 'react';
import { analyzeSentiment, SentimentResult } from '../services/geminiService';
import { 
  MessageSquare, Sparkles, Loader2, Download, Plus, X, 
  ThumbsUp, ThumbsDown, Minus, TrendingUp, AlertCircle,
  CheckCircle, Lock, Trash2
} from 'lucide-react';

interface SentimentAnalyzerProps {
  isSignedUp?: boolean;
  onSignup?: () => void;
}

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({ isSignedUp = true, onSignup }) => {
  const [reviews, setReviews] = useState<string[]>([]);
  const [newReview, setNewReview] = useState('');
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const handleAddReview = () => {
    if (newReview.trim()) {
      setReviews([...reviews, newReview.trim()]);
      setNewReview('');
      setAnalyzed(false);
    }
  };

  const handleRemoveReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index));
    setAnalyzed(false);
  };

  const handleAnalyze = async () => {
    if (reviews.length === 0) return;
    setLoading(true);
    try {
      const sentimentResults = await analyzeSentiment(reviews);
      setResults(sentimentResults);
      setAnalyzed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;
    
    const headers = ['Review Text', 'Sentiment', 'Confidence', 'Keywords', 'Actionable Steps'];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        `"${r.text.replace(/"/g, '""')}"`,
        r.sentiment,
        (r.confidence * 100).toFixed(1) + '%',
        `"${r.keywords.join('; ')}"`,
        `"${r.actionableSteps.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sentiment_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp size={18} className="text-emerald-500" />;
      case 'negative': return <ThumbsDown size={18} className="text-red-500" />;
      default: return <Minus size={18} className="text-amber-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400';
      case 'negative': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
      default: return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400';
    }
  };

  const getSummary = () => {
    if (results.length === 0) return null;
    const positive = results.filter(r => r.sentiment === 'positive').length;
    const negative = results.filter(r => r.sentiment === 'negative').length;
    const neutral = results.filter(r => r.sentiment === 'neutral').length;
    return { positive, negative, neutral, total: results.length };
  };

  const summary = getSummary();

  // Locked overlay for non-signed-up users
  const LockedOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analyze Client Feedback</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
          Sign up to use AI-powered sentiment analysis on your client reviews.
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sentiment Analyzer</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Paste client reviews to analyze sentiment and get actionable improvement suggestions.
          </p>
        </div>

        {/* Add Review Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Add Client Review</label>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Paste a client review here..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none text-sm"
          />
          <button
            onClick={handleAddReview}
            disabled={!newReview.trim()}
            className="w-full mt-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} /> Add Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Reviews to Analyze ({reviews.length})
            </label>
            {reviews.length > 0 && (
              <button 
                onClick={() => { setReviews([]); setResults([]); setAnalyzed(false); }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Clear All
              </button>
            )}
          </div>
          
          {reviews.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <MessageSquare size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">No reviews added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reviews.map((review, index) => (
                <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{review}</p>
                    <button 
                      onClick={() => handleRemoveReview(index)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading || reviews.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:shadow-none"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>

        {/* Export Button */}
        {analyzed && results.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Download size={18} /> Export as CSV
          </button>
        )}
      </div>

      {/* Results Area */}
      <div className={`flex-1 bg-slate-50 dark:bg-slate-950 p-8 overflow-y-auto transition-colors ${!isSignedUp ? 'blur-sm pointer-events-none' : ''}`}>
        {analyzed && results.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.total}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Positive</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{summary.positive}</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Neutral</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{summary.neutral}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-1">Negative</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.negative}</p>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={result.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {/* Header */}
                  <div className={`px-5 py-3 border-b ${getSentimentColor(result.sentiment)} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      {getSentimentIcon(result.sentiment)}
                      <span className="font-semibold capitalize">{result.sentiment}</span>
                    </div>
                    <span className="text-sm opacity-75">
                      {(result.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5">
                    <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">"{result.text}"</p>
                    
                    {/* Keywords */}
                    {result.keywords.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Key Phrases</p>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actionable Steps */}
                    {result.actionableSteps.length > 0 && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1">
                          <TrendingUp size={14} /> Actionable Steps
                        </p>
                        <ul className="space-y-1">
                          {result.actionableSteps.map((step, i) => (
                            <li key={i} className="text-sm text-indigo-600 dark:text-indigo-400 flex items-start gap-2">
                              <CheckCircle size={14} className="mt-0.5 shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
            <MessageSquare size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-lg mb-2">Add reviews and click "Analyze Sentiment"</p>
            <p className="text-sm">Get AI-powered insights and actionable improvement steps</p>
          </div>
        )}
      </div>

      {/* Locked overlay for non-signed-up users */}
      {!isSignedUp && <LockedOverlay />}
    </div>
  );
};

export default SentimentAnalyzer;
