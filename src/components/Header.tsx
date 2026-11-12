import React from 'react';
import { Sparkles, BrainCircuit, FileSpreadsheet, Briefcase, Download, CheckCircle2 } from 'lucide-react';
import type { GenerationResult } from '../types/recruitment';

interface HeaderProps {
  generationResult: GenerationResult | null;
  onExportPack: () => void;
  activeTab: 'jd' | 'interview' | 'copilot' | 'scorecard';
  setActiveTab: (tab: 'jd' | 'interview' | 'copilot' | 'scorecard') => void;
  scorecardCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  generationResult,
  onExportPack,
  activeTab,
  setActiveTab,
  scorecardCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-50">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 tracking-tight text-lg">Recruitment Sandbox</h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Gemini High Thinking
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Raw Notes &rarr; LinkedIn Job Description & 10 Behavioral Interview Questions
            </p>
          </div>
        </div>

        {/* Navigation Tabs (when pack is available or for switching views) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('jd')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'jd'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>LinkedIn JD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'interview'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>10-Q Guide</span>
            {generationResult && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                10
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'copilot'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Copilot Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scorecard')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'scorecard'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scorecard</span>
            {scorecardCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                {scorecardCount}/10
              </span>
            )}
          </button>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-2">
          {generationResult && (
            <button
              type="button"
              onClick={onExportPack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              title="Download entire recruitment pack as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export Pack</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
