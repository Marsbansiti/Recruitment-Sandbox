import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Sparkles,
  Clock,
  Layers,
  Wrench,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import type { LinkedInJobDescription } from '../types/recruitment';
import {
  formatLinkedInPost,
  calculateReadingTimeMinutes,
} from '../utils/recruitment-logic';

interface LinkedInJdViewProps {
  jd: LinkedInJobDescription | null;
  onJumpToCopilot?: (initialPrompt: string) => void;
  onFilterSkillInGuide?: (skillName: string) => void;
}

export const LinkedInJdView: React.FC<LinkedInJdViewProps> = ({
  jd,
  onJumpToCopilot,
  onFilterSkillInGuide,
}) => {
  const [viewMode, setViewMode] = useState<'feed' | 'structured'>('feed');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!jd) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Share2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Job Description Generated Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Input your raw notes on the left and click &ldquo;Generate Recruitment Pack&rdquo; to architect a polished, high-converting LinkedIn Job Description.
        </p>
      </div>
    );
  }

  const formattedLinkedInText = formatLinkedInPost(jd);
  const readingTime = calculateReadingTimeMinutes(formattedLinkedInText);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedLinkedInText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${jd.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-linkedin-jd.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Output 1
            </span>
            <h2 className="text-base font-bold text-slate-900">
              LinkedIn Job Description
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>Tailored for maximum feed engagement & algorithmic reach</span>
            <span className="text-slate-300">&bull;</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Clock className="w-3 h-3 text-slate-400" /> ~{readingTime} min read
            </span>
          </p>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('feed')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'feed'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Feed Simulation
            </button>
            <button
              type="button"
              onClick={() => setViewMode('structured')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'structured'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Document View
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(formattedLinkedInText, 'linkedin')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-2xs transition-colors cursor-pointer"
          >
            {copiedType === 'linkedin' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy for LinkedIn</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Download as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Skills Matrix Ribbon */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" /> Targeted JD Competencies:
        </span>

        {/* Hard Skills pills */}
        <div className="flex flex-wrap items-center gap-1">
          {jd.hardSkills?.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onFilterSkillInGuide?.(skill)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition-colors"
              title="Click to view corresponding question in 10-Q guide"
            >
              <Wrench className="w-2.5 h-2.5 text-blue-500" />
              <span>{skill}</span>
            </button>
          ))}
        </div>

        {/* Soft Skills pills */}
        <div className="flex flex-wrap items-center gap-1">
          {jd.softSkills?.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => onFilterSkillInGuide?.(skill)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100 transition-colors"
              title="Click to view corresponding question in 10-Q guide"
            >
              <HeartHandshake className="w-2.5 h-2.5 text-purple-500" />
              <span>{skill}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        {viewMode === 'feed' ? (
          /* Simulated LinkedIn Post Container */
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
            {/* LinkedIn Author Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
                  TB
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-sm text-slate-900">Talent Acquisition Lead</h3>
                    <span className="text-slate-400">&bull; 1st</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Scaling High-Impact Teams &bull; 2h &bull; 🌐
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onJumpToCopilot?.(`Can you draft a warm 1-to-1 outreach InMail message based on this job description: ${jd.roleTitle}?`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Outreach InMail</span>
              </button>
            </div>

            {/* Post Body */}
            <div className="space-y-4 text-sm text-slate-800 leading-relaxed font-sans">
              {/* Hook */}
              <div>
                <p className="font-bold text-base text-slate-900 tracking-tight">
                  🚀 WE&apos;RE HIRING: {jd.roleTitle.toUpperCase()}
                </p>
                {jd.catchyHeadline && (
                  <p className="text-blue-700 font-semibold mt-1">
                    ✨ {jd.catchyHeadline}
                  </p>
                )}
              </div>

              {/* About & Mission */}
              {jd.aboutRoleAndCompany && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                    📍 About the Role
                  </p>
                  <p>{jd.aboutRoleAndCompany}</p>
                </div>
              )}

              {jd.coreImpactMission && (
                <div>
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1">
                    🎯 The Mission & Impact
                  </p>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {jd.coreImpactMission}
                  </p>
                </div>
              )}

              {/* Responsibilities */}
              {jd.keyResponsibilities?.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
                    💼 What You Will Do
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {jd.keyResponsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hard Skills */}
              {jd.hardSkills?.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
                    🛠️ Tech & Hard Skills
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {jd.hardSkills.map((skill, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Soft Skills */}
              {jd.softSkills?.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
                    🌟 Traits & Core Competencies
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {jd.softSkills.map((skill, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qualifications */}
              {jd.qualifications?.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-1.5">
                    📋 Qualifications
                  </p>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {jd.qualifications.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compensation & Perks */}
              {(jd.compensation || jd.benefitsAndPerks?.length > 0) && (
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs">
                  <p className="font-bold text-emerald-950 uppercase tracking-wider text-[10px] mb-1">
                    🎁 What We Offer
                  </p>
                  {jd.compensation && (
                    <p className="font-semibold text-emerald-900 mb-1">
                      💰 Compensation: {jd.compensation}
                    </p>
                  )}
                  {jd.benefitsAndPerks?.map((perk, idx) => (
                    <div key={idx} className="text-emerald-800 text-xs flex items-center gap-1.5">
                      <span>✓</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Call to action */}
              {jd.callToAction && (
                <div className="pt-2 text-xs font-medium text-slate-800">
                  <span className="font-semibold text-blue-700">👉 How to Apply: </span>
                  {jd.callToAction}
                </div>
              )}

              {/* Hashtags */}
              {jd.linkedinHashtags?.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5 text-xs text-blue-600 font-medium">
                  {jd.linkedinHashtags.map((tag) => (
                    <span key={tag} className="hover:underline cursor-pointer">
                      {tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* LinkedIn Simulated Action Bar */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Like</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comment</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
              >
                <Repeat2 className="w-3.5 h-3.5" />
                <span>Repost</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-blue-600 hover:bg-slate-50 px-2 py-1 rounded transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          /* Structured Markdown Document View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Raw Clean Text Output:</span>
              <button
                type="button"
                onClick={() => handleCopy(formattedLinkedInText, 'raw')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                {copiedType === 'raw' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'raw' ? 'Copied to clipboard' : 'Copy plain text'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap select-all border border-slate-800">
              {formattedLinkedInText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
