import React, { useState } from 'react';
import {
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  Wrench,
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Star,
  Sparkles,
  Filter,
  FileCheck2,
  Play
} from 'lucide-react';
import type { BehavioralQuestion, InterviewGuide } from '../types/recruitment';

interface InterviewGuideViewProps {
  guide: InterviewGuide | null;
  ratings: Record<number, number>;
  setRatings: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  notes: Record<number, string>;
  setNotes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onSimulateInCopilot?: (question: BehavioralQuestion) => void;
  selectedFilterSkill?: string | null;
  onClearSkillFilter?: () => void;
}

export const InterviewGuideView: React.FC<InterviewGuideViewProps> = ({
  guide,
  ratings,
  setRatings,
  notes,
  setNotes,
  onSimulateInCopilot,
  selectedFilterSkill,
  onClearSkillFilter,
}) => {
  const [filterCategory, setFilterCategory] = useState<'All' | 'Hard Skill' | 'Soft Skill'>('All');
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!guide) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileCheck2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Interview Guide Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Input your raw role notes to generate a structured 10-Question Behavioral Interview Guide targeting the exact hard & soft skills in the JD.
        </p>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? true : !prev[id],
    }));
  };

  const handleRating = (id: number, score: number) => {
    setRatings((prev) => ({
      ...prev,
      [id]: prev[id] === score ? 0 : score,
    }));
  };

  const handleNotesChange = (id: number, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  // Filter questions
  const filteredQuestions = guide.questions.filter((q) => {
    if (selectedFilterSkill && !q.targetedSkill.toLowerCase().includes(selectedFilterSkill.toLowerCase())) {
      return false;
    }
    if (filterCategory === 'All') return true;
    return q.category === filterCategory;
  });

  const hardCount = guide.questions.filter((q) => q.category === 'Hard Skill').length;
  const softCount = guide.questions.filter((q) => q.category === 'Soft Skill').length;

  const handleCopyGuide = async () => {
    let text = `# ${guide.title}\nCandidate Level: ${guide.candidateLevel}\n\n`;
    text += `## Overview\n${guide.overview}\n\n`;
    text += `## 10 Behavioral Interview Questions\n\n`;

    guide.questions.forEach((q, idx) => {
      text += `### Question ${idx + 1}: [${q.category.toUpperCase()}] ${q.targetedSkill}\n`;
      text += `**Prompt:** "${q.question}"\n\n`;
      text += `*Why it matters:* ${q.whyItMatters}\n\n`;
      text += `**Green Flags:**\n${q.greenFlags.map((g) => `- ${g}`).join('\n')}\n\n`;
      text += `**Red Flags:**\n${q.redFlags.map((r) => `- ${r}`).join('\n')}\n\n`;
      text += `**Follow-up Probes:**\n${q.followUpProbes.map((p) => `- ${p}`).join('\n')}\n\n`;
      text += `---\n\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              Output 2
            </span>
            <h2 className="text-base font-bold text-slate-900">
              10-Question Behavioral Interview Guide
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            STAR behavioral questions targeting the exact hard & soft skills in the generated JD
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Guide Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 10-Q Guide</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Print Scorecard / Interview Sheet"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Guide Metadata & Category Filter */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <button
            type="button"
            onClick={() => setFilterCategory('All')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              filterCategory === 'All'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All 10 Questions
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('Hard Skill')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterCategory === 'Hard Skill'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <Wrench className="w-3 h-3" />
            <span>Hard Skills ({hardCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('Soft Skill')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterCategory === 'Soft Skill'
                ? 'bg-purple-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
            }`}
          >
            <HeartHandshake className="w-3 h-3" />
            <span>Soft Skills ({softCount})</span>
          </button>
        </div>

        {selectedFilterSkill && (
          <div className="flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
            <span>Filtering by JD: <strong>{selectedFilterSkill}</strong></span>
            <button
              type="button"
              onClick={onClearSkillFilter}
              className="text-indigo-400 hover:text-indigo-800 ml-1 font-bold"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Questions Scrollable List */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedDetails[q.id] ?? true;
          const currentScore = ratings[q.id] || 0;
          const currentNote = notes[q.id] || '';

          return (
            <div
              key={q.id}
              className={`rounded-xl border transition-all ${
                currentScore > 0
                  ? 'border-indigo-300 bg-indigo-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } p-4 sm:p-5 shadow-2xs`}
            >
              {/* Question Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          q.category === 'Hard Skill'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {q.category === 'Hard Skill' ? (
                          <Wrench className="w-3 h-3 text-blue-600" />
                        ) : (
                          <HeartHandshake className="w-3 h-3 text-purple-600" />
                        )}
                        <span>{q.category}: {q.targetedSkill}</span>
                      </span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug pt-0.5">
                      &ldquo;{q.question}&rdquo;
                    </h3>
                  </div>
                </div>

                {/* Simulate button & Expand toggle */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSimulateInCopilot?.(q)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                    title="Roleplay mock candidate answering this question in Copilot chat"
                  >
                    <Play className="w-3 h-3" />
                    <span>Mock Answer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpand(q.id)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Rubrics */}
              {isExpanded && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3 text-xs">
                  {/* Why it matters & Scenario */}
                  <div className="bg-slate-50 p-2.5 rounded-lg text-slate-700">
                    <p className="font-semibold text-slate-900 mb-0.5 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-500" />
                      <span>Why This Question Matters:</span>
                    </p>
                    <p className="leading-relaxed">{q.whyItMatters}</p>
                    {q.starScenarioFocus && (
                      <p className="mt-1 text-slate-500 text-[11px]">
                        <strong>STAR Focus:</strong> {q.starScenarioFocus}
                      </p>
                    )}
                  </div>

                  {/* Green Flags vs Red Flags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Green Flags */}
                    <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                      <p className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Green Flags (What to Look For):</span>
                      </p>
                      <ul className="space-y-1 text-[11px] text-emerald-900 leading-normal">
                        {q.greenFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold shrink-0">&bull;</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Red Flags */}
                    <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                      <p className="font-bold text-rose-950 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Red Flags (Warning Signals):</span>
                      </p>
                      <ul className="space-y-1 text-[11px] text-rose-900 leading-normal">
                        {q.redFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold shrink-0">&bull;</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Follow-up Probes */}
                  {q.followUpProbes?.length > 0 && (
                    <div className="bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100/70">
                      <p className="font-bold text-indigo-950 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Follow-up Probing Questions:</span>
                      </p>
                      <ul className="space-y-0.5 text-[11px] text-indigo-900">
                        {q.followUpProbes.map((probe, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 font-mono">&rarr;</span>
                            <span>&ldquo;{probe}&rdquo;</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Live Interview Evaluation Controls */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Star Rating (1 to 5) */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-600">Candidate Score:</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRating(q.id, star)}
                            className="p-1 hover:scale-115 transition-transform"
                            title={`Rate ${star} / 5`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                currentScore >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {currentScore > 0 && (
                        <span className="text-[11px] font-bold text-slate-800 ml-1">
                          {currentScore}/5
                        </span>
                      )}
                    </div>

                    {/* Quick Candidate Notes */}
                    <div className="flex-1 max-w-sm">
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) => handleNotesChange(q.id, e.target.value)}
                        placeholder="Interviewer notes: specifics, citations, behavioral evidence..."
                        className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
