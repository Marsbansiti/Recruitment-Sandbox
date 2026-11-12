import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  Cpu,
  User,
  Bot,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  DollarSign,
  UserCheck,
  Briefcase
} from 'lucide-react';
import type {
  ChatMessage,
  CopilotRole,
  GeminiModelChoice,
  GenerationResult,
} from '../types/recruitment';

interface RecruiterCopilotChatProps {
  generationResult: GenerationResult | null;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export const RecruiterCopilotChat: React.FC<RecruiterCopilotChatProps> = ({
  generationResult,
  externalPrompt,
  onClearExternalPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I'm your **Recruitment Sandbox Copilot**. I'm calibrated to help you refine your LinkedIn Job Description, simulate candidate answers to your 10 behavioral interview questions, audit text for bias, or benchmark compensation.\n\nSelect a specialized role or try a quick action below to get started!`,
      modelUsed: 'gemini-3.8-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<CopilotRole>('executive-recruiter');
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.8-flash');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prompts (e.g. from "Simulate in Copilot" button in Interview Guide)
  useEffect(() => {
    if (externalPrompt) {
      setInput(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, onClearExternalPrompt]);

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare payload with conversation history
      const historyPayload = newMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          role,
          model: thinkingMode ? 'gemini-4-carbon' : selectedModel,
          thinkingMode,
          context: generationResult
            ? {
                jobDescription: generationResult.jobDescription,
                guideSummary: `${generationResult.interviewGuide.title} with 10 questions`,
              }
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from Gemini.');
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response returned.',
        modelUsed: data.meta?.modelUsed || selectedModel,
        thinking: data.meta?.thinkingLevel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `Error: ${err?.message || 'Could not connect to Gemini service.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: `History cleared. Ready to assist with your recruitment workflow!`,
          modelUsed: selectedModel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Quick suggestion chips based on active role
  const getPromptSuggestions = () => {
    switch (role) {
      case 'mock-candidate':
        return [
          'Simulate answering Question #1 in the Interview Guide using STAR',
          'Tell me about a time you resolved a high-stakes production outage',
          'How would you handle a disagreement with our product roadmap?',
        ];
      case 'dei-bias-auditor':
        return [
          'Audit our LinkedIn Job Description for gendered or exclusionary words',
          'Evaluate if any qualifications create unnecessary barriers to entry',
          'How can we make the interview evaluation rubric more objective?',
        ];
      case 'comp-leveling-advisor':
        return [
          'Provide market compensation percentiles (P25, P50, P75) for this title in SF & Remote',
          'How should we structure equity vesting vs base salary for a startup offer?',
          'What are the leveling indicators between Senior and Staff for this role?',
        ];
      case 'executive-recruiter':
      default:
        return [
          'Write a 3-step high-converting LinkedIn InMail outreach sequence',
          'Suggest 5 creative Boolean search queries to source passive talent on LinkedIn',
          'How can we tighten the hook of our LinkedIn Job Description?',
        ];
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header bar: Roles & Model controls */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Recruiter Copilot</span>
              <span className="text-[10px] text-slate-400 font-mono">Multi-Turn Chat</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Thinking Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !thinkingMode;
                setThinkingMode(nextState);
                if (nextState) setSelectedModel('gemini-4-carbon');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                thinkingMode
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Toggle Gemini 4 Carbon High Thinking Mode"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>High Thinking</span>
            </button>

            {/* Model Selector */}
            <div className="flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-1 rounded-lg text-slate-700">
              <Cpu className="w-3 h-3 text-indigo-600" />
              <select
                value={thinkingMode ? 'gemini-4-carbon' : selectedModel}
                disabled={thinkingMode}
                onChange={(e) => setSelectedModel(e.target.value as GeminiModelChoice)}
                className="bg-transparent border-0 text-[11px] font-mono text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="gemini-4-carbon">gemini-4-carbon (Deep Reasoning)</option>
                <option value="gemini-4-argon">gemini-4-argon (Complex Interactive)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (General)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Specialized Persona Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setRole('executive-recruiter')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              role === 'executive-recruiter'
                ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Executive Recruiter</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('mock-candidate')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              role === 'mock-candidate'
                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Mock Candidate Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('dei-bias-auditor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              role === 'dei-bias-auditor'
                ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>DEI &amp; Bias Auditor</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('comp-leveling-advisor')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              role === 'comp-leveling-advisor'
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            <span>Comp &amp; Leveling</span>
          </button>
        </div>
      </div>

      {/* Messages Scrollable Thread */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[80%] space-y-1 ${isUser ? 'items-end' : ''}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {/* Model badge & copy button for model messages */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 text-[10px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-indigo-700">
                          {m.modelUsed || selectedModel}
                        </span>
                        {m.thinking && (
                          <span className="bg-indigo-100 text-indigo-800 px-1 rounded text-[9px]">
                            High Thinking
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="hover:text-slate-900 flex items-center gap-0.5 text-slate-400"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                        <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {m.content}
                  </div>
                </div>

                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : ''}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-600 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {thinkingMode ? 'Deep reasoning with gemini-4-carbon...' : 'Reasoning with Gemini...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
        <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">Try:</span>
        {getPromptSuggestions().map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(sug)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40 text-[11px] transition-all"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${role.replace('-', ' ')} or prompt candidate question...`}
            className="w-full pl-3.5 pr-12 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 transition-all"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
