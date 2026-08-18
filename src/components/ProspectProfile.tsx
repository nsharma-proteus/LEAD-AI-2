import React, { useState } from 'react';
import { 
  Building2, 
  ExternalLink, 
  Copy, 
  Check, 
  GraduationCap, 
  BookmarkCheck, 
  CheckCircle2, 
  Lightbulb,
  FileText,
  User,
  Inbox
} from 'lucide-react';
import { LeadResult } from '../types';

interface ProspectProfileProps {
  selectedLead: LeadResult | null;
  syncSelectedAfterEdit: (updatedLead: LeadResult) => void;
  handleCopyToClipboard: (text: string, type: string) => void;
  copiedIndex: string | null;
}

export default function ProspectProfile({
  selectedLead,
  syncSelectedAfterEdit,
  handleCopyToClipboard,
  copiedIndex
}: ProspectProfileProps) {
  // Local sub tab state
  const [detailTab, setDetailTab] = useState<'evidence' | 'edit'>('evidence');

  if (!selectedLead) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-4 border border-dashed border-slate-800/60 rounded-2xl bg-slate-950/20 px-4 text-center h-full min-h-[30rem]">
        <Inbox size={48} className="text-slate-700 animate-pulse" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-400">No Prospect Selected</h3>
          <p className="text-[11px] text-slate-500 font-sans max-w-xs leading-normal">
            Click on any lead row in the center directory list to reveal its full target intelligence profile, temporal CV references, and customized outbound playbook.
          </p>
        </div>
      </div>
    );
  }

  const scoreColor = selectedLead.confidenceScore > 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  return (
    <div id="target-lead-details-pane" className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-5 shadow-2xl h-full flex flex-col justify-start">
      
      {/* Pane Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-900 pb-4 gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/10 shrink-0 mt-0.5">
            <Building2 className="text-indigo-400" size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest font-mono">Prospect Intelligence Dossier</h3>
            <h2 className="text-base font-bold text-white leading-snug truncate" title={selectedLead.company}>{selectedLead.company}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              const updated = { 
                ...selectedLead, 
                isSaved: !selectedLead.isSaved,
                auditedDate: new Date().toISOString().split('T')[0]
              };
              syncSelectedAfterEdit(updated);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              selectedLead.isSaved 
                ? 'bg-emerald-650/20 border-emerald-500 text-emerald-400 shadow-lg' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <span>★ {selectedLead.isSaved ? 'Lead Saved' : 'Save Lead'}</span>
          </button>
          <span className={`text-[10px] border px-2 py-1 rounded-md font-mono font-bold ${scoreColor}`}>
            Score: {selectedLead.confidenceScore}%
          </span>
        </div>
      </div>

      {/* Profile sub tabs */}
      <div className="flex border-b border-slate-900 gap-4 text-xs font-semibold flex-wrap">
        <button
          type="button"
          onClick={() => setDetailTab('evidence')}
          className={`pb-2.5 transition-all cursor-pointer ${
            detailTab === 'evidence' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-500 hover:text-slate-350 font-normal'
          }`}
        >
          🔬 Evidence & Timeline Logs
        </button>
        <button
          type="button"
          onClick={() => setDetailTab('edit')}
          className={`pb-2.5 transition-all cursor-pointer ${
            detailTab === 'edit' 
              ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' 
              : 'text-slate-500 hover:text-slate-350 font-normal'
          }`}
        >
          ✎ Annotations & Verification Overrides
        </button>
      </div>

      {/* Detail Tab Content */}
      <div className="space-y-4 flex-1">
        
        {detailTab === 'evidence' ? (
          <div className="space-y-4">
            
            {/* Synthesized Evidence */}
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mb-1 font-mono">Synthesized Scan Findings</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                {selectedLead.evidence}
              </p>
              {selectedLead.auditorComments && (
                <div className="mt-3 pt-2.5 border-t border-slate-850/80 text-[11px] text-emerald-400 bg-slate-950/30 p-2 rounded-lg">
                  <strong className="text-[9px] uppercase tracking-wider block text-slate-500 font-mono">Auditor annotation override:</strong>
                  &ldquo;{selectedLead.auditorComments}&rdquo;
                </div>
              )}
            </div>

            {/* Coordinates and executive contact */}
            <div className="bg-slate-900/20 p-4 rounded-2xl border border-slate-850 space-y-4">
              
              {/* Corporate metadata coordinates */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block font-mono">🏢 Corporate Footprints</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-xl border border-slate-900 min-w-0">
                    <span className="text-slate-550 font-mono shrink-0 pr-2">Domain:</span>
                    {selectedLead.website ? (
                      <a 
                        href={selectedLead.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 font-mono truncate"
                      >
                        <span className="truncate">{selectedLead.website}</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-650 italic">None logged</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-xl border border-slate-900 min-w-0">
                    <span className="text-slate-550 font-mono shrink-0 pr-2">LinkedIn:</span>
                    {selectedLead.linkedinPage ? (
                      <a 
                        href={selectedLead.linkedinPage} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 font-mono truncate"
                      >
                        <span className="truncate">Company Page</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-650 italic">None logged</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive contact block */}
              <div className="space-y-3 pt-2 border-t border-slate-900">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block font-mono">👑 Key Executive Decision-maker</span>
                {selectedLead.cLevelContact?.name ? (
                  <div className="space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{selectedLead.cLevelContact.name}</h4>
                        <p className="text-[10px] text-indigo-400 font-bold font-mono mt-0.5">{selectedLead.cLevelContact.title}</p>
                      </div>
                      {selectedLead.cLevelContact.linkedin && (
                        <a 
                          href={selectedLead.cLevelContact.linkedin} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-slate-400 hover:text-indigo-400 bg-slate-900 p-1.5 rounded-lg hover:bg-slate-850 border border-slate-800 shrink-0"
                          title="View Executive LinkedIn"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-900/60 font-mono">
                      <div className="bg-slate-900/40 p-2 rounded flex flex-col justify-center min-w-0">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider block">Phone:</span>
                        <span className="text-slate-350 font-medium truncate mt-0.5">{selectedLead.cLevelContact.phone || "Not listed"}</span>
                      </div>
                      <div className="bg-slate-900/40 p-2 rounded flex flex-col justify-center min-w-0 relative group">
                        <span className="text-slate-500 text-[8px] uppercase tracking-wider block">Email:</span>
                        {selectedLead.cLevelContact.email ? (
                          <button 
                            onClick={() => handleCopyToClipboard(selectedLead.cLevelContact!.email, 'email')}
                            className="text-indigo-400 hover:text-indigo-300 hover:underline text-left truncate flex items-center justify-between mt-0.5 w-full bg-transparent border-none outline-none p-0 cursor-pointer"
                          >
                            <span className="truncate">{selectedLead.cLevelContact.email}</span>
                            <Copy size={9} className="ml-1 shrink-0 text-slate-500 group-hover:text-slate-300" />
                          </button>
                        ) : (
                          <span className="text-slate-650 mt-0.5 truncate">Not listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center text-xs italic font-sans leading-normal">
                    No verified corporate officer contact footprint scanned.
                  </div>
                )}
              </div>

            </div>

            {/* Sub listings: Resumes timeline and CRM study lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Resume tracings */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 font-mono">
                  <GraduationCap size={13} className="text-indigo-400 shrink-0" />
                  Temporal CV Mentions Checklist
                </span>
                <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedLead.resumeTraces.length === 0 ? (
                    <li className="text-slate-650 italic text-[11px] bg-slate-900/15 p-3 rounded-xl border border-slate-900 leading-normal">No database CV traces extracted for this firm.</li>
                  ) : (
                    selectedLead.resumeTraces.map((trace, tIdx) => {
                      let badgeStyle = "bg-slate-900 text-slate-400 border-slate-800";
                      let checkLabel = "Unclear Temporal Matches";
                      if (trace.applicableToThisTenure === 'Confirmed') {
                        badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner";
                        checkLabel = "Active Current CV";
                      } else if (trace.applicableToThisTenure === 'Previous Role Only') {
                        badgeStyle = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                        checkLabel = "Prior Work Only";
                      } else if (trace.applicableToThisTenure === 'No Dates') {
                        badgeStyle = "bg-amber-500/10 text-amber-300 border-amber-500/20";
                        checkLabel = "Temporal Omitted";
                      }

                      return (
                        <li key={`trace-${tIdx}`} className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-905 space-y-1.5 leading-normal text-xs">
                          <div className="flex items-start justify-between gap-1 border-b border-sidebar-divider pb-1 text-[11px]">
                            <strong className="text-slate-200 truncate pr-1">{trace.personName}</strong>
                            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeStyle}`}>
                              {checkLabel}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 leading-normal">
                            System footprint: <span className="font-mono text-indigo-305 font-bold text-indigo-400">{trace.erpMentioned}</span>
                          </div>
                          
                          <p className="text-[10px] text-slate-350 italic leading-relaxed bg-slate-950/40 p-2 rounded-lg font-sans">
                            <span className="font-mono text-[8px] uppercase tracking-widest block text-slate-500 not-italic font-bold mb-0.5">Scored Temporal Context:</span>
                            {trace.explanation}
                          </p>

                          {trace.sourceSearchQueryUrl && (
                            <a
                              href={trace.sourceSearchQueryUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline leading-none pt-0.5 font-mono"
                            >
                              <span>Inspect CV audit page</span>
                              <ExternalLink size={8} />
                            </a>
                          )}
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              {/* Vendor reference timeline */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1 font-mono">
                  <BookmarkCheck size={13} className="text-emerald-400 shrink-0" />
                  ERP Vendor Success Reference list
                </span>
                <ul className="space-y-2 text-xs">
                  {selectedLead.vendorMentions.length === 0 ? (
                    <li className="text-slate-650 italic text-[11px] bg-slate-900/15 p-3 rounded-xl border border-slate-900 leading-normal">No official partner success catalogues found.</li>
                  ) : (
                    selectedLead.vendorMentions.map((mention, mIdx) => (
                      <li key={`mention-${mIdx}`} className="bg-slate-900/20 p-2.5 rounded-xl border border-slate-905 text-slate-300 leading-relaxed text-[11px]">
                        {mention}
                      </li>
                    ))
                  )}
                </ul>
              </div>

            </div>

          </div>
        ) : (
          /* Editor Annotatons view */
          <div className="bg-slate-900/10 p-4 rounded-xl border border-slate-850 space-y-4 text-xs font-sans">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1 font-mono">Detected ERP System Stack</label>
                <input
                  type="text"
                  value={selectedLead.erpFound}
                  onChange={(e) => {
                    const updated = { ...selectedLead, erpFound: e.target.value };
                    syncSelectedAfterEdit(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1 font-mono">System Status</label>
                <input
                  type="text"
                  value={selectedLead.status}
                  onChange={(e) => {
                    const updated = { ...selectedLead, status: e.target.value };
                    syncSelectedAfterEdit(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-[9px] uppercase font-bold mb-1 font-mono">Confidence rating score ({selectedLead.confidenceScore}%)</label>
                <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedLead.confidenceScore}
                    onChange={(e) => {
                      const score = parseInt(e.target.value) || 0;
                      const updated = { ...selectedLead, confidenceScore: score };
                      syncSelectedAfterEdit(updated);
                    }}
                    className="flex-1 accent-indigo-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-mono text-slate-300 font-extrabold text-[10px] shrink-0">{selectedLead.confidenceScore}%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1 font-mono">Auditor Web Verification Date</label>
                <input
                  type="text"
                  disabled
                  value={selectedLead.auditedDate || "Not checked"}
                  className="w-full bg-slate-950/60 border border-slate-850 text-[11px] rounded-lg p-2.5 text-slate-500 outline-none cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {/* Corporate coordinate adjustments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1 font-mono">Primary Web Domain</label>
                <input
                  type="text"
                  value={selectedLead.website || ''}
                  onChange={(e) => {
                    const updated = { ...selectedLead, website: e.target.value };
                    syncSelectedAfterEdit(updated);
                  }}
                  placeholder="https://www.example.com"
                  className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              
              <div>
                <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1 font-mono">LinkedIn Corporate Handle</label>
                <input
                  type="text"
                  value={selectedLead.linkedinPage || ''}
                  onChange={(e) => {
                    const updated = { ...selectedLead, linkedinPage: e.target.value };
                    syncSelectedAfterEdit(updated);
                  }}
                  placeholder="https://linkedin.com/company/handle"
                  className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* C-Level profile options */}
            <div className="bg-slate-950/50 p-4 border border-slate-850 rounded-xl space-y-3">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono block">👑 Executive Contact Management</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 text-[8px] uppercase font-bold mb-0.5 font-mono">Full Contact Name</label>
                  <input
                    type="text"
                    value={selectedLead.cLevelContact?.name || ''}
                    onChange={(e) => {
                      const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), name: e.target.value };
                      const updated = { ...selectedLead, cLevelContact: contact };
                      syncSelectedAfterEdit(updated);
                    }}
                    placeholder="John Doe"
                    className="w-full bg-slate-905 bg-slate-900 border border-slate-800 text-[11px] p-2 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[8px] uppercase font-bold mb-0.5 font-mono">Official Corporate Title</label>
                  <input
                    type="text"
                    value={selectedLead.cLevelContact?.title || ''}
                    onChange={(e) => {
                      const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), title: e.target.value };
                      const updated = { ...selectedLead, cLevelContact: contact };
                      syncSelectedAfterEdit(updated);
                    }}
                    placeholder="Chief Information Officer"
                    className="w-full bg-slate-900 border border-slate-800 text-[11px] p-2 rounded-lg text-slate-205 text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div>
                  <label className="block text-slate-600 text-[8px] uppercase font-bold mb-0.5">Phone Call Direct</label>
                  <input
                    type="text"
                    value={selectedLead.cLevelContact?.phone || ''}
                    onChange={(e) => {
                      const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), phone: e.target.value };
                      const updated = { ...selectedLead, cLevelContact: contact };
                      syncSelectedAfterEdit(updated);
                    }}
                    placeholder="+1 555 123"
                    className="w-full bg-slate-900 border border-slate-800 text-[10px] p-1.5 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[8px] uppercase font-bold mb-0.5">Corporate Email</label>
                  <input
                    type="text"
                    value={selectedLead.cLevelContact?.email || ''}
                    onChange={(e) => {
                      const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), email: e.target.value };
                      const updated = { ...selectedLead, cLevelContact: contact };
                      syncSelectedAfterEdit(updated);
                    }}
                    placeholder="email@firm.com"
                    className="w-full bg-slate-900 border border-slate-800 text-[10px] p-1.5 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[8px] uppercase font-bold mb-0.5">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={selectedLead.cLevelContact?.linkedin || ''}
                    onChange={(e) => {
                      const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), linkedin: e.target.value };
                      const updated = { ...selectedLead, cLevelContact: contact };
                      syncSelectedAfterEdit(updated);
                    }}
                    placeholder="https://linkedin.com/..."
                    className="w-full bg-slate-900 border border-slate-800 text-[10px] p-1.5 rounded-lg text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-[9px] uppercase font-bold mb-1 font-mono">Custom Annotation Verification overrides</label>
              <textarea
                rows={2}
                value={selectedLead.auditorComments || ''}
                onChange={(e) => {
                  const updated = { ...selectedLead, auditorComments: e.target.value };
                  syncSelectedAfterEdit(updated);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 hover:border-slate-750 focus:border-indigo-500 resize-none leading-relaxed transition-all outline-none"
                placeholder="Write specific custom verification codes, client responses, or secondary checks here..."
              />
            </div>

            <div>
              <label className="block text-slate-550 text-[9px] uppercase font-bold mb-1 font-mono">Sales Pitch Advisory Pitch Playbook</label>
              <textarea
                rows={2}
                value={selectedLead.actionableSalesPitch}
                onChange={(e) => {
                  const updated = { ...selectedLead, actionableSalesPitch: e.target.value };
                  syncSelectedAfterEdit(updated);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-indigo-200 hover:border-slate-750 focus:border-indigo-500 resize-none leading-relaxed transition-all outline-none"
              />
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-900 border-dashed text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-saved to memory cache</span>
              <span>CRM Ready</span>
            </div>

          </div>
        )}

        {/* Playbook box */}
        <div className="bg-indigo-950/20 rounded-2xl p-4 border border-indigo-500/15 hover:border-indigo-500/25 transition-all">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 font-mono">
              <Lightbulb size={13} className="text-amber-500 animate-pulse shrink-0" />
              Strategic Outreach Pitch Playbook
            </span>
            <button 
              onClick={() => handleCopyToClipboard(selectedLead.actionableSalesPitch, 'pitch')}
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-850 text-[10px] flex items-center gap-1 hover:bg-slate-800 transition-all cursor-pointer"
            >
              {copiedIndex === 'pitch' ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span>Copied Playbook</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy Pitch</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans font-medium">
            {selectedLead.actionableSalesPitch}
          </p>
        </div>

        {/* Sourced Reference links */}
        {selectedLead.sources && selectedLead.sources.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block font-mono">
              Ground references & corroborative URLs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedLead.sources.map((src, sIdx) => (
                <a
                  key={`src-${sIdx}`}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 py-1 px-2.5 rounded-xl border border-slate-850 hover:border-slate-750 text-[10px] flex items-center gap-1 transition-all truncate"
                >
                  <FileText size={10} className="shrink-0 text-slate-500" />
                  <span className="max-w-[12rem] truncate font-medium">{src.title}</span>
                  <ExternalLink size={8} className="shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
