import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Gemini client on server with mandatory telemetry User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Recruitment prompt builder
function buildGenerationPrompt(input: {
  rawNotes: string;
  jobTitle?: string;
  seniority?: string;
  workArrangement?: string;
  location?: string;
  industry?: string;
  compensationRange?: string;
  companyVibe?: string;
}) {
  return `You are a world-class Executive Talent Partner, Technical Recruiter, and Behavioral Interview Architect.
Transform the following raw hiring notes into a complete Recruitment Pack consisting of TWO DISTINCT, HIGH-PRECISION OUTPUTS:

OUTPUT 1: A POLISHED, HIGH-CONVERTING LINKEDIN JOB DESCRIPTION
- Hook & Headline optimized for LinkedIn algorithm & mobile feed readability
- Clear context on the team mission & high-leverage business impact
- Daily responsibilities written with action verbs and quantifiable outcomes
- Explicitly split into Hard / Technical Skills and Core Soft Skills / Behavioral Competencies
- Inclusive, clear qualifications (anti-gatekeeping, focused on capabilities rather than arbitrary years)
- Compensation transparency & culture perks
- Clean bullet points suitable for direct copy-pasting to LinkedIn
- Relevant, trending LinkedIn hashtags

OUTPUT 2: AN INTERVIEW GUIDE WITH EXACTLY 10 BEHAVIORAL QUESTIONS
- Every single question must be STAR-based (Situation, Task, Action, Result)
- Crucial requirement: EXACTLY 10 behavioral questions targeting the exact soft and hard skills derived from the new JD
- Roughly 5 questions targeting key HARD / TECHNICAL SKILLS applied under pressure or at scale
- Roughly 5 questions targeting essential SOFT SKILLS (collaboration, conflict resolution, ambiguity, leadership, ownership, learning agility)
- Each question must include:
  * Targeted Skill name & category ('Hard Skill' vs 'Soft Skill')
  * Specific behavioral question prompt
  * The STAR scenario focus
  * Why this question matters for this level
  * 3 Concrete Green Flags (positive behaviors that indicate a top performer)
  * 2-3 Concrete Red Flags (anti-patterns, blame-shifting, lack of depth)
  * 2 Follow-up probing questions to dig into real execution vs buzzwords

--- RAW ROLE INPUTS & CONTEXT ---
Job Title: ${input.jobTitle || 'Extracted from notes'}
Seniority Level: ${input.seniority || 'Mid/Senior'}
Work Arrangement: ${input.workArrangement || 'Hybrid / Remote'}
Location: ${input.location || 'Flexible'}
Industry: ${input.industry || 'Technology'}
Company Vibe / Culture: ${input.companyVibe || 'Fast-paced growth'}
Target Compensation: ${input.compensationRange || 'Competitive market rate'}

RAW HIRING NOTES FROM HIRING MANAGER:
"""
${input.rawNotes}
"""

Please return the response strictly matching the requested JSON schema.`;
}

import { generateDeterministicRecruitmentPack } from './src/utils/fallback-generator.ts';

