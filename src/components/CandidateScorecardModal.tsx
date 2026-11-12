import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  User,
  Star,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import type { InterviewGuide } from '../types/recruitment';
import { calculateInterviewScore } from '../utils/recruitment-logic';

interface CandidateScorecardProps {
  guide: InterviewGuide | null;
  ratings: Record<number, number>;
  notes: Record<number, string>;
  setRatings: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setNotes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

export const CandidateScorecard: React.FC<CandidateScorecardProps> = ({
  guide,
  ratings,
  notes,
  setRatings,
  setNotes,
}) => {
  const [candidateName, setCandidateName] = useState('Alex Rivera');
  const [overallFeedback, setOverallFeedback] = useState('');

  if (!guide) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
        <FileSpreadsheet className="w-10 h-10 text-slate-300 mb-2" />
        <h3 className="text-sm font-semibold text-slate-700">No Guide to Score</h3>
        <p className="text-xs text-slate-500 mt-1">
          Generate a Recruitment Pack first to conduct candidate evaluations.
        </p>
      </div>
    );
  }

  const scoreResult = calculateInterviewScore(ratings, guide.questions.length);

  const handleReset = () => {
    if (window.confirm('Reset candidate scorecard ratings and notes?')) {
      setRatings({});
      setNotes({});
      setOverallFeedback('');
    }
  };

  const handleExportEvaluation = () => {
    let content = `CANDIDATE INTERVIEW EVALUATION SCORECARD\n`;
    content += `Candidate Name: ${candidateName || 'Unnamed'}\n`;
    content += `Role: ${guide.title} (${guide.candidateLevel})\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Completion: ${scoreResult.completedCount}/${guide.questions.length} questions rated (${scoreResult.completionPercentage}%)\n`;
    content += `Average Score: ${scoreResult.averageScore} / 5.0\n`;
    content += `Recommendation: ${scoreResult.recommendation.toUpperCase()}\n\n`;
    content += `Overall Interviewer Feedback:\n${overallFeedback || 'None provided.'}\n\n`;
    content += `--- QUESTION-BY-QUESTION BREAKDOWN ---\n`;

    guide.questions.forEach((q) => {
      const score = ratings[q.id] || 'Unrated';
      const note = notes[q.id] || 'No notes taken';
      content += `[Q${q.id}] (${q.category}: ${q.targetedSkill})\n`;
      content += `Prompt: "${q.question}"\n`;
      content += `Score: ${score}/5\n`;
      content += `Interviewer Notes: ${note}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(candidateName || 'candidate').toLowerCase().replace(/\s+/g, '-')}-interview-scorecard.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Live Evaluation
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Candidate Interview Scorecard
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time STAR behavioral assessment scoring & hiring recommendation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Reset ratings"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExportEvaluation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Scorecard</span>
          </button>
        </div>
      </div>

      {/* Summary Score Ribbon */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-white border-b border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          {/* Candidate Name Input */}
          <div className="md:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Candidate Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Candidate name..."
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium">Progress Evaluated</div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-lg font-bold text-slate-800">
                {scoreResult.completedCount} / {guide.questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {scoreResult.completionPercentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${scoreResult.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>Average Rating</span>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900">
                {scoreResult.averageScore > 0 ? scoreResult.averageScore : '—'}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hiring Signal</span>
            </div>
            <div className={`text-base font-black tracking-tight mt-0.5 ${scoreResult.recommendationColor}`}>
              {scoreResult.recommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Questions list with scores */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Scorecard Matrix &amp; Notes
        </h4>

        {guide.questions.map((q) => {
          const score = ratings[q.id] || 0;
          const note = notes[q.id] || '';

          return (
            <div
              key={q.id}
              className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Q{q.id}.</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      q.category === 'Hard Skill'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {q.targetedSkill}
                  </span>
                </div>
                <p className="text-slate-700 text-xs italic">&ldquo;{q.question}&rdquo;</p>
                {note && (
                  <p className="text-slate-500 text-[11px] bg-white p-1.5 rounded border border-slate-100">
                    <strong>Notes:</strong> {note}
                  </p>
                )}
              </div>

              {/* Star selector */}
              <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRatings((prev) => ({
                        ...prev,
                        [q.id]: prev[q.id] === star ? 0 : star,
                      }))
                    }
                    className="p-0.5 hover:scale-120 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        score >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1 font-bold text-slate-700 w-4 text-center">
                  {score > 0 ? score : '-'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Overall Debrief notes */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Overall Debrief &amp; Hiring Committee Summary
          </label>
          <textarea
            rows={3}
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            placeholder="Key strengths demonstrated, technical gaps identified, leveling alignment, cultural fit reflection..."
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
