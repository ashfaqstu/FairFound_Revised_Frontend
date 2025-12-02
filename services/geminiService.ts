
import { GoogleGenAI, Type } from "@google/genai";
import { FreelancerProfile, AnalysisData, RoadmapStep, PortfolioContent, Task } from "../types";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeProfileWithGemini = async (profile: FreelancerProfile): Promise<AnalysisData> => {
  if (!API_KEY) {
    // Fallback mock data if no key is present in dev environment
    console.warn("No API Key found, returning mock analysis.");
    return {
      globalReadinessScore: 78,
      marketPercentile: 65,
      projectedEarnings: 85000,
      strengths: ["Strong React fundamentals", "Good communication style"],
      weaknesses: ["Lack of backend knowledge", "Portfolio is generic"],
      opportunities: ["High demand for Fullstack", "SaaS niche"],
      threats: ["AI code generation saturation"],
      skillGaps: ["Next.js", "PostgreSQL", "System Design"],
      pricingSuggestion: {
        current: profile.hourlyRate,
        recommended: profile.hourlyRate * 1.25,
        reasoning: "Your skill set is in high demand, but your packaging needs work."
      },
      metrics: {
        portfolioScore: 60,
        githubScore: 75,
        communicationScore: 85,
        techStackScore: 80
      }
    };
  }

  try {
    const prompt = `
      Analyze this freelancer profile for the current global market.
      Profile: ${JSON.stringify(profile)}
      
      Provide a detailed SWOT analysis, scoring, and pricing recommendations.
      Be critical but constructive.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            globalReadinessScore: { type: Type.NUMBER },
            marketPercentile: { type: Type.NUMBER },
            projectedEarnings: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            pricingSuggestion: {
              type: Type.OBJECT,
              properties: {
                current: { type: Type.NUMBER },
                recommended: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              }
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                portfolioScore: { type: Type.NUMBER },
                githubScore: { type: Type.NUMBER },
                communicationScore: { type: Type.NUMBER },
                techStackScore: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisData;
    }
    throw new Error("No text response from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const generateRoadmapWithGemini = async (profile: FreelancerProfile, gaps: string[]): Promise<RoadmapStep[]> => {
  if (!API_KEY) {
    return [];
  }

  try {
    const prompt = `
      Create a step-by-step 4-week roadmap for this freelancer to improve their market standing.
      Focus on filling these gaps: ${gaps.join(', ')}.
      Profile: ${JSON.stringify(profile)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
              status: { type: Type.STRING, enum: ['pending'] },
              type: { type: Type.STRING, enum: ['skill', 'project', 'branding'] }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as RoadmapStep[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Roadmap Failed:", error);
    return [];
  }
};

export const generateProposalWithGemini = async (profile: FreelancerProfile, jobDescription: string, tone: string, clientName: string): Promise<string> => {
  if (!API_KEY) {
    return `Dear ${clientName || 'Hiring Manager'},\n\nThis is a mock proposal because no API key was provided. I am writing to express my interest in your project.\n\nBest,\n${profile.name}`;
  }

  try {
    const prompt = `
      Write a compelling freelance proposal/cover letter for this job.
      
      My Profile: ${JSON.stringify(profile)}
      Client Name: ${clientName || "Hiring Manager"}
      
      Job Description:
      ${jobDescription}
      
      Tone: ${tone}
      
      Rules:
      1. Be concise.
      2. Highlight relevant skills from my profile.
      3. Propose a next step.
      4. Do not use placeholders like [Your Name], fill them with profile data.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate proposal.";
  } catch (error) {
    console.error("Gemini Proposal Failed:", error);
    return "Error generating proposal. Please try again.";
  }
};

export const enhancePortfolioWithGemini = async (profile: FreelancerProfile): Promise<PortfolioContent> => {
    if (!API_KEY) {
        return {
            tagline: "Building digital experiences that matter.",
            about: "I am a passionate developer focusing on creating intuitive and performant web applications.",
            projects: [
                { title: "E-commerce Dashboard", description: "A high-performance analytics dashboard using React and D3.", tags: ["React", "D3", "Node"] },
                { title: "Social API", description: "Scalable backend architecture for a social network.", tags: ["PostgreSQL", "Redis", "Go"] }
            ]
        };
    }

    try {
        const prompt = `
          Generate content for a professional portfolio website for this freelancer.
          Create a catchy tagline, a professional 'about' section (SEO optimized), and 3 sample projects that would fit their skill set if they don't have detailed ones, or enhance their existing skills into project descriptions.
          
          Profile: ${JSON.stringify(profile)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tagline: { type: Type.STRING },
                        about: { type: Type.STRING },
                        projects: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    tags: { type: Type.ARRAY, items: { type: Type.STRING }}
                                }
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as PortfolioContent;
        }
        throw new Error("No response");
    } catch (error) {
        console.error("Gemini Portfolio Failed:", error);
        throw error;
    }
};

// Mentor Co-Pilot Features

export const generateRoadmapStepForMentee = async (menteeName: string, menteeTitle: string, existingSteps: string[]): Promise<RoadmapStep> => {
    if (!API_KEY) {
        // Mock roadmap step
        const mockSteps = [
            { id: `step-${Date.now()}`, title: 'Master Advanced React Patterns', description: 'Learn compound components, render props, and custom hooks patterns', duration: '2 weeks', status: 'pending' as const, type: 'skill' as const },
            { id: `step-${Date.now()}`, title: 'Build a Full-Stack Project', description: 'Create a complete application with authentication, database, and deployment', duration: '3 weeks', status: 'pending' as const, type: 'project' as const },
            { id: `step-${Date.now()}`, title: 'Optimize Personal Brand', description: 'Update LinkedIn, create content strategy, and build online presence', duration: '1 week', status: 'pending' as const, type: 'branding' as const },
            { id: `step-${Date.now()}`, title: 'Learn Testing Best Practices', description: 'Master unit testing, integration testing, and E2E testing with Jest and Cypress', duration: '2 weeks', status: 'pending' as const, type: 'skill' as const },
        ];
        return mockSteps[Math.floor(Math.random() * mockSteps.length)];
    }

    try {
        const prompt = `
          Generate a single roadmap step for a mentee.
          Mentee: ${menteeName}
          Role: ${menteeTitle}
          Existing steps: ${existingSteps.join(', ') || 'None yet'}
          
          Create a new step that builds on their journey. Make it specific and actionable.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['pending'] },
                        type: { type: Type.STRING, enum: ['skill', 'project', 'branding'] }
                    }
                }
            }
        });

        if (response.text) {
            const step = JSON.parse(response.text) as RoadmapStep;
            step.id = `step-${Date.now()}`;
            return step;
        }
        throw new Error("No response");
    } catch (error) {
        console.error("Gemini Step Gen Failed:", error);
        return { id: `step-${Date.now()}`, title: 'New Learning Step', description: 'AI-generated step', duration: '1 week', status: 'pending', type: 'skill' };
    }
}

export const generateSingleTaskForMentee = async (menteeName: string, menteeTitle: string, roadmapStepTitle: string): Promise<Task> => {
    if (!API_KEY) {
        // Mock single task
        const mockTasks = [
            { id: `task-${Date.now()}`, title: `Practice ${roadmapStepTitle} concepts`, description: 'Complete hands-on exercises to reinforce learning', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' as const },
            { id: `task-${Date.now()}`, title: `Build a mini-project for ${roadmapStepTitle}`, description: 'Create a small project demonstrating the learned skills', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' as const },
            { id: `task-${Date.now()}`, title: `Review and document ${roadmapStepTitle}`, description: 'Write notes and create a reference guide for future use', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' as const },
        ];
        return mockTasks[Math.floor(Math.random() * mockTasks.length)];
    }

    try {
        const prompt = `
          Generate a single actionable task for a mentee.
          Mentee: ${menteeName}
          Role: ${menteeTitle}
          Related to roadmap step: ${roadmapStepTitle}
          
          Create a specific, measurable task that helps them progress. Include a realistic due date within the next 2 weeks.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        dueDate: { type: Type.STRING },
                        status: { type: Type.STRING, enum: ['pending'] }
                    }
                }
            }
        });

        if (response.text) {
            const task = JSON.parse(response.text) as Task;
            task.id = `task-${Date.now()}`;
            return task;
        }
        throw new Error("No response");
    } catch (error) {
        console.error("Gemini Single Task Gen Failed:", error);
        return { id: `task-${Date.now()}`, title: 'New Learning Task', description: 'AI-generated task', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' };
    }
}

