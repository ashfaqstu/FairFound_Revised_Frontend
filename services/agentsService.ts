/**
 * Agents Service - Handles profile analysis using the backend agents API
 * Converts backend response to frontend AnalysisData format
 */

import { agentsAPI, QuickAnalyzeResponse, AnalysisResult, isAuthenticated, authAPI } from './api';
import { AnalysisData, FreelancerProfile } from '../types';

/**
 * Save profile to backend after onboarding
 */
export async function saveProfileToBackend(profile: FreelancerProfile): Promise<void> {
  if (!isAuthenticated()) {
    console.log('[AGENTS] Not authenticated, skipping profile save');
    return;
  }
  
  try {
    console.log('[AGENTS] Saving profile to backend...');
    await authAPI.updateProfile({
      title: profile.title,
      bio: profile.bio,
      skills: profile.skills,
      experience_years: profile.experienceYears,
      hourly_rate: profile.hourlyRate,
      github_username: profile.githubUsername,
      portfolio_url: profile.portfolioUrl,
      location: profile.location,
    });
    console.log('[AGENTS] ✅ Profile saved to backend');
  } catch (error) {
    console.error('[AGENTS] ❌ Failed to save profile:', error);
  }
}

/**
 * Analyze profile using the agents API
 * Falls back to quick-analyze if not authenticated
 */
