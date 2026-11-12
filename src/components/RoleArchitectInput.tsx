import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Layers,
  Flame,
  Brain,
  Cpu,
  RotateCcw,
  Tag,
  ArrowRight
} from 'lucide-react';
import type {
  RoleInput,
  SeniorityLevel,
  WorkArrangement,
  CompanyVibe,
  GeminiModelChoice,
} from '../types/recruitment';
import { validateRawNotes } from '../utils/recruitment-logic';

interface RoleArchitectInputProps {
  roleInput: RoleInput;
  setRoleInput: React.Dispatch<React.SetStateAction<RoleInput>>;
  onGenerate: () => void;
  isLoading: boolean;
  onSelectPreset: (presetId: string) => void;
  activePresetId?: string;
}

export const RoleArchitectInput: React.FC<RoleArchitectInputProps> = ({
  roleInput,
  setRoleInput,
  onGenerate,
  isLoading,
  onSelectPreset,
  activePresetId,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const validation = validateRawNotes(roleInput.rawNotes);

  const seniorityOptions: SeniorityLevel[] = [
    'Entry-level',
    'Mid-level',
    'Senior',
    'Lead',
    'Staff / Principal',
    'Director / VP',
  ];

  const workOptions: WorkArrangement[] = ['Remote', 'Hybrid', 'On-site'];

  const vibeOptions: CompanyVibe[] = [
    'Fast-paced Startup',
    'High-growth Scaleup',
    'Modern Enterprise',
    'Mission-driven B-Corp',
    'DeepTech & R&D',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Banner & Quick Presets */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Step 1: Role Architect
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Raw Hiring Notes</span>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 flex items-center justify-between">
            <span>Quick Start with Role Templates:</span>
            <span className="text-[11px] text-indigo-600 font-semibold">1-Click Load</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onSelectPreset('fullstack-lead')}
              className={`px-2.5 py-1.5 text-xs rounded-xl border text-left transition-all ${
                activePresetId === 'fullstack-lead'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold truncate">Lead Full-Stack</div>
              <div className="text-[10px] text-slate-500 truncate">React + Node + Scale</div>
            </button>

            <button
              type="button"
              onClick={() => onSelectPreset('product-manager')}
              className={`px-2.5 py-1.5 text-xs rounded-xl border text-left transition-all ${
                activePresetId === 'product-manager'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold truncate">Staff PM</div>
              <div className="text-[10px] text-slate-500 truncate">AI Agent Workflows</div>
            </button>

            <button
              type="button"
              onClick={() => onSelectPreset('director-growth')}
              className={`px-2.5 py-1.5 text-xs rounded-xl border text-left transition-all ${
                activePresetId === 'director-growth'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-medium ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold truncate">Director Growth</div>
              <div className="text-[10px] text-slate-500 truncate">Performance & LTV</div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {/* Role Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Desired Role Title
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={roleInput.jobTitle}
              onChange={(e) => setRoleInput((prev) => ({ ...prev, jobTitle: e.target.value }))}
              placeholder="e.g. Senior Backend Engineer (Distributed Systems)"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 font-medium transition-all"
            />
          </div>
        </div>

        {/* Raw Notes Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>Hiring Manager Raw Notes</span>
              <span className="text-[10px] text-rose-500 font-normal">*Required</span>
            </label>
            <div className="text-[11px] text-slate-400 font-mono">
              {validation.wordCount} words &bull; {validation.characterCount} chars
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={7}
              value={roleInput.rawNotes}
              onChange={(e) => setRoleInput((prev) => ({ ...prev, rawNotes: e.target.value }))}
              placeholder="Paste messy notes, Slack snippets, hiring manager brainstorms, bullet points, tech stack requirements, problems they will solve, cultural pet peeves, or desired candidate traits..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 font-mono text-xs leading-relaxed transition-all resize-y"
            />
            {roleInput.rawNotes && (
              <button
                type="button"
                onClick={() => setRoleInput((prev) => ({ ...prev, rawNotes: '' }))}
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50 transition-colors"
                title="Clear notes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Detected Keywords chips */}
          {validation.detectedKeyTerms.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Detected:
              </span>
              {validation.detectedKeyTerms.slice(0, 6).map((term) => (
                <span
                  key={term}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {term}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick parameters grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Seniority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Seniority Level
            </label>
            <select
              value={roleInput.seniority}
              onChange={(e) =>
                setRoleInput((prev) => ({ ...prev, seniority: e.target.value as SeniorityLevel }))
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              {seniorityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Work Arrangement */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work Location
            </label>
            <select
              value={roleInput.workArrangement}
              onChange={(e) =>
                setRoleInput((prev) => ({ ...prev, workArrangement: e.target.value as WorkArrangement }))
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              {workOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collapsible Details */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Role Calibration Details' : 'Calibrate Compensation, Vibe & Location'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Location / Timezone
                  </label>
                  <div className="relative">
                    <MapPin className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={roleInput.location}
                      onChange={(e) => setRoleInput((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g. San Francisco or Remote US"
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Industry Domain
                  </label>
                  <div className="relative">
                    <Building2 className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={roleInput.industry}
                      onChange={(e) => setRoleInput((prev) => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g. B2B SaaS, HealthTech"
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Target Compensation
                  </label>
                  <div className="relative">
                    <DollarSign className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
                    <input
                      type="text"
                      value={roleInput.compensationRange}
                      onChange={(e) =>
                        setRoleInput((prev) => ({ ...prev, compensationRange: e.target.value }))
                      }
                      placeholder="e.g. $160k - $200k + Equity"
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Company Vibe
                  </label>
                  <select
                    value={roleInput.companyVibe}
                    onChange={(e) =>
                      setRoleInput((prev) => ({ ...prev, companyVibe: e.target.value as CompanyVibe }))
                    }
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  >
                    {vibeOptions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Model & Thinking Mode Configuration */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-violet-50/50 to-blue-50/70 rounded-xl border border-indigo-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-700" />
              <span className="text-xs font-bold text-indigo-950">
                High Thinking Mode
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={roleInput.thinkingMode}
                onChange={(e) =>
                  setRoleInput((prev) => ({
                    ...prev,
                    thinkingMode: e.target.checked,
                    selectedModel: e.target.checked ? 'gemini-4-carbon' : prev.selectedModel,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <p className="text-[11px] text-indigo-900/80 leading-normal">
            Uses <strong>gemini-4-carbon</strong> with <code className="text-[10px] bg-white/70 px-1 py-0.2 rounded font-mono">ThinkingLevel.HIGH</code> for deep behavioral competency extraction, bias reduction, and STAR rubric alignment.
          </p>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 border-t border-indigo-100/70">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-600" /> Model:
            </span>
            <select
              value={roleInput.selectedModel}
              onChange={(e) =>
                setRoleInput((prev) => ({
                  ...prev,
                  selectedModel: e.target.value as GeminiModelChoice,
                  thinkingMode: e.target.value === 'gemini-4-carbon' ? true : prev.thinkingMode,
                }))
              }
              className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-900"
            >
              <option value="gemini-4-carbon">gemini-4-carbon (Deep Reasoning)</option>
              <option value="gemini-4-argon">gemini-4-argon (Complex Interactive)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading || !validation.valid}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Architecting Role with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform text-amber-300" />
              <span>Generate Recruitment Pack</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {!validation.valid && (
          <p className="mt-2 text-[11px] text-center text-rose-500">
            {validation.error}
          </p>
        )}
      </div>
    </div>
  );
};