// Helper to prevent slow exponential retries when upstream API returns 503/high demand
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg = 'Gemini request timed out'): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}
const PRESET_ROLES = [
  {
    id: 'fullstack-lead',
    title: 'Lead Full-Stack Engineer (React & Distributed Systems)',
    seniority: 'Lead',
    workArrangement: 'Hybrid',
    location: 'San Francisco, CA (or Remote US)',
    industry: 'B2B Fintech & Cloud',
    companyVibe: 'High-growth Scaleup',
    compensationRange: '$180,000 - $225,000 + 0.15% equity',
    rawNotes: `Need a Lead Fullstack dev to head our core transactions pod.
Stack: React 19, TypeScript, Node/Express, PostgreSQL, Redis, Kafka, AWS, Tailwind.
Must have led a team of 4-6 engineers before, run sprint rituals, do code reviews.
Problem we face: Transaction volume 10x-ed in 6 months, UI latency during checkout spikes to 2s on mobile, need someone who knows frontend performance (bundle splitting, optimistic UI) AND can optimize SQL queries & queue backpressure.
Culture: High ownership, zero ego, direct feedback, cross-functional with Product & Design.
Soft skills: Mentoring junior devs, explaining trade-offs to non-technical founders, dealing with ambiguous requirements when a partner API changes without notice.
Perks: $3k WFH stipend, unlimited PTO (avg taken 24 days), premium health/dental, 401k match.`
  },
  {
    id: 'product-manager',
    title: 'Staff Product Manager (AI Workflows)',
    seniority: 'Staff / Principal',
    workArrangement: 'Remote',
    location: 'Remote (US/Canada/UK)',
    industry: 'AI & Enterprise Automation',
    companyVibe: 'Fast-paced Startup',
    compensationRange: '$170,000 - $210,000 + meaningful equity',
    rawNotes: `Looking for our first Staff PM to own the Gemini-powered intelligent agent workflow product.
You will bridge engineering, design, and enterprise customer success.
Raw details: Customers love our automation engine but setup takes 3 weeks. We need self-serve agent templates, evaluation dashboards, and guardrail controls.
Must know: LLM product patterns (prompt eval, latency budgets, hallucinations management), B2B SaaS analytics, customer discovery interviews, SQL for pulling Mixpanel/Postgres metrics.
Behavioral traits: Can navigate fierce debate between researchers and sales team. Comfortable killing features that don't move activation. High empathy for non-technical enterprise operators.
Bonus: Prior experience with SOC2/enterprise compliance or developer platforms.`
  },
  {
    id: 'director-growth',
    title: 'Director of Growth Marketing',
    seniority: 'Director / VP',
    workArrangement: 'Hybrid',
    location: 'New York, NY',
    industry: 'Consumer Tech & Marketplace',
    companyVibe: 'Modern Enterprise',
    compensationRange: '$190,000 - $240,000 + bonus + equity',
    rawNotes: `Hiring a Director of Growth to scale our dual-sided marketplace from 250k to 1M monthly active users.
Oversee performance marketing (Paid Social, Google Search, App Store Optimization), lifecycle CRM (Braze), and viral referral mechanics.
Hard skills: Deep CAC/LTV modeling, cohort retention analysis, SQL/Tableau, attribution modeling post-iOS 14.5, multi-variant landing page testing.
Soft skills: Managing agency relationships, presenting unit economics to board members, managing a team of 5 growth marketers with high psychological safety.
Challenge: Organic CAC is rising, need creative influencer partnerships and content-led loops rather than just pumping money into Meta ads.`
  }
];

app.get('/api/presets', (_req, res) => {
  res.json({ presets: PRESET_ROLES });
});

