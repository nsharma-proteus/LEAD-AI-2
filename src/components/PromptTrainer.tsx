import React, { useState } from 'react';
import { 
  Sliders, 
  Cpu, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  HelpCircle, 
  GraduationCap, 
  ExternalLink 
} from 'lucide-react';
import { CustomDirective, TrainingExample } from '../types';

interface PromptTrainerProps {
  customDirectives: CustomDirective[];
  setCustomDirectives: React.Dispatch<React.SetStateAction<CustomDirective[]>>;
  trainingExamples: TrainingExample[];
  setTrainingExamples: React.Dispatch<React.SetStateAction<TrainingExample[]>>;
  copiedIndex: string | null;
  handleCopyToClipboard: (text: string, type: string) => void;
}

export default function PromptTrainer({
  customDirectives,
  setCustomDirectives,
  trainingExamples,
  setTrainingExamples,
  copiedIndex,
  handleCopyToClipboard
}: PromptTrainerProps) {
  // Input form local states to prevent parent re-renders
  const [newDirective, setNewDirective] = useState<string>("");
  const [newExCompany, setNewExCompany] = useState<string>("");
  const [newExErp, setNewExErp] = useState<string>("");
  const [newExEvidence, setNewExEvidence] = useState<string>("");

  const handleAddDirective = () => {
    if (!newDirective.trim()) return;
    setCustomDirectives(prev => [
      ...prev,
      { id: Date.now().toString(), text: newDirective.trim(), active: true }
    ]);
    setNewDirective("");
  };

  const handleToggleDirective = (id: string) => {
    setCustomDirectives(prev => 
      prev.map(d => d.id === id ? { ...d, active: !d.active } : d)
    );
  };

  const handleDeleteDirective = (id: string) => {
    setCustomDirectives(prev => prev.filter(d => d.id !== id));
  };

  const handleAddExample = () => {
    if (!newExCompany.trim() || !newExErp.trim()) return;
    setTrainingExamples(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        company: newExCompany.trim(),
        erpFound: newExErp.trim(),
        evidence: newExEvidence.trim() || "Observed online technical resume footprint.",
        source: "Manual verification"
      }
    ]);
    setNewExCompany("");
    setNewExErp("");
    setNewExEvidence("");
  };

  const handleDeleteExample = (id: string) => {
    setTrainingExamples(prev => prev.filter(ex => ex.id !== id));
  };

  return (
    <div className="xl:col-span-12 p-6 bg-slate-900/10 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-full w-full">
      
      {/* Left Column: Rules & Info */}
      <div className="lg:col-span-5 flex flex-col gap-6 justify-start">
        
        {/* ELI Header */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-1.5">
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded font-extrabold uppercase inline-block font-mono">
            ELI Context Trainer
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sliders size={15} className="text-indigo-400" />
            Prompt & Align Center
          </h2>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Configure global in-context guidelines and few-shot learning tables. The classifier engine combines these directives with live search indices to output clean ERP matches.
          </p>
        </div>

        {/* CRM API Integration Credentials Card */}
        <div className="bg-indigo-950/20 p-5 rounded-2xl border border-indigo-500/15 space-y-3">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
            <Cpu size={12} className="text-emerald-400 animate-pulse" />
            Active B2B CRM API Integration
          </span>
          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            Stream your verified B2B Pipeline (C-level executives, phone numbers, email coordinates, actionable sales pitches) directly into HubSpot, Salesforce, or Zoho using this secure polling endpoint:
          </p>
          
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-[10px] space-y-1.5 overflow-hidden">
            <div className="flex justify-between items-center text-slate-500 border-b border-slate-900 pb-1.5 font-sans">
              <span>METRIC: GET</span>
              <span className="text-emerald-500 font-semibold text-[9px] uppercase tracking-wider font-mono">Live API Endpoint</span>
            </div>
            <div className="text-slate-300 break-all select-all flex items-center gap-1.5 justify-between py-1 bg-slate-900/40 px-1.5 rounded">
              <span className="truncate">/api/crm/leads?savedOnly=true</span>
              <button 
                onClick={() => {
                  const url = window.location.origin + "/api/crm/leads?savedOnly=true";
                  handleCopyToClipboard(url, 'api-link');
                }}
                className="text-slate-500 hover:text-white shrink-0 cursor-pointer p-0.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 rounded transition-all"
                title="Copy API Link"
              >
                {copiedIndex === 'api-link' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-between text-[10px] text-slate-500 font-sans">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow shadow-emerald-500" />
              Realtime JSON Payloads
            </span>
            <a 
              href="/api/crm/leads" 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-400 hover:underline hover:text-indigo-300 flex items-center gap-0.5"
            >
              Inspect CRM payload <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Custom Directives controller */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 flex justify-between items-center">
              <span>Custom Global Rules / System Directives</span>
              <span className="text-[10px] text-slate-500 font-mono">Applied to searches</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 font-sans">Check or uncheck individual directives to toggle their weight dynamically in search query loops.</p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {customDirectives.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800/80 text-center text-slate-600 text-[11px] font-mono">
                No custom instructions. Enter a strategic rule below.
              </div>
            ) : (
              customDirectives.map((directive, idx) => (
                <div key={`directive-${directive.id}-${idx}`} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 flex items-start gap-2.5 text-xs hover:border-slate-800 transition-all">
                  <input
                    type="checkbox"
                    checked={directive.active}
                    onChange={() => handleToggleDirective(directive.id)}
                    className="mt-0.5 rounded border-slate-800 bg-slate-950 focus:ring-0 text-indigo-600 size-3.5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className={`text-[11px] leading-relaxed font-sans ${directive.active ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                      {directive.text}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteDirective(directive.id)}
                    className="text-slate-500 hover:text-rose-450 transition-colors shrink-0 p-0.5 hover:bg-slate-950 rounded cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Form to add directive */}
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={newDirective}
              onChange={(e) => setNewDirective(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddDirective();
              }}
              placeholder="E.g., Target ERPNext subsidiaries specifically in Germany..."
              className="flex-1 bg-slate-950 border border-slate-850 text-[11px] rounded-xl px-3 py-2 text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={handleAddDirective}
              className="p-2 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white font-semibold transition-all cursor-pointer flex items-center justify-center shrink-0 w-9"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Informational Advisory Note */}
        <div className="bg-slate-950/60 p-4.5 rounded-2xl border border-slate-800 leading-normal">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-1.5 font-mono">
            <GraduationCap size={13} />
            How Context Alignment Works
          </span>
          <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
            By feeding custom guidelines and specific high-fidelity training examples (few-shot weights) directly into the Gemini-3.5-Flash context, you ensure the AI model screens out out-of-date resumes, targets specific executives, and frames actionable sales pitches.
          </p>
        </div>

      </div>

      {/* Right Column: Few-Shot Examples Alignment */}
      <div className="lg:col-span-7 flex flex-col gap-6 justify-start">
        
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex justify-between items-center font-mono">
              <span>Few-Shot Learning Examples / Demonstrations</span>
              <HelpCircle size={12} className="text-slate-500" title="Aligns model outputs with your expected structure directly." />
            </h3>
            <p className="text-[10.5px] text-slate-500 mt-1 font-sans">
              Provide sample outputs to train the classifier on what high-accuracy ERP logs, and timeline checks look like.
            </p>
          </div>

          {/* List of training examples */}
          <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-1">
            {trainingExamples.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-850 bg-slate-900/5 text-center text-slate-550 font-mono text-xs">
                No demo scenarios present. Use the panel below to seed examples.
              </div>
            ) : (
              trainingExamples.map((ex, idx) => (
                <div key={`ex-${ex.id}-${idx}`} className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex flex-col gap-2 relative group hover:border-slate-800 transition-all font-sans text-xs">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow shadow-indigo-400" />
                      <strong className="text-slate-205 text-white">{ex.company}</strong>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-950 text-indigo-400 py-0.5 px-2 rounded border border-indigo-500/15">{ex.erpFound}</span>
                  </div>
                  
                  <p className="text-slate-350 text-[11px] leading-relaxed italic pr-8">
                    &ldquo;{ex.evidence}&rdquo;
                  </p>
                  
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                    <span>Source Authority: {ex.source}</span>
                    <button 
                      onClick={() => handleDeleteExample(ex.id)} 
                      className="text-rose-500 hover:text-rose-400 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form to add few shot ex */}
          <div className="bg-slate-900/35 p-4.5 rounded-2xl border border-slate-850 space-y-3.5">
            <span className="text-[10.5px] font-bold text-slate-300 uppercase tracking-widest font-mono block">
              Inject New Alignment Scenario
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 font-mono">Benchmark Company</label>
                <input
                  type="text"
                  placeholder="E.g. Acme Subsidiary Inc."
                  value={newExCompany}
                  onChange={(e) => setNewExCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-xl p-2.5 text-slate-300 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 font-mono">Target ERP System Class</label>
                <input
                  type="text"
                  placeholder="E.g. Odoo Community v17"
                  value={newExErp}
                  onChange={(e) => setNewExErp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-xs rounded-xl p-2.5 text-slate-300 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 font-mono">Synthesized Evidence Narrative Case study</label>
              <input
                type="text"
                placeholder="E.g. Identified matching Odoo Python repositories and senior developer tenure on LinkedIn..."
                value={newExEvidence}
                onChange={(e) => setNewExEvidence(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 text-xs p-2.5 rounded-xl text-slate-300 outline-none focus:border-indigo-500"
              />
            </div>
            
            <button
              onClick={handleAddExample}
              className="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-650 text-slate-200 hover:text-white font-bold rounded-xl text-[11px] font-mono tracking-wider transition-all cursor-pointer shadow-md"
            >
              INJECT SCENARIO TO ACTIVE WEIGHT CONTEXT
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
