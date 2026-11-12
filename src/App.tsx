import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleArchitectInput } from './components/RoleArchitectInput';
import { LinkedInJdView } from './components/LinkedInJdView';
import { InterviewGuideView } from './components/InterviewGuideView';
import { RecruiterCopilotChat } from './components/RecruiterCopilotChat';
import { CandidateScorecard } from './components/CandidateScorecardModal';
import type {
  BehavioralQuestion,
  GenerationResult,
  RoleInput,
} from './types/recruitment';
import { formatLinkedInPost } from './utils/recruitment-logic';
import {
  Sparkles,
  AlertCircle,
  Briefcase,
  FileSpreadsheet,
  MessageSquare,
  Award,
  Layers
} from 'lucide-react';

const INITIAL_ROLE_INPUT: RoleInput = {
  rawNotes: `Need a Lead Fullstack dev to head our core transactions pod.
Stack: React 19, TypeScript, Node/Express, PostgreSQL, Redis, Kafka, AWS, Tailwind.
Must have led a team of 4-6 engineers before, run sprint rituals, do code reviews.
Problem we face: Transaction volume 10x-ed in 6 months, UI latency during checkout spikes to 2s on mobile, need someone who knows frontend performance (bundle splitting, optimistic UI) AND can optimize SQL queries & queue backpressure.
Culture: High ownership, zero ego, direct feedback, cross-functional with Product & Design.
Soft skills: Mentoring junior devs, explaining trade-offs to non-technical founders, dealing with ambiguous requirements when a partner API changes without notice.
Perks: $3k WFH stipend, unlimited PTO, premium health/dental, 401k match.`,
  jobTitle: 'Lead Full-Stack Engineer (React & Distributed Systems)',
  seniority: 'Lead',
  workArrangement: 'Hybrid',
  location: 'San Francisco, CA (or Remote US)',
  industry: 'Fintech & Cloud Payments',
  compensationRange: '$180,000 - $225,000 + 0.15% equity',
  companyVibe: 'High-growth Scaleup',
  thinkingMode: true,
  selectedModel: 'gemini-4-carbon',
};