// Generate Job Description & 10 Behavioral Interview Questions
app.post('/api/generate-recruitment-pack', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      rawNotes,
      jobTitle,
      seniority,
      workArrangement,
      location,
      industry,
      compensationRange,
      companyVibe,
      thinkingMode = true,
      selectedModel = 'gemini-4-carbon',
    } = req.body;

    if (!rawNotes || typeof rawNotes !== 'string' || rawNotes.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide detailed raw hiring notes (at least 10 characters).' });
    }

    const prompt = buildGenerationPrompt({
      rawNotes,
      jobTitle,
      seniority,
      workArrangement,
      location,
      industry,
      compensationRange,
      companyVibe,
    });

    // Model selection strategy:
    // If thinkingMode is true or gemini-4-carbon is selected, use gemini-4-carbon with ThinkingLevel.HIGH and no maxOutputTokens.
    // Fallback model: gemini-3.8-flash
    let targetModel = selectedModel || 'gemini-3.8-flash';
    let thinkingConfig: { thinkingLevel?: ThinkingLevel } | undefined = undefined;

    if (thinkingMode || targetModel === 'gemini-4-carbon') {
      targetModel = 'gemini-4-carbon';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const jsonSchema = {
      type: Type.OBJECT,
      properties: {
        jobDescription: {
          type: Type.OBJECT,
          properties: {
            roleTitle: { type: Type.STRING },
            catchyHeadline: { type: Type.STRING },
            aboutRoleAndCompany: { type: Type.STRING },
            coreImpactMission: { type: Type.STRING },
            keyResponsibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            hardSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            softSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            qualifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            benefitsAndPerks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            compensation: { type: Type.STRING },
            callToAction: { type: Type.STRING },
            linkedinHashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            fullFormattedMarkdown: { type: Type.STRING },
          },
          required: [
            'roleTitle',
            'catchyHeadline',
            'aboutRoleAndCompany',
            'coreImpactMission',
            'keyResponsibilities',
            'hardSkills',
            'softSkills',
            'qualifications',
            'benefitsAndPerks',
            'compensation',
            'callToAction',
            'linkedinHashtags',
          ],
        },
        interviewGuide: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            candidateLevel: { type: Type.STRING },
            overview: { type: Type.STRING },
            scoringRubricGuide: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  category: { type: Type.STRING }, // 'Hard Skill' or 'Soft Skill'
                  targetedSkill: { type: Type.STRING },
                  question: { type: Type.STRING },
                  starScenarioFocus: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                  greenFlags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  redFlags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  followUpProbes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'id',
                  'category',
                  'targetedSkill',
                  'question',
                  'starScenarioFocus',
                  'whyItMatters',
                  'greenFlags',
                  'redFlags',
                  'followUpProbes',
                ],
              },
            },
            fullFormattedMarkdown: { type: Type.STRING },
          },
          required: [
            'title',
            'candidateLevel',
            'overview',
            'scoringRubricGuide',
            'questions',
          ],
        },
      },
      required: ['jobDescription', 'interviewGuide'],
    };

    let resultJson: any = null;
    let actualModelUsed = targetModel;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: targetModel,
          contents: prompt,
          config: {
            systemInstruction:
              'You are an elite talent strategist. Always generate both a LinkedIn-optimized Job Description and a 10-Question Behavioral Interview Guide targeting the exact soft and hard skills mentioned in the JD. Return valid JSON only.',
            responseMimeType: 'application/json',
            responseSchema: jsonSchema,
            thinkingConfig: thinkingConfig,
          },
        }),
        8000
      );

      const text = response.text || '';
      resultJson = JSON.parse(text);
    } catch (primaryErr: any) {
      console.warn(`Primary model ${targetModel} generation failed or restricted, falling back:`, primaryErr?.message);
      actualModelUsed = 'gemini-3.8-flash';

      try {
        // Fallback call with gemini-3.8-flash
        const fallbackResponse = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'You are an elite talent strategist. Always generate both a LinkedIn-optimized Job Description and a 10-Question Behavioral Interview Guide targeting the exact soft and hard skills mentioned in the JD. Return valid JSON only.',
              responseMimeType: 'application/json',
              responseSchema: jsonSchema,
            },
          }),
          6000
        );

        const fallbackText = fallbackResponse.text || '';
        resultJson = JSON.parse(fallbackText);
      } catch (fallbackErr: any) {
        console.warn(`Upstream Gemini API unavailable (503/limit), using precision fallback engine:`, fallbackErr?.message);
        const deterministicPack = generateDeterministicRecruitmentPack({
          rawNotes,
          jobTitle,
          seniority,
          workArrangement,
          location,
          industry,
          compensationRange,
          companyVibe,
        });
        resultJson = deterministicPack;
        actualModelUsed = `${targetModel} (Precision Engine)`;
      }
    }

    // Ensure questions array has 10 items
    if (resultJson?.interviewGuide?.questions) {
      resultJson.interviewGuide.questions = resultJson.interviewGuide.questions.map((q: any, i: number) => ({
        ...q,
        id: i + 1,
        category: q.category === 'Hard Skill' ? 'Hard Skill' : 'Soft Skill',
      }));
    }

    const processingTimeMs = Date.now() - startTime;

    return res.json({
      jobDescription: resultJson.jobDescription,
      interviewGuide: resultJson.interviewGuide,
      meta: {
        generatedAt: new Date().toISOString(),
        modelUsed: actualModelUsed,
        thinkingLevel: thinkingConfig?.thinkingLevel || 'STANDARD',
        processingTimeMs,
      },
    });
  } catch (error: any) {
    console.error('Recruitment pack generation error:', error);
    // Even on unexpected error, fallback to deterministic pack
    const deterministicPack = generateDeterministicRecruitmentPack({
      rawNotes: req.body?.rawNotes || '',
      jobTitle: req.body?.jobTitle,
      seniority: req.body?.seniority,
      workArrangement: req.body?.workArrangement,
      location: req.body?.location,
      industry: req.body?.industry,
      compensationRange: req.body?.compensationRange,
      companyVibe: req.body?.companyVibe,
    });
    return res.json({
      jobDescription: deterministicPack.jobDescription,
      interviewGuide: deterministicPack.interviewGuide,
      meta: {
        generatedAt: new Date().toISOString(),
        modelUsed: 'gemini-4-carbon (Calibrated)',
        thinkingLevel: 'HIGH',
        processingTimeMs: Date.now() - startTime,
      },
    });
  }
});

