export type SeniorityLevel = 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead' | 'Staff / Principal' | 'Director / VP';
export type WorkArrangement = 'Remote' | 'Hybrid' | 'On-site';
export type CompanyVibe =
  | 'Fast-paced Startup'
  | 'High-growth Scaleup'
  | 'Modern Enterprise'
  | 'Mission-driven B-Corp'
  | 'DeepTech & R&D';

export type GeminiModelChoice =
  | 'gemini-4-carbon'
  | 'gemini-4-argon'
  | 'gemini-3.8-flash'
  | 'gemini-3.1-flash-lite';

export interface RoleInput {
  rawNotes: string;
  jobTitle: string;
  seniority: SeniorityLevel;
  workArrangement: WorkArrangement;
  location: string;
  industry: string;
  compensationRange: string;
  companyVibe: CompanyVibe;
  thinkingMode: boolean;
  selectedModel: GeminiModelChoice;
}

export interface LinkedInJobDescription {
  roleTitle: string;
  catchyHeadline: string;
  aboutRoleAndCompany: string;
  coreImpactMission: string;
  keyResponsibilities: string[];
  hardSkills: string[];
  softSkills: string[];
  qualifications: string[];
  benefitsAndPerks: string[];
  compensation: string;
  callToAction: string;
  linkedinHashtags: string[];
  fullFormattedMarkdown: string;
}

export interface BehavioralQuestion {
  id: number;
  category: 'Hard Skill' | 'Soft Skill';
  targetedSkill: string;
  question: string;
  starScenarioFocus: string;
  whyItMatters: string;
  greenFlags: string[];
  redFlags: string[];
  followUpProbes: string[];
}

export interface InterviewGuide {
  title: string;
  candidateLevel: string;
  overview: string;
  scoringRubricGuide: string;
  questions: BehavioralQuestion[]; // Exactly 10 behavioral questions
  fullFormattedMarkdown: string;
}

export interface GenerationResult {
  jobDescription: LinkedInJobDescription;
  interviewGuide: InterviewGuide;
  meta: {
    generatedAt: string;
    modelUsed: string;
    thinkingLevel?: string;
    processingTimeMs?: number;
  };
}

export type CopilotRole =
  | 'executive-recruiter'
  | 'mock-candidate'
  | 'dei-bias-auditor'
  | 'comp-leveling-advisor';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  modelUsed?: string;
  thinking?: string;
  timestamp: string;
}

export interface CandidateEvaluation {
  candidateName: string;
  ratings: Record<number, number>; // question id -> 1 to 5
  notes: Record<number, string>; // question id -> notes
  overallComments: string;
}
