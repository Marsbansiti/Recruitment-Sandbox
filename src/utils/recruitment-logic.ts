import type {
  BehavioralQuestion,
  CandidateEvaluation,
  InterviewGuide,
  LinkedInJobDescription,
} from '../types/recruitment';

/**
 * Validates raw recruitment notes entered by the user
 */
export function validateRawNotes(notes: string): {
  valid: boolean;
  wordCount: number;
  characterCount: number;
  error?: string;
  detectedKeyTerms: string[];
} {
  const trimmed = (notes || '').trim();
  const characterCount = trimmed.length;
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount < 4) {
    return {
      valid: false,
      wordCount,
      characterCount,
      error: 'Please enter at least 4-5 words of notes (e.g. role title, key tech stack, requirements).',
      detectedKeyTerms: [],
    };
  }

  // Common keywords scanner
  const potentialKeywords = [
    'react', 'typescript', 'python', 'aws', 'docker', 'kubernetes', 'node', 'sql',
    'graphql', 'leadership', 'cross-functional', 'communication', 'agile', 'figma',
    'mentorship', 'scaling', 'b2b', 'saas', 'strategy', 'collaboration', 'ownership',
    'ci/cd', 'security', 'frontend', 'backend', 'full-stack', 'system design'
  ];

  const lowerNotes = trimmed.toLowerCase();
  const detectedKeyTerms = potentialKeywords.filter((term) =>
    lowerNotes.includes(term)
  );

  return {
    valid: true,
    wordCount,
    characterCount,
    detectedKeyTerms,
  };
}

/**
 * Formats a LinkedIn-ready job description post with high-converting structure
 */
export function formatLinkedInPost(jd: LinkedInJobDescription): string {
  const parts: string[] = [];

  // Hook / Headline
  parts.push(`🚀 WE'RE HIRING: ${jd.roleTitle.toUpperCase()}`);
  if (jd.catchyHeadline) {
    parts.push(`✨ ${jd.catchyHeadline}`);
  }
  parts.push('');

  // About role & mission
  if (jd.aboutRoleAndCompany) {
    parts.push('📍 ABOUT THE ROLE');
    parts.push(jd.aboutRoleAndCompany);
    parts.push('');
  }

  if (jd.coreImpactMission) {
    parts.push('🎯 THE MISSION & IMPACT');
    parts.push(jd.coreImpactMission);
    parts.push('');
  }

  // Key Responsibilities
  if (jd.keyResponsibilities?.length) {
    parts.push('💼 WHAT YOU WILL DO');
    jd.keyResponsibilities.forEach((r) => parts.push(`• ${r}`));
    parts.push('');
  }

  // Hard & Soft Skills Breakdown
  if (jd.hardSkills?.length) {
    parts.push('🛠️ TECH & HARD SKILLS');
    jd.hardSkills.forEach((s) => parts.push(`• ${s}`));
    parts.push('');
  }

  if (jd.softSkills?.length) {
    parts.push('🌟 TRAITS & CORE COMPETENCIES');
    jd.softSkills.forEach((s) => parts.push(`• ${s}`));
    parts.push('');
  }

  // Qualifications
  if (jd.qualifications?.length) {
    parts.push('📋 QUALIFICATIONS');
    jd.qualifications.forEach((q) => parts.push(`• ${q}`));
    parts.push('');
  }

  // Benefits & Compensation
  if (jd.compensation || jd.benefitsAndPerks?.length) {
    parts.push('🎁 WHAT WE OFFER');
    if (jd.compensation) {
      parts.push(`💰 Compensation: ${jd.compensation}`);
    }
    if (jd.benefitsAndPerks?.length) {
      jd.benefitsAndPerks.forEach((b) => parts.push(`• ${b}`));
    }
    parts.push('');
  }

  // CTA
  if (jd.callToAction) {
    parts.push('👉 READY TO APPLY?');
    parts.push(jd.callToAction);
    parts.push('');
  }

  // Hashtags
  if (jd.linkedinHashtags?.length) {
    const formattedHashtags = jd.linkedinHashtags
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`))
      .join(' ');
    parts.push(formattedHashtags);
  }

  return parts.join('\n');
}

/**
 * Calculates estimated reading time in minutes based on average 225 wpm
 */
export function calculateReadingTimeMinutes(text: string): number {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 225));
}

/**
 * Calculates interview scorecard recommendation from candidate ratings (1 to 5)
 */
export function calculateInterviewScore(
  ratings: Record<number, number>,
  totalQuestions: number = 10
): {
  averageScore: number;
  completedCount: number;
  completionPercentage: number;
  recommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'No Hire' | 'Incomplete';
  recommendationColor: string;
} {
  const questionIds = Object.keys(ratings).map(Number);
  const validScores = questionIds
    .map((id) => ratings[id])
    .filter((score) => typeof score === 'number' && score >= 1 && score <= 5);

  const completedCount = validScores.length;
  const completionPercentage = Math.round((completedCount / totalQuestions) * 100);

  if (completedCount === 0) {
    return {
      averageScore: 0,
      completedCount: 0,
      completionPercentage: 0,
      recommendation: 'Incomplete',
      recommendationColor: 'text-gray-500',
    };
  }

  const sum = validScores.reduce((acc, curr) => acc + curr, 0);
  const averageScore = Number((sum / completedCount).toFixed(2));

  let recommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Lean No Hire' | 'No Hire' | 'Incomplete' = 'Incomplete';
  let recommendationColor = 'text-gray-500';

  if (completedCount < Math.ceil(totalQuestions * 0.6)) {
    recommendation = 'Incomplete';
    recommendationColor = 'text-amber-500';
  } else if (averageScore >= 4.4) {
    recommendation = 'Strong Hire';
    recommendationColor = 'text-emerald-600';
  } else if (averageScore >= 3.6) {
    recommendation = 'Hire';
    recommendationColor = 'text-green-600';
  } else if (averageScore >= 3.0) {
    recommendation = 'Lean Hire';
    recommendationColor = 'text-teal-600';
  } else if (averageScore >= 2.2) {
    recommendation = 'Lean No Hire';
    recommendationColor = 'text-orange-600';
  } else {
    recommendation = 'No Hire';
    recommendationColor = 'text-rose-600';
  }

  return {
    averageScore,
    completedCount,
    completionPercentage,
    recommendation,
    recommendationColor,
  };
}

/**
 * Validates an interview guide to verify question count and skill targeting
 */
export function validateInterviewGuide(guide: Partial<InterviewGuide>): {
  isValid: boolean;
  questionCount: number;
  hardSkillsCount: number;
  softSkillsCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const questions = guide?.questions || [];
  const questionCount = questions.length;

  if (questionCount !== 10) {
    errors.push(`Expected exactly 10 behavioral questions, received ${questionCount}.`);
  }

  let hardSkillsCount = 0;
  let softSkillsCount = 0;

  questions.forEach((q, idx) => {
    if (!q.question || q.question.trim().length === 0) {
      errors.push(`Question #${idx + 1} has empty question text.`);
    }
    if (!q.targetedSkill) {
      errors.push(`Question #${idx + 1} lacks a targeted skill.`);
    }
    if (q.category === 'Hard Skill') {
      hardSkillsCount++;
    } else if (q.category === 'Soft Skill') {
      softSkillsCount++;
    }
  });

  return {
    isValid: errors.length === 0,
    questionCount,
    hardSkillsCount,
    softSkillsCount,
    errors,
  };
}
