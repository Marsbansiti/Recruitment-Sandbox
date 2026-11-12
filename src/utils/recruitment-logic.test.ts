import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRawNotes,
  formatLinkedInPost,
  calculateReadingTimeMinutes,
  calculateInterviewScore,
  validateInterviewGuide,
} from './recruitment-logic';
import type { BehavioralQuestion, LinkedInJobDescription } from '../types/recruitment';

test('validateRawNotes rejects empty or too short notes', () => {
  const emptyRes = validateRawNotes('');
  assert.equal(emptyRes.valid, false);
  assert.equal(emptyRes.wordCount, 0);

  const shortRes = validateRawNotes('need dev');
  assert.equal(shortRes.valid, false);
  assert.ok(shortRes.error);
});

test('validateRawNotes accepts sufficient notes and detects key terms', () => {
  const notes = 'Looking for a Senior React and TypeScript developer with AWS experience and strong leadership skills.';
  const res = validateRawNotes(notes);
  assert.equal(res.valid, true);
  assert.ok(res.wordCount > 5);
  assert.ok(res.detectedKeyTerms.includes('react'));
  assert.ok(res.detectedKeyTerms.includes('typescript'));
  assert.ok(res.detectedKeyTerms.includes('aws'));
  assert.ok(res.detectedKeyTerms.includes('leadership'));
});

test('formatLinkedInPost correctly includes sections, emojis, and hashtags', () => {
  const dummyJD: LinkedInJobDescription = {
    roleTitle: 'Senior Full-Stack Engineer',
    catchyHeadline: 'Build next-gen cloud systems',
    aboutRoleAndCompany: 'We are expanding our product engineering pod.',
    coreImpactMission: 'Own end-to-end architecture from UI to Postgres.',
    keyResponsibilities: ['Architect clean React apps', 'Lead sprint grooming'],
    hardSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    softSkills: ['High ownership', 'Constructive code reviewer'],
    qualifications: ['5+ years web dev', 'Proven track record'],
    benefitsAndPerks: ['Remote-first', 'Annual learning stipend'],
    compensation: '$160,000 - $190,000 + Equity',
    callToAction: 'DM me or apply directly via the link below!',
    linkedinHashtags: ['#Hiring', 'TechJobs', '#ReactDev'],
    fullFormattedMarkdown: '',
  };

  const output = formatLinkedInPost(dummyJD);
  assert.ok(output.includes("WE'RE HIRING: SENIOR FULL-STACK ENGINEER"));
  assert.ok(output.includes('Build next-gen cloud systems'));
  assert.ok(output.includes('🛠️ TECH & HARD SKILLS'));
  assert.ok(output.includes('• React'));
  assert.ok(output.includes('🌟 TRAITS & CORE COMPETENCIES'));
  assert.ok(output.includes('💰 Compensation: $160,000 - $190,000 + Equity'));
  assert.ok(output.includes('#Hiring #TechJobs #ReactDev'));
});

test('calculateReadingTimeMinutes returns at least 1 minute and scales with length', () => {
  assert.equal(calculateReadingTimeMinutes(''), 0);
  assert.equal(calculateReadingTimeMinutes('short description here'), 1);
  const words500 = new Array(500).fill('word').join(' ');
  assert.equal(calculateReadingTimeMinutes(words500), 3);
});

test('calculateInterviewScore handles completion thresholds and hire recommendations', () => {
  // Empty
  const emptyRes = calculateInterviewScore({});
  assert.equal(emptyRes.completedCount, 0);
  assert.equal(emptyRes.recommendation, 'Incomplete');

  // Below 60% completion threshold (e.g. only 3 questions answered)
  const lowCompletion = calculateInterviewScore({ 1: 5, 2: 5, 3: 5 }, 10);
  assert.equal(lowCompletion.recommendation, 'Incomplete');
  assert.equal(lowCompletion.completedCount, 3);

  // Strong Hire: average >= 4.4 with 8 questions answered
  const strongHire = calculateInterviewScore(
    { 1: 5, 2: 5, 3: 5, 4: 4, 5: 5, 6: 4, 7: 5, 8: 4 },
    10
  );
  assert.equal(strongHire.completedCount, 8);
  assert.ok(strongHire.averageScore >= 4.4);
  assert.equal(strongHire.recommendation, 'Strong Hire');

  // Lean No Hire: average around 2.5
  const noHire = calculateInterviewScore(
    { 1: 2, 2: 2, 3: 3, 4: 2, 5: 2, 6: 3, 7: 2, 8: 2 },
    10
  );
  assert.equal(noHire.recommendation, 'Lean No Hire');
});

test('validateInterviewGuide checks for exactly 10 questions and skill distribution', () => {
  const dummyQuestions: BehavioralQuestion[] = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    category: i < 5 ? 'Hard Skill' : 'Soft Skill',
    targetedSkill: `Skill ${i + 1}`,
    question: `Tell me about a time you handled challenge ${i + 1}`,
    starScenarioFocus: 'Handling system outage or conflict',
    whyItMatters: 'Tests resilience',
    greenFlags: ['Clear STAR delivery', 'Accountability'],
    redFlags: ['Blaming others'],
    followUpProbes: ['What would you do differently?'],
  }));

  const validation = validateInterviewGuide({ questions: dummyQuestions });
  assert.equal(validation.isValid, true);
  assert.equal(validation.questionCount, 10);
  assert.equal(validation.hardSkillsCount, 5);
  assert.equal(validation.softSkillsCount, 5);
  assert.equal(validation.errors.length, 0);

  // Failure scenario: only 8 questions
  const shortValidation = validateInterviewGuide({ questions: dummyQuestions.slice(0, 8) });
  assert.equal(shortValidation.isValid, false);
  assert.ok(shortValidation.errors[0].includes('Expected exactly 10'));
});
