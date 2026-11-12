import type {
  BehavioralQuestion,
  InterviewGuide,
  LinkedInJobDescription,
} from '../types/recruitment';

/**
 * Intelligent deterministic generator that extracts hard & soft skills from raw notes
 * and builds a LinkedIn JD and 10 targeted behavioral questions if upstream API experiences 503/high demand.
 */
export function generateDeterministicRecruitmentPack(input: {
  rawNotes: string;
  jobTitle?: string;
  seniority?: string;
  workArrangement?: string;
  location?: string;
  industry?: string;
  compensationRange?: string;
  companyVibe?: string;
}): {
  jobDescription: LinkedInJobDescription;
  interviewGuide: InterviewGuide;
} {
  const notes = input.rawNotes || '';
  const title = input.jobTitle || 'Senior Software Engineer';
  const seniority = input.seniority || 'Senior';
  const location = input.location || 'Remote / Hybrid';
  const comp = input.compensationRange || 'Competitive market rate + Equity';
  const vibe = input.companyVibe || 'High-growth';

  // Extract tech/hard skills from raw notes
  const hardSkillCandidates = [
    { key: 'react', name: 'React & Modern Frontend Architecture' },
    { key: 'typescript', name: 'TypeScript & Type Safety' },
    { key: 'node', name: 'Node.js & Backend Services' },
    { key: 'postgres', name: 'PostgreSQL & Database Optimization' },
    { key: 'sql', name: 'SQL & Data Modeling' },
    { key: 'aws', name: 'AWS Cloud & Infrastructure' },
    { key: 'kafka', name: 'Kafka & Event-Driven Streaming' },
    { key: 'redis', name: 'Redis Caching & Latency Reduction' },
    { key: 'docker', name: 'Docker & Containerization' },
    { key: 'kubernetes', name: 'Kubernetes Orchestration' },
    { key: 'python', name: 'Python & Data Pipelines' },
    { key: 'analytics', name: 'Product Analytics & Metrics (SQL/Mixpanel)' },
    { key: 'growth', name: 'Growth Loops & Funnel Optimization' },
    { key: 'seo', name: 'Technical SEO & Performance' },
    { key: 'agent', name: 'AI Workflows & LLM Orchestration' },
    { key: 'llm', name: 'LLM Prompt Engineering & Eval' },
  ];

  const lower = notes.toLowerCase();
  const detectedHard: string[] = [];
  hardSkillCandidates.forEach((c) => {
    if (lower.includes(c.key)) detectedHard.push(c.name);
  });

  // Guarantee at least 4 hard skills
  if (detectedHard.length < 4) {
    detectedHard.push('System Architecture & High-Scale Design');
    detectedHard.push('Modern Web Frameworks & Performance');
    detectedHard.push('API Design & Microservices');
    detectedHard.push('Automated Testing & CI/CD Pipelines');
  }

  // Soft skills extraction
  const softSkillCandidates = [
    { key: 'mentor', name: 'Mentorship & Junior Developer Growth' },
    { key: 'lead', name: 'Technical Leadership & Pod Direction' },
    { key: 'ambigu', name: 'Navigating Ambiguity & Shifting Priorities' },
    { key: 'trade-off', name: 'Explaining Technical Trade-offs to Stakeholders' },
    { key: 'cross-functional', name: 'Cross-Functional Collaboration with Product & Design' },
    { key: 'ownership', name: 'High Ownership & Accountability' },
    { key: 'feedback', name: 'Giving & Receiving Radical Candor' },
    { key: 'conflict', name: 'Conflict Resolution & Consensus Building' },
  ];

  const detectedSoft: string[] = [];
  softSkillCandidates.forEach((c) => {
    if (lower.includes(c.key)) detectedSoft.push(c.name);
  });

  if (detectedSoft.length < 4) {
    detectedSoft.push('Cross-Functional Collaboration & Empathy');
    detectedSoft.push('High Ownership & Bias for Action');
    detectedSoft.push('Technical Communication with Non-Engineers');
    detectedSoft.push('Constructive Code Review & Team Health');
  }

  // 1) Build LinkedIn Job Description
  const jobDescription: LinkedInJobDescription = {
    roleTitle: title,
    catchyHeadline: `Join our high-impact team as ${title} to drive mission-critical architecture at scale.`,
    aboutRoleAndCompany: `We are scaling our core engineering pod to solve high-throughput, mission-critical challenges. You will report directly to engineering leadership and partner intimately with Product and Design in our ${vibe} culture.`,
    coreImpactMission: `Own the end-to-end reliability, scalability, and developer velocity for our next chapter of 10x customer growth.`,
    keyResponsibilities: [
      `Lead architecture design sessions and implement resilient, low-latency microservices and UI workflows.`,
      `Mentor engineers, conduct rigorous and empathetic code reviews, and champion engineering excellence.`,
      `Partner with Product Managers and Designers to translate ambiguous requirements into actionable sprint milestones.`,
      `Identify performance bottlenecks across the stack (frontend rendering, database indexing, caching) and drive proactive optimizations.`,
      `Participate in on-call rotation and foster a blameless post-mortem culture for rapid system learning.`,
    ],
    hardSkills: detectedHard.slice(0, 5),
    softSkills: detectedSoft.slice(0, 5),
    qualifications: [
      `Proven experience building and shipping production-grade systems as a ${seniority} practitioner.`,
      `Deep expertise with ${detectedHard[0]} and ${detectedHard[1] || 'modern distributed systems'}.`,
      `Demonstrated capability leading technical initiatives from discovery to deployment.`,
      `Strong written and verbal communication skills across both technical and business audiences.`,
    ],
    benefitsAndPerks: [
      `Flexible ${input.workArrangement || 'Hybrid'} schedule & comprehensive home office stipend`,
      `Generous paid time off, mental health recharge days, and paid parental leave`,
      `Comprehensive health, vision, and dental coverage with 401(k) retirement matching`,
      `Annual professional development and conference budget`,
    ],
    compensation: comp,
    callToAction: `Interested or know someone phenomenal? Apply directly through this link or send a direct message for a confidential conversation!`,
    linkedinHashtags: [
      '#Hiring',
      `#${title.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#EngineeringJobs',
      '#TechHiring',
      '#CareerGrowth',
    ],
    fullFormattedMarkdown: '',
  };

  // 2) Build EXACTLY 10 Behavioral Interview Questions
  const questions: BehavioralQuestion[] = [];

  // 5 Hard Skill Questions
  const topHard = jobDescription.hardSkills;
  questions.push({
    id: 1,
    category: 'Hard Skill',
    targetedSkill: topHard[0] || 'System Architecture & Scaling',
    question: `Tell me about a complex technical decision or architectural overhaul you spearheaded for ${topHard[0] || 'a major system'}. How did you benchmark latency or throughput, and what was the ultimate production outcome?`,
    starScenarioFocus: 'High-scale architectural trade-offs under real traffic',
    whyItMatters: `Assesses ability to make pragmatic engineering trade-offs rather than over-engineering or creating tech debt.`,
    greenFlags: [
      'Articulates specific performance metrics (p95 latency, throughput, error rates)',
      'Discusses alternatives evaluated and why they were rejected',
      'Demonstrates understanding of failure modes and rollback strategies',
    ],
    redFlags: [
      'Answers only in vague theoretical buzzwords without concrete trade-offs',
      'Blames other team members or libraries for past architectural flaws',
      'Lacks awareness of production monitoring and operational costs',
    ],
    followUpProbes: [
      'If you were designing this again from scratch today with 10x the traffic, what would you change?',
      'How did you communicate the migration risks to leadership?',
    ],
  });

  questions.push({
    id: 2,
    category: 'Hard Skill',
    targetedSkill: topHard[1] || 'Database & Data Consistency',
    question: `Describe a situation where you had to debug a severe performance degradation or data consistency issue in production (e.g. slow database queries, memory leak, or race condition). Walk me through your diagnostic process.`,
    starScenarioFocus: 'Root-cause analysis and incident triage under pressure',
    whyItMatters: `Proves hands-on technical depth and systematic debugging methodology when systems fail.`,
    greenFlags: [
      'Uses telemetry, flamegraphs, query plans, or logs systematically',
      'Isolates root causes before applying quick-fix patches',
      'Introduces automated regression tests or alerts to prevent recurrence',
    ],
    redFlags: [
      'Relies on guesswork or rebooting servers without diagnosing root cause',
      'Cannot explain how database locks, indexes, or async events work under the hood',
    ],
    followUpProbes: [
      'What specific tooling or telemetry pointed you to the exact bug?',
      'What guardrails did you put in place to ensure this never happens again?',
    ],
  });

  questions.push({
    id: 3,
    category: 'Hard Skill',
    targetedSkill: topHard[2] || 'Code Quality & Refactoring',
    question: `Can you share an example of a legacy codebase or brittle service you refactored while keeping the system live for users? How did you ensure zero downtime or breaking API changes?`,
    starScenarioFocus: 'Refactoring and API design in high-availability environments',
    whyItMatters: `Evaluates code hygiene, backwards compatibility, and modern testing strategies.`,
    greenFlags: [
      'Used feature flags, dual-writing, or strangler-fig pattern',
      'Prioritized end-user availability and zero breaking contracts',
      'Left the codebase significantly better documented for peers',
    ],
    redFlags: [
      'Advocates for reckless full rewrites without honoring existing customer traffic',
      'Ignores integration testing and deployment validation',
    ],
    followUpProbes: [
      'How did you verify backwards compatibility with external clients?',
      'How did you measure code maintainability improvements post-launch?',
    ],
  });

  questions.push({
    id: 4,
    category: 'Hard Skill',
    targetedSkill: topHard[3] || 'API & Microservices Design',
    question: `Walk me through how you designed a contract or interface between two critical services. How did you handle backpressure, rate-limiting, and unexpected failure modes?`,
    starScenarioFocus: 'Resilient distributed systems integration and boundary contracts',
    whyItMatters: `Ensures candidate can build systems that fail gracefully without cascading outages.`,
    greenFlags: [
      'Understands idempotency, circuit breakers, and exponential backoff',
      'Designs clean, self-documenting schema contracts',
      'Considers payload size and serialization overhead',
    ],
    redFlags: [
      'Treats network calls as if they are guaranteed to succeed instantly',
      'Does not consider what happens when downstream dependencies crash',
    ],
    followUpProbes: [
      'What was the failover behavior if the downstream service timed out for 10 minutes?',
      'How did you handle schema migrations without downtime?',
    ],
  });

  questions.push({
    id: 5,
    category: 'Hard Skill',
    targetedSkill: topHard[4] || 'Security & Production Guardrails',
    question: `Tell me about a time you identified a potential security vulnerability or compliance risk in your application stack. How did you remediate it without disrupting user experience?`,
    starScenarioFocus: 'Security hygiene, access control, and defense-in-depth',
    whyItMatters: `Crucial for protecting customer trust, credentials, and regulatory compliance.`,
    greenFlags: [
      'Proactive identification rather than waiting for an audit failure',
      'Applies least-privilege principles and sanitizes all untrusted inputs',
      'Educates the broader team on security best practices',
    ],
    redFlags: [
      'Views security as someone else\'s job (e.g. Infosec only)',
      'Dismisses vulnerabilities as edge cases unlikely to happen in real life',
    ],
    followUpProbes: [
      'How did you verify that existing data wasn\'t compromised?',
      'What automated linting or CI step was added to catch future occurrences?',
    ],
  });

  // 5 Soft Skill Questions
  const topSoft = jobDescription.softSkills;
  questions.push({
    id: 6,
    category: 'Soft Skill',
    targetedSkill: topSoft[0] || 'Technical Mentorship & Knowledge Sharing',
    question: `Tell me about a time you mentored an engineer or teammate who was struggling with a complex concept or falling behind on deadlines. What was your approach and what was their growth trajectory?`,
    starScenarioFocus: 'Empathetic coaching, team multiplier impact, and psychological safety',
    whyItMatters: `At this level, individual output must be complemented by elevating the collective team capability.`,
    greenFlags: [
      'Takes personal responsibility for creating a safe environment to ask questions',
      'Customizes coaching to the individual\'s learning style rather than micromanaging',
      'Celebrates the mentee\'s independent success and autonomy',
    ],
    redFlags: [
      'Shows impatience or writes the code for them instead of coaching',
      'Views mentoring as an unwelcome distraction from personal coding time',
    ],
    followUpProbes: [
      'How did you balance your own deliverables while investing time in their growth?',
      'What was the most rewarding feedback they gave you later?',
    ],
  });

  questions.push({
    id: 7,
    category: 'Soft Skill',
    targetedSkill: topSoft[1] || 'Navigating Ambiguity & Rapid Pivots',
    question: `Describe a situation where product requirements were ambiguous, rapidly changing, or conflicting. How did you establish clarity for yourself and your team to keep shipping?`,
    starScenarioFocus: 'Decisiveness in uncertain environments without paralysis',
    whyItMatters: `Startups and scaleups require engineers who can define the path forward when blueprints are missing.`,
    greenFlags: [
      'Creates lightweight prototypes or RFCs to de-risk assumptions quickly',
      'Proactively aligns with Product on minimum viable problem scope',
      'Communicates transparently about known unknowns',
    ],
    redFlags: [
      'Freezes until someone gives them step-by-step instructions',
      'Complains about leadership without offering constructive proposals',
    ],
    followUpProbes: [
      'What was the biggest assumption you made that turned out to be wrong, and how did you adapt?',
      'How did you keep the engineering pod motivated through the pivot?',
    ],
  });

  questions.push({
    id: 8,
    category: 'Soft Skill',
    targetedSkill: topSoft[2] || 'Disagree and Commit / Healthy Conflict',
    question: `Tell me about a vigorous disagreement you had with a Product Manager, Designer, or fellow Engineer regarding a feature or architecture. How did you work through the conflict?`,
    starScenarioFocus: 'Constructive debate, evidence-driven discussion, and team cohesion',
    whyItMatters: `High-performing teams challenge each other directly while maintaining mutual respect.`,
    greenFlags: [
      'Listens with genuine curiosity to the opposing viewpoint\'s user/business priorities',
      'Uses data, customer empathy, and prototypes to resolve differences rather than ego',
      'Fully commits once a decision is made, even if their initial preference was not chosen',
    ],
    redFlags: [
      'Passive-aggressive behavior, lingering resentment, or sabotage after a decision',
      'Wins debates through seniority or stubbornness rather than merit',
    ],
    followUpProbes: [
      'What did you learn about the other person\'s perspective during that conversation?',
      'How did this disagreement strengthen your working relationship afterwards?',
    ],
  });

  questions.push({
    id: 9,
    category: 'Soft Skill',
    targetedSkill: topSoft[3] || 'Extreme Ownership & Blameless Accountability',
    question: `Give me an example of a project or deployment where things went sideways or an outage occurred that was directly your responsibility. How did you handle the fallout?`,
    starScenarioFocus: 'Taking accountability, blameless post-mortem, and continuous improvement',
    whyItMatters: `Integrity and humility under failure separate true leaders from average performers.`,
    greenFlags: [
      'Takes immediate, unreserved ownership without shifting blame to teammates or tools',
      'Prioritized restoring customer service first, then led a blameless post-mortem',
      'Turned the failure into a lasting systemic improvement for the company',
    ],
    redFlags: [
      'Defensive, excuses-driven, or points fingers at juniors, vendors, or QA',
      'Tries to sweep mistakes under the rug',
    ],
    followUpProbes: [
      'How did you communicate the issue to non-technical stakeholders during the incident?',
      'What specific systemic change was adopted as a direct result of that post-mortem?',
    ],
  });

  questions.push({
    id: 10,
    category: 'Soft Skill',
    targetedSkill: topSoft[4] || 'Communicating Technical Concepts to Non-Engineers',
    question: `Can you describe a time when you had to explain a complex technical constraint, tech debt cost, or refactoring proposal to executive leadership or non-technical business partners?`,
    starScenarioFocus: 'Business acumen, translation of technical trade-offs into commercial value',
    whyItMatters: `Ensures candidate can bridge the gap between engineering reality and commercial business goals.`,
    greenFlags: [
      'Translates technical debt into business metrics (conversion rate, churn, development speed, cloud bill)',
      'Avoids condescending jargon and uses relatable analogies',
      'Offers pragmatic tiered options (e.g. Bronze vs Silver vs Gold investment)',
    ],
    redFlags: [
      'Speaks down to non-technical colleagues or overwhelms them with jargon',
      'Demands refactoring without articulating any customer or commercial payoff',
    ],
    followUpProbes: [
      'How did you measure the success of that project in business terms?',
      'What advice would you give to junior engineers presenting to the executive team?',
    ],
  });

  const interviewGuide: InterviewGuide = {
    title: `Comprehensive Behavioral Interview Guide: ${title}`,
    candidateLevel: seniority,
    overview: `This structured 10-question behavioral interview guide specifically targets the core hard and soft skills outlined in the ${title} Job Description. Each question utilizes the STAR methodology to extract verifiable evidence of past performance.`,
    scoringRubricGuide: `Evaluate candidates on a 1-5 scale based on concrete behavioral evidence. Pay strict attention to Green Flags (high competency indicators) and Red Flags (warning signals). An average score of 4.4+ indicates a Strong Hire.`,
    questions,
    fullFormattedMarkdown: '',
  };

  return { jobDescription, interviewGuide };
}
