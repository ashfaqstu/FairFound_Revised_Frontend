
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Mentor } from '../types';

interface CheckoutProps {
  onComplete: () => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onComplete, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [pendingMentor, setPendingMentor] = useState<Mentor | null>(null);

  // Load pending mentor from localStorage
  useEffect(() => {
    const pendingMentorStr = localStorage.getItem('pending_mentor');
    if (pendingMentorStr) {
      try {
        const mentor = JSON.parse(pendingMentorStr) as Mentor;
        setPendingMentor(mentor);
      } catch {
        console.log('[CHECKOUT] Could not parse pending mentor');
      }
    }
  }, []);

  const mentorRate = pendingMentor?.rate || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setStep(2);
      // Auto redirect after success
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 2000);
  };

  if (step === 2) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Welcome to FairFound Pro. Unlocking your features...</p>
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6">
        ← Cancel and go back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl h-fit border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h3>
          
          {/* Mentor Info */}
          {pendingMentor && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <img 
                src={pendingMentor.imageUrl} 
                alt={pendingMentor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{pendingMentor.name}</p>
                <p className="text-xs text-slate-500 truncate">{pendingMentor.role}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Mentor Contract</p>
              <p className="text-xs text-slate-500">Hourly Rate</p>
            </div>
            <p className="font-bold text-slate-900 dark:text-white">${mentorRate.toFixed(2)}/hr</p>
          </div>
          <div className="flex justify-between items-center text-lg font-bold text-slate-900 dark:text-white">
            <span>First Payment</span>
            <span>${mentorRate.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">You'll be charged per session with your mentor</p>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Secure 256-bit SSL Encryption</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Lock size={24} className="text-indigo-600 dark:text-indigo-400" />
              Secure Checkout
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cardholder Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe" 
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder="0000 0000 0000 0000" 
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                  <input 
                    type="text" 
                    required
                    placeholder="MM / YY" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">CVC</label>
                  <input 
                    type="text" 
                    required
                    placeholder="123" 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader2 className="animate-spin" /> : `Pay $${mentorRate.toFixed(2)}`}
              </button>
              
              <p className="text-center text-xs text-slate-400">
                By clicking pay, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