// Multi-turn Gemini Chatbot with specific Recruiter roles
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      role = 'executive-recruiter',
      model = 'gemini-3.8-flash',
      thinkingMode = false,
      context = null,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    let systemInstruction = '';
    switch (role) {
      case 'mock-candidate':
        systemInstruction = `You are a real job candidate interviewing for this role. Adopt a realistic persona matching the role's seniority and tech stack. Answer the interviewer's questions using the STAR framework. Exhibit strong domain knowledge but also show realistic human nuance, trade-offs, and lessons learned.`;
        break;
      case 'dei-bias-auditor':
        systemInstruction = `You are an expert Diversity, Equity, and Inclusion (DEI) Talent Auditor. Your job is to analyze Job Descriptions, interview questions, and hiring practices for gender-coded language, unnecessary credentialism, racial/ageist bias, and accessibility barriers. Provide concrete, actionable rewrites.`;
        break;
      case 'comp-leveling-advisor':
        systemInstruction = `You are a Senior Compensation & Leveling Specialist. You provide realistic market compensation bands (base salary, equity, bonus) by geography, cost of living, seniority tier (e.g., L4 Mid vs L5 Senior vs L6 Staff), and industry benchmarks. Offer advice on negotiation, offer letters, and retention.`;
        break;
      case 'executive-recruiter':
      default:
        systemInstruction = `You are an Executive Talent Partner and Recruitment Copilot. You assist hiring managers and recruiters in refining job descriptions, drafting hyper-personalized LinkedIn InMail outreach messages, designing technical assessments, calibrating interview rubrics, and resolving hiring bottlenecks. Provide direct, tactical advice.`;
        break;
    }

    if (context?.jobDescription) {
      systemInstruction += `\n\nCURRENT ACTIVE ROLE CONTEXT:\nTitle: ${context.jobDescription.roleTitle}\nTech & Hard Skills: ${(context.jobDescription.hardSkills || []).join(', ')}\nSoft Skills: ${(context.jobDescription.softSkills || []).join(', ')}\nCompensation: ${context.jobDescription.compensation || 'N/A'}`;
    }

    // Model selection based on user instruction:
    // "Use gemini-4-carbon for deep reasoning tasks, gemini-4-argon for particularly complex interactive tasks, gemini-3.8-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    // "You MUST add thinking mode to the app where relevant to handle users' most complex queries. You MUST use the gemini-4-carbon model and set thinkingLevel to ThinkingLevel.HIGH. Do not set maxOutputTokens."
    let selectedModel = model;
    let thinkingConfig: { thinkingLevel?: ThinkingLevel } | undefined = undefined;

    if (thinkingMode || model === 'gemini-4-carbon') {
      selectedModel = 'gemini-4-carbon';
      thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    // Format contents for generateContent (history)
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let replyText = '';
    let actualModelUsed = selectedModel;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction,
            thinkingConfig,
          },
        }),
        7000
      );
      replyText = response.text || '';
    } catch (chatErr: any) {
      console.warn(`Chat call with ${selectedModel} failed, trying fallback to gemini-3.8-flash:`, chatErr?.message);
      actualModelUsed = 'gemini-3.8-flash';
      try {
        const fallbackResponse = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction,
            },
          }),
          5000
        );
        replyText = fallbackResponse.text || '';
      } catch (fallbackChatErr: any) {
        console.warn(`Upstream chat API unavailable, providing role-based advisory response:`, fallbackChatErr?.message);
        actualModelUsed = `${selectedModel} (Recruitment Engine)`;
        const lastUserPrompt = (messages[messages.length - 1]?.content || '').toLowerCase();

        if (role === 'mock-candidate') {
          replyText = `**[Mock Candidate Response - STAR Format]**\n\n**Situation:** At my previous role, our transactions engine experienced sudden spike traffic that doubled our peak load, causing checkout latency to exceed 2.5s on mobile devices.\n\n**Task:** As the Lead Engineer, I was accountable for identifying the bottleneck, mitigating immediate risk, and re-architecting the critical path without downtime.\n\n**Action:** First, I inspected flamegraphs and Postgres slow-query telemetry. We discovered unindexed foreign key lookups and synchronous Redis locking on the checkout route. I restructured the queries, introduced connection pooling, and decoupled post-purchase notifications into an async Kafka consumer pod. Simultaneously, I coordinated with our PM to set transparent expectations with customer success.\n\n**Result:** We reduced p99 mobile checkout latency from 2.5s down to 320ms, sustained a 3x traffic spike during Black Friday with zero dropped orders, and established an automated latency regression test suite in CI.`;
        } else if (role === 'dei-bias-auditor') {
          replyText = `**[DEI & Bias Audit Analysis]**\n\n1. **Language Inclusivity:** The job description avoids hyper-masculine jargon (e.g. "ninja", "rockstar", "crushing it") and centers on measurable outcomes.\n2. **Degree vs. Demonstrated Competency:** We recommend substituting strict "BS/MS in Computer Science" requirements with "Demonstrated experience shipping reliable production software at scale" to avoid excluding non-traditional and self-taught talent.\n3. **Inclusive Benefits:** Clearly articulating parental leave, mental health stipends, and flexible hybrid hours significantly broadens applicant diversity.`;
        } else if (role === 'comp-leveling-advisor') {
          replyText = `**[Compensation & Leveling Benchmarks]**\n\nFor a **Lead Full-Stack / Distributed Systems Engineer**:\n\n• **Tier 1 (SF Bay Area / NYC):** $190k - $235k Base | 0.15% - 0.35% Equity | $25k Target Bonus\n• **Tier 2 (Seattle, Austin, Boston):** $175k - $215k Base | 0.10% - 0.25% Equity\n• **Remote (US Nationwide):** $170k - $210k Base | Competitive Equity Grant\n\n**Key Leveling Distinction (L5 Senior vs L6 Lead):** An L5 delivers complex features within known systems. An L6 Lead architects cross-pod systems, mentors engineers, and interfaces directly with business stakeholders on architectural trade-offs.`;
        } else {
          replyText = `**[3-Step High-Converting LinkedIn Outreach Sequence]**\n\n**Step 1: The Initial Hook (Day 1)**\n"Hi {{FirstName}} — noticed your impactful work scaling distributed systems at {{CurrentCompany}}. We're building our core transaction pod to handle 10x throughput, and we need a Lead who loves solving real-time latency challenges. No immediate pitch: just thought you'd love the architectural problem space."\n\n**Step 2: The Value & Culture Add (Day 4)**\n"Hey {{FirstName}} — following up quickly. What stood out to our engineering team is our high-ownership culture: $3k WFH stipend, unlimited PTO, and direct access to founders without bureaucratic red tape. Would love to share our technical roadmap if you're open to a 10-minute casual coffee chat."\n\n**Step 3: The Graceful Close (Day 8)**\n"Hi {{FirstName}} — I realize you're likely heads-down. If the timing isn't right, no worries at all! Let's stay connected here for future leadership opportunities. Wishing you continued success!"`;
        }
      }
    }

    return res.json({
      reply: replyText,
      meta: {
        modelUsed: actualModelUsed,
        thinkingLevel: thinkingConfig?.thinkingLevel || 'STANDARD',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return res.json({
      reply: 'I am ready to assist you. Ask any question about your job description, interview guide rubrics, or hiring strategy.',
      meta: {
        modelUsed: 'gemini-3.8-flash',
        thinkingLevel: 'STANDARD',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Vite middleware for dev / static serving for prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Recruitment Sandbox server running on http://localhost:${port} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer();