export const generateMenteeTasks = async (menteeName: string, focusArea: string, difficulty: string): Promise<Task[]> => {
    if (!API_KEY) {
        // Mock Tasks
        return [
            { id: '1', title: `Complete ${focusArea} Tutorial`, description: "Go through the official documentation and build a small example.", dueDate: "2023-11-01", status: 'pending' },
            { id: '2', title: "Code Review Prep", description: "Refactor your recent project to clean up the component structure.", dueDate: "2023-11-03", status: 'pending' }
        ];
    }

    try {
        const prompt = `
          Create 3 actionable learning tasks for a mentee named ${menteeName}.
          Focus Area: ${focusArea}
          Difficulty Level: ${difficulty}
          
          Return as JSON array of tasks.
        `;

         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            dueDate: { type: Type.STRING },
                            status: { type: Type.STRING, enum: ['pending'] }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as Task[];
        }
        return [];
    } catch (error) {
        console.error("Gemini Task Gen Failed:", error);
        return [];
    }
}

export const generateMentorFeedback = async (submissionText: string, taskTitle: string): Promise<string> => {
    if (!API_KEY) return "Great job! Your code is clean, but consider handling edge cases.";

    try {
         const prompt = `
          Act as a senior software engineer mentor.
          Provide constructive feedback on this mentee submission for the task: "${taskTitle}".
          Submission/Notes: "${submissionText}"
          
          Keep it encouraging but technical.
        `;
         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
         });
         return response.text || "Good work.";
    } catch (e) {
        return "Good effort on this task.";
    }
}