export async function analyzeProfileWithAgents(profile: FreelancerProfile): Promise<AnalysisData> {
  console.log('[AGENTS] Starting profile analysis...');
  console.log('[AGENTS] Profile:', { name: profile.name, skills: profile.skills, experience: profile.experienceYears });
  console.log('[AGENTS] Authenticated:', isAuthenticated());
  
  try {
    if (isAuthenticated()) {
      console.log('[AGENTS] Using synchronous analysis (authenticated user)');
      
      // Save profile to backend first
      await saveProfileToBackend(profile);
      
      // Submit onboarding - now returns results synchronously
      console.log('[AGENTS] Submitting onboarding data...');
      const result = await agentsAPI.submitOnboarding({
        name: profile.name,
        email: profile.email || `${profile.name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        skills: profile.skills,
        experience_years: profile.experienceYears,
        hourly_rate: profile.hourlyRate,
        github_username: profile.githubUsername,
        portfolio_url: profile.portfolioUrl,
        title: profile.title,
        bio: profile.bio,
        location: profile.location,
      });
      
      console.log('[AGENTS] ✅ Analysis complete:', result.overall_score);
      
      // Convert the synchronous response to AnalysisData format
      return convertOnboardingResultToAnalysisData(result, profile);
    } else {
      // Use quick analysis for non-authenticated users
      console.log('[AGENTS] Using quick analysis (unauthenticated user)');
      const result = await agentsAPI.quickAnalyze({
        skills: profile.skills,
        experience_years: profile.experienceYears,
        github_username: profile.githubUsername,
      });
      console.log('[AGENTS] ✅ Quick analysis complete:', result.overall_score);
      return convertQuickAnalysisToAnalysisData(result, profile);
    }
  } catch (error) {
    console.error('[AGENTS] ❌ Analysis failed:', error);
    console.log('[AGENTS] Falling back to local analysis');
    // Return mock data as fallback
    return generateFallbackAnalysis(profile);
  }
}

/**
 * Poll for job completion
 */
async function pollForResults(jobId: number, maxAttempts = 30): Promise<AnalysisResult> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const job = await agentsAPI.getJob(jobId);
    
    if (job.status === 'done' || job.status === 'review') {
      const analysis = await agentsAPI.getAnalysis(jobId);
      return analysis;
    }
    
    if (job.status === 'error') {
      throw new Error(job.error_message || 'Analysis failed');
    }
  }
  
  throw new Error('Analysis timed out');
}

/**
 * Convert synchronous onboarding result to frontend AnalysisData format
 */
function convertOnboardingResultToAnalysisData(result: any, profile: FreelancerProfile): AnalysisData {
  const breakdown = result.breakdown || {};
  const benchmark = result.benchmark || {};
  const evaluation = result.evaluation || {};
  const improvements = result.improvements || [];

  return {
    globalReadinessScore: Math.round((result.overall_score || 0.5) * 100),
    marketPercentile: result.percentile || benchmark.user_percentile || 50,
    projectedEarnings: calculateProjectedEarnings(benchmark.market_insights?.rate_suggestion?.suggested_rate || 35),
    strengths: evaluation.strengths || [
      `${result.tier || 'Developing'} tier developer`,
      'Taking initiative to assess skills'
    ],
    weaknesses: evaluation.areas_for_improvement || improvements.slice(0, 3).map((imp: any) => imp.action),
    opportunities: [
      `High demand for ${(benchmark.in_demand_skills || ['React', 'TypeScript']).slice(0, 2).join(' and ')}`,
      'Growing freelance market for frontend developers',
      evaluation.market_position?.market_outlook || 'Strong market demand'
    ],
    threats: [
      'Increasing competition from global talent',
      'Rapid technology changes require continuous learning'
    ],
    skillGaps: benchmark.market_insights?.skill_gaps || ['typescript', 'testing'],
    pricingSuggestion: {
      current: profile.hourlyRate,
      recommended: benchmark.market_insights?.rate_suggestion?.suggested_rate || 35,
      reasoning: `Based on your ${result.tier || 'Developing'} tier and ${result.percentile || 50}th percentile position.`
    },
    metrics: {
      portfolioScore: Math.round((breakdown.portfolio_quality?.raw_score || 0.3) * 100),
      githubScore: Math.round((breakdown.github_activity?.raw_score || 0.3) * 100),
      communicationScore: 70,
      techStackScore: Math.round((breakdown.skill_strength?.raw_score || 0.5) * 100)
    }
  };
}

/**
 * Convert full analysis result to frontend AnalysisData format
 */
function convertToAnalysisData(result: AnalysisResult, profile: FreelancerProfile): AnalysisData {
  const breakdown = result.breakdown;
  const benchmark = result.benchmark;
  const evaluation = result.evaluation;

  return {
    globalReadinessScore: Math.round(result.overall_score * 100),
    marketPercentile: benchmark.user_percentile,
    projectedEarnings: calculateProjectedEarnings(benchmark.market_insights.rate_suggestion.suggested_rate),
    strengths: evaluation.strengths || [],
    weaknesses: evaluation.areas_for_improvement || [],
    opportunities: [
      `High demand for ${benchmark.in_demand_skills.slice(0, 2).join(' and ')}`,
      'Growing freelance market in your niche',
      evaluation.market_position.market_outlook
    ],
    threats: [
      'Increasing competition from global talent',
      'Rapid technology changes require continuous learning'
    ],
    skillGaps: benchmark.market_insights.skill_gaps || [],
    pricingSuggestion: {
      current: profile.hourlyRate,
      recommended: benchmark.market_insights.rate_suggestion.suggested_rate,
      reasoning: `Based on your ${result.tier} tier ranking and ${benchmark.user_percentile}th percentile position, we recommend ${benchmark.market_insights.rate_suggestion.range} pricing.`
    },
    metrics: {
      portfolioScore: Math.round((breakdown.portfolio_quality?.raw_score || 0.5) * 100),
      githubScore: Math.round((breakdown.github_activity?.raw_score || 0.5) * 100),
      communicationScore: 75, // Default since we don't measure this yet
      techStackScore: Math.round((breakdown.skill_strength?.raw_score || 0.5) * 100)
    }
  };
}

/**
 * Convert quick analysis to frontend AnalysisData format
 */
function convertQuickAnalysisToAnalysisData(result: QuickAnalyzeResponse, profile: FreelancerProfile): AnalysisData {
  const breakdown = result.breakdown;
  const benchmark = result.benchmark;

  return {
    globalReadinessScore: Math.round(result.overall_score * 100),
    marketPercentile: result.percentile,
    projectedEarnings: calculateProjectedEarnings(benchmark.market_insights.rate_suggestion.suggested_rate),
    strengths: [
      `${result.tier} tier junior frontend developer`,
      `Top ${100 - result.percentile}% in your category`,
      'Taking initiative to assess and improve skills'
    ],
    weaknesses: result.improvements.slice(0, 3).map(imp => imp.action),
    opportunities: [
      `High demand for ${benchmark.in_demand_skills.slice(0, 2).join(' and ')}`,
      'Growing freelance market for frontend developers'
    ],
    threats: [
      'Increasing competition from global talent',
      'Rapid technology changes require continuous learning'
    ],
    skillGaps: benchmark.market_insights.skill_gaps || [],
    pricingSuggestion: {
      current: profile.hourlyRate,
      recommended: benchmark.market_insights.rate_suggestion.suggested_rate,
      reasoning: `Based on your ${result.tier} tier and ${result.percentile}th percentile, ${benchmark.market_insights.rate_suggestion.range} pricing is recommended.`
    },
    metrics: {
      portfolioScore: Math.round((breakdown.portfolio_quality?.raw_score || 0.3) * 100),
      githubScore: Math.round((breakdown.github_activity?.raw_score || 0.3) * 100),
      communicationScore: 70,
      techStackScore: Math.round((breakdown.skill_strength?.raw_score || 0.5) * 100)
    }
  };
}

/**
 * Calculate projected monthly earnings
 */
function calculateProjectedEarnings(hourlyRate: number): number {
  // Assume 25 billable hours per week, 4 weeks per month
  return Math.round(hourlyRate * 25 * 4);
}

/**
 * Generate fallback analysis when API fails
 */
function generateFallbackAnalysis(profile: FreelancerProfile): AnalysisData {
  const skillCount = profile.skills.length;
  const hasGithub = !!profile.githubUsername;
  const hasPortfolio = !!profile.portfolioUrl;
  
  // Simple scoring based on profile completeness
  let score = 40;
  if (skillCount >= 5) score += 15;
  else if (skillCount >= 3) score += 10;
  if (hasGithub) score += 15;
  if (hasPortfolio) score += 10;
  if (profile.experienceYears >= 1) score += 10;
  if (profile.experienceYears >= 2) score += 10;

  return {
    globalReadinessScore: Math.min(score, 85),
    marketPercentile: Math.min(score, 80),
    projectedEarnings: profile.hourlyRate * 100,
    strengths: [
      'Taking initiative to assess skills',
      skillCount >= 3 ? 'Good skill foundation' : 'Building skill set',
      hasGithub ? 'Active GitHub presence' : 'Opportunity to showcase code'
    ],
    weaknesses: [
      !hasGithub ? 'Set up GitHub profile to showcase projects' : '',
      !hasPortfolio ? 'Create a portfolio website' : '',
      skillCount < 5 ? 'Expand technical skill set' : ''
    ].filter(Boolean),
    opportunities: [
      'High demand for React and TypeScript skills',
      'Growing freelance market'
    ],
    threats: [
      'Competitive market requires continuous improvement'
    ],
    skillGaps: ['typescript', 'testing', 'next.js'].filter(s => !profile.skills.map(sk => sk.toLowerCase()).includes(s)),
    pricingSuggestion: {
      current: profile.hourlyRate,
      recommended: Math.round(profile.hourlyRate * 1.1) || 35,
      reasoning: 'Based on your profile, market rate pricing is recommended.'
    },
    metrics: {
      portfolioScore: hasPortfolio ? 60 : 30,
      githubScore: hasGithub ? 60 : 20,
      communicationScore: 70,
      techStackScore: Math.min(skillCount * 15, 80)
    }
  };
}

/**
 * Get benchmark data for display
 */
export async function getBenchmarkData() {
  try {
    return await agentsAPI.getBenchmarks();
  } catch (error) {
    console.error('Failed to fetch benchmarks:', error);
    return null;
  }
}