export default function App() {
  const [roleInput, setRoleInput] = useState<RoleInput>(INITIAL_ROLE_INPUT);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'jd' | 'interview' | 'copilot' | 'scorecard'>('jd');

  // Candidate scorecard state (ratings & notes)
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  // Interactive filtering / cross-referencing between JD and Guide
  const [selectedFilterSkill, setSelectedFilterSkill] = useState<string | null>(null);
  const [externalCopilotPrompt, setExternalCopilotPrompt] = useState<string | undefined>(undefined);
  const [activePresetId, setActivePresetId] = useState<string>('fullstack-lead');

  // Handle preset selection
  const handleSelectPreset = async (presetId: string) => {
    setActivePresetId(presetId);
    try {
      const res = await fetch('/api/presets');
      if (res.ok) {
        const data = await res.json();
        const found = data.presets?.find((p: any) => p.id === presetId);
        if (found) {
          setRoleInput((prev) => ({
            ...prev,
            jobTitle: found.title,
            seniority: found.seniority,
            workArrangement: found.workArrangement,
            location: found.location,
            industry: found.industry,
            companyVibe: found.companyVibe,
            compensationRange: found.compensationRange,
            rawNotes: found.rawNotes,
          }));
        }
      }
    } catch {
      // Fallback
    }
  };

  // Generate Recruitment Pack via server-side Gemini API
  const handleGenerate = async () => {
    if (!roleInput.rawNotes.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-recruitment-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleInput),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const data: GenerationResult = await response.json();
      setGenerationResult(data);
      // Reset scorecard for new role
      setRatings({});
      setNotes({});
      setActiveTab('jd');
    } catch (err: any) {
      console.error('Error generating recruitment pack:', err);
      setErrorMessage(
        err?.message || 'Failed to generate recruitment pack. Please verify server connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to generate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isLoading && roleInput.rawNotes.trim().length > 10) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, roleInput]);

  // Export full recruitment pack
  const handleExportPack = () => {
    if (!generationResult) return;
    const { jobDescription, interviewGuide } = generationResult;
    const formattedJD = formatLinkedInPost(jobDescription);

    let doc = `# RECRUITMENT PACK: ${jobDescription.roleTitle.toUpperCase()}\n`;
    doc += `Generated: ${new Date(generationResult.meta.generatedAt).toLocaleString()}\n`;
    doc += `Model: ${generationResult.meta.modelUsed} (${generationResult.meta.thinkingLevel || 'STANDARD'})\n\n`;
    doc += `==========================================================\n`;
    doc += `PART 1: LINKEDIN JOB DESCRIPTION\n`;
    doc += `==========================================================\n\n`;
    doc += `${formattedJD}\n\n`;
    doc += `==========================================================\n`;
    doc += `PART 2: 10-QUESTION BEHAVIORAL INTERVIEW GUIDE\n`;
    doc += `==========================================================\n\n`;
    doc += `Level: ${interviewGuide.candidateLevel}\n`;
    doc += `Overview: ${interviewGuide.overview}\n\n`;

    interviewGuide.questions.forEach((q) => {
      doc += `### Q${q.id}. [${q.category.toUpperCase()}] ${q.targetedSkill}\n`;
      doc += `Question: "${q.question}"\n`;
      doc += `Why it matters: ${q.whyItMatters}\n`;
      doc += `STAR Focus: ${q.starScenarioFocus}\n`;
      doc += `Green Flags:\n${q.greenFlags.map((g) => `  - ${g}`).join('\n')}\n`;
      doc += `Red Flags:\n${q.redFlags.map((r) => `  - ${r}`).join('\n')}\n`;
      doc += `Follow-up Probes:\n${q.followUpProbes.map((p) => `  - ${p}`).join('\n')}\n`;
      if (ratings[q.id]) {
        doc += `Current Score: ${ratings[q.id]}/5 | Notes: ${notes[q.id] || 'None'}\n`;
      }
      doc += `\n`;
    });

    const blob = new Blob([doc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${jobDescription.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-recruitment-pack.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Jump to Copilot with simulated question
  const handleSimulateInCopilot = (question: BehavioralQuestion) => {
    setExternalCopilotPrompt(
      `Please roleplay a realistic, strong candidate answering this behavioral interview question for the ${roleInput.jobTitle} position: "${question.question}". Use the STAR framework (Situation, Task, Action, Result) and demonstrate ${question.targetedSkill}.`
    );
    setActiveTab('copilot');
  };

  // Jump from JD to Copilot
  const handleJumpToCopilotWithPrompt = (prompt: string) => {
    setExternalCopilotPrompt(prompt);
    setActiveTab('copilot');
  };

  // Filter guide questions when a skill pill is clicked in JD
  const handleFilterSkillInGuide = (skillName: string) => {
    setSelectedFilterSkill(skillName);
    setActiveTab('interview');
  };

  const scorecardCount = Object.keys(ratings).filter((k) => ratings[Number(k)] > 0).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <Header
        generationResult={generationResult}
        onExportPack={handleExportPack}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scorecardCount={scorecardCount}
      />

      {/* Error alert */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="font-bold text-rose-500 hover:text-rose-700"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-6.5rem)] min-h-[640px]">
          {/* Left Panel: Role Architect & Raw Notes (5 cols) */}
          <div className="lg:col-span-5 h-full">
            <RoleArchitectInput
              roleInput={roleInput}
              setRoleInput={setRoleInput}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />
          </div>

          {/* Right Panel: Dual Output Sandbox & Copilot (7 cols) */}
          <div className="lg:col-span-7 h-full flex flex-col">
            {activeTab === 'jd' && (
              <LinkedInJdView
                jd={generationResult?.jobDescription || null}
                onJumpToCopilot={handleJumpToCopilotWithPrompt}
                onFilterSkillInGuide={handleFilterSkillInGuide}
              />
            )}

            {activeTab === 'interview' && (
              <InterviewGuideView
                guide={generationResult?.interviewGuide || null}
                ratings={ratings}
                setRatings={setRatings}
                notes={notes}
                setNotes={setNotes}
                onSimulateInCopilot={handleSimulateInCopilot}
                selectedFilterSkill={selectedFilterSkill}
                onClearSkillFilter={() => setSelectedFilterSkill(null)}
              />
            )}

            {activeTab === 'copilot' && (
              <RecruiterCopilotChat
                generationResult={generationResult}
                externalPrompt={externalCopilotPrompt}
                onClearExternalPrompt={() => setExternalCopilotPrompt(undefined)}
              />
            )}

            {activeTab === 'scorecard' && (
              <CandidateScorecard
                guide={generationResult?.interviewGuide || null}
                ratings={ratings}
                notes={notes}
                setRatings={setRatings}
                setNotes={setNotes}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