// Sentiment Analysis Types
export interface SentimentResult {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  actionableSteps: string[];
}

export const analyzeSentiment = async (reviews: string[]): Promise<SentimentResult[]> => {
    if (!API_KEY) {
        // Mock sentiment analysis
        return reviews.map((text, index) => {
            const isPositive = text.toLowerCase().includes('great') || text.toLowerCase().includes('excellent') || text.toLowerCase().includes('amazing') || text.toLowerCase().includes('helpful');
            const isNegative = text.toLowerCase().includes('bad') || text.toLowerCase().includes('poor') || text.toLowerCase().includes('slow') || text.toLowerCase().includes('unhelpful');
            
            let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
            let confidence = 0.7;
            let actionableSteps: string[] = [];
            
            if (isPositive) {
                sentiment = 'positive';
                confidence = 0.85;
                actionableSteps = ['Continue providing excellent service', 'Ask for referrals from satisfied clients'];
            } else if (isNegative) {
                sentiment = 'negative';
                confidence = 0.82;
                actionableSteps = ['Follow up with client to address concerns', 'Review and improve communication process', 'Consider offering a discount on next project'];
            } else {
                sentiment = 'neutral';
                confidence = 0.65;
                actionableSteps = ['Request more detailed feedback', 'Identify areas for improvement'];
            }
            
            return {
                id: `sentiment-${index}`,
                text,
                sentiment,
                confidence,
                keywords: text.split(' ').filter(w => w.length > 4).slice(0, 5),
                actionableSteps
            };
        });
    }

    try {
        const prompt = `
          Analyze the sentiment of these client reviews and provide actionable steps for improvement.
          
          Reviews:
          ${reviews.map((r, i) => `${i + 1}. "${r}"`).join('\n')}
          
          For each review, determine:
          1. Sentiment (positive, negative, or neutral)
          2. Confidence score (0-1)
          3. Key words/phrases that influenced the sentiment
          4. 2-3 actionable steps the freelancer can take based on this feedback
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING },
                            sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                            confidence: { type: Type.NUMBER },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as SentimentResult[];
        }
        return [];
    } catch (error) {
        console.error("Gemini Sentiment Analysis Failed:", error);
        throw error;
    }
}

// AI Chatbot - Context-aware assistant
export const chatWithAI = async (message: string, pageContext: string, chatHistory: { role: 'user' | 'assistant'; content: string }[]): Promise<string> => {
    if (!API_KEY) {
        // Mock responses based on keywords
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('roadmap') || lowerMsg.includes('task')) {
            return "Based on your current roadmap, I recommend focusing on completing your pending tasks first. Your next step should be to work on the skills marked as 'in-progress'. Would you like specific tips on any particular task?";
        }
        if (lowerMsg.includes('mentor')) {
            return "Looking at your profile, connecting with a mentor could accelerate your growth significantly. I'd suggest browsing mentors who specialize in your skill gaps. Would you like me to explain what to look for in a mentor?";
        }
        if (lowerMsg.includes('portfolio') || lowerMsg.includes('project')) {
            return "Your portfolio is key to landing clients. Based on the current page, I suggest adding more case studies with measurable outcomes. Would you like tips on how to present your projects effectively?";
        }
        if (lowerMsg.includes('price') || lowerMsg.includes('rate') || lowerMsg.includes('earning')) {
            return "Based on your skills and experience, you might be undercharging. Consider researching market rates for your specialty and gradually increasing your rates as you build your portfolio.";
        }
        if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
            return "I'm your AI assistant! I can help you understand the current page, give advice on your freelance journey, explain features, and provide personalized recommendations. Just ask me anything!";
        }
        return "I'm here to help you navigate FairFound and grow your freelance career. Based on what I see on this page, is there something specific you'd like to know more about?";
    }

    try {
        const systemPrompt = `You are a helpful AI assistant for FairFound, a platform that helps freelancers grow their careers through AI-powered insights, mentorship, and community support.

Current page context:
${pageContext}

Previous conversation:
${chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')}

Rules:
1. Be concise and helpful
2. Reference the current page context when relevant
3. Provide actionable advice
4. Be encouraging but realistic
5. Keep responses under 100 words unless more detail is needed`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nUser: ${message}`,
        });

        return response.text || "I'm sorry, I couldn't process that. Could you try rephrasing?";
    } catch (error) {
        console.error("AI Chat Failed:", error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
}
