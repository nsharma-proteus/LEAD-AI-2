import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Code, 
  Globe, 
  Send, 
  Sparkles, 
  Server,
  Layers,
  Database,
  ExternalLink,
  BookOpen,
  Cpu
} from 'lucide-react';

interface ApiKeyItem {
  id: number;
  key: string;
  maskedKey: string;
  fullKey: string;
  name: string;
  role: 'admin' | 'service';
  status: 'active' | 'revoked';
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string | null;
  usageCount: number;
}

interface MicroserviceHubProps {
  idToken?: string;
  sessionEmail?: string;
}

export function MicroserviceHub({ idToken, sessionEmail }: MicroserviceHubProps) {
  // Navigation sub-views: 'playground' | 'keys' | 'docs' | 'snippets'
  const [activeSubTab, setActiveSubTab] = useState<'playground' | 'keys' | 'docs' | 'snippets'>('playground');
  
  // API Keys state
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState<boolean>(false);
  const [selectedKeyForTest, setSelectedKeyForTest] = useState<string>('proteus_live_sec_master_ai_2026');
  const [newKeyName, setNewKeyName] = useState<string>('Proteus Lead AI Master Client');
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);
  
  // Copy helper states
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Playground input states
  const [playgroundCompanies, setPlaygroundCompanies] = useState<string>(
    'Reliance Industries\nTata Steel\nMahindra & Mahindra'
  );
  const [playgroundContactLookup, setPlaygroundContactLookup] = useState<string>('CIO, IT Director, Head of ERP');
  const [playgroundAdvisoryPrompt, setPlaygroundAdvisoryPrompt] = useState<string>(
    'Focus specifically on SAP S/4HANA or ERPNext migration signals and current technology leadership in India.'
  );
  const [playgroundSaveDb, setPlaygroundSaveDb] = useState<boolean>(true);

  // Playground execution states
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [snippetLanguage, setSnippetLanguage] = useState<'nodejs' | 'python' | 'curl'>('nodejs');

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.run.app';
  const apiEndpointUrl = `${originUrl}/api/v1/leads/discover`;

  // Fetch API keys
  const fetchKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      } else {
        headers['Authorization'] = `Bearer master-admin-token`;
      }

      const res = await fetch('/api/v1/keys', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.keys)) {
          setKeys(data.keys);
          if (data.keys.length > 0 && !selectedKeyForTest) {
            setSelectedKeyForTest(data.keys[0].fullKey || data.keys[0].key);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [idToken]);

  // Generate new key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsGeneratingKey(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      } else {
        headers['Authorization'] = `Bearer master-admin-token`;
      }

      const res = await fetch('/api/v1/keys/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newKeyName.trim(),
          role: 'service'
        })
      });

      if (res.ok) {
        setNewKeyName('');
        await fetchKeys();
      }
    } catch (err) {
      console.error('Error generating API key:', err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Revoke key
  const handleRevokeKey = async (id: number) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      } else {
        headers['Authorization'] = `Bearer master-admin-token`;
      }

      const res = await fetch('/api/v1/keys/revoke', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        await fetchKeys();
      }
    } catch (err) {
      console.error('Error revoking API key:', err);
    }
  };

  // Copy helper
  const handleCopyText = (text: string, type: 'endpoint' | 'key' | 'snippet' | 'payload', keyId?: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'endpoint') {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } else if (type === 'key' && keyId) {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } else if (type === 'snippet') {
      setCopiedSnippet(text);
      setTimeout(() => setCopiedSnippet(null), 2000);
    } else if (type === 'payload') {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  // Execute Live Test from Playground
  const handleRunPlaygroundTest = async () => {
    setIsTestingApi(true);
    setTestError(null);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const companies = playgroundCompanies
        .split('\n')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (companies.length === 0) {
        setTestError('Please provide at least one target company.');
        setIsTestingApi(false);
        return;
      }

      const requestBody = {
        targetCompanies: companies,
        contactLookup: playgroundContactLookup.trim() || undefined,
        supplementalPrompt: playgroundAdvisoryPrompt.trim() || undefined,
        options: {
          saveToDatabase: playgroundSaveDb,
          includeConfidenceBreakdown: true,
          maxLeadsPerCompany: 3
        }
      };

      const keyToUse = selectedKeyForTest || 'proteus_live_sec_master_ai_2026';

      const res = await fetch('/api/v1/leads/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keyToUse}`
        },
        body: JSON.stringify(requestBody)
      });

      const endTime = performance.now();
      setTestLatency(Math.round(endTime - startTime));

      const data = await res.json();
      if (!res.ok) {
        setTestError(data.message || data.error || `HTTP ${res.status} Error`);
      } else {
        setTestResult(data);
      }
    } catch (err: any) {
      setTestError(err.message || 'Network error occurred while calling the microservice.');
    } finally {
      setIsTestingApi(false);
    }
  };

  // Construct request JSON for display
  const currentRequestPayload = {
    targetCompanies: playgroundCompanies.split('\n').map(c => c.trim()).filter(Boolean),
    contactLookup: playgroundContactLookup.trim() || undefined,
    supplementalPrompt: playgroundAdvisoryPrompt.trim() || undefined,
    options: {
      saveToDatabase: playgroundSaveDb,
      includeConfidenceBreakdown: true,
      maxLeadsPerCompany: 3
    }
  };

  // Ready-to-copy code snippets
  const snippetNodeJs = `// In your new app "Proteus Lead AI":
// 1. Install axios (or use native fetch)
// 2. Call the microservice endpoint

async function discoverLeadsWithProteusAI() {
  const MICROSERVICE_URL = "${apiEndpointUrl}";
  const API_KEY = "${selectedKeyForTest || 'proteus_live_sec_master_ai_2026'}";

  const payload = {
    targetCompanies: [
      "Reliance Industries",
      "Tata Steel",
      "Mahindra & Mahindra"
    ],
    contactLookup: "CIO, IT Director, Head of ERP",
    supplementalPrompt: "Focus on SAP S/4HANA or ERPNext migration signals in India.",
    options: {
      saveToDatabase: true,
      includeConfidenceBreakdown: true,
      maxLeadsPerCompany: 3
    }
  };

  try {
    const response = await fetch(MICROSERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${API_KEY}\`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === 'success') {
      console.log(\`Successfully discovered \${result.totalLeads} enriched leads:\`, result.data);
      return result.data;
    } else {
      console.error('Microservice Error:', result.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Call the function
discoverLeadsWithProteusAI();`;

  const snippetPython = `# In your new app "Proteus Lead AI" (Python):
import requests
import json

MICROSERVICE_URL = "${apiEndpointUrl}"
API_KEY = "${selectedKeyForTest || 'proteus_live_sec_master_ai_2026'}"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

payload = {
    "targetCompanies": [
        "Reliance Industries",
        "Tata Steel",
        "Mahindra & Mahindra"
    ],
    "contactLookup": "CIO, IT Director, Head of ERP",
    "supplementalPrompt": "Focus on SAP S/4HANA or ERPNext migration signals in India.",
    "options": {
        "saveToDatabase": True,
        "includeConfidenceBreakdown": True,
        "maxLeadsPerCompany": 3
    }
}

response = requests.post(MICROSERVICE_URL, headers=headers, json=payload)
data = response.json()

if response.status_code == 200 and data.get("status") == "success":
    print(f"Total Leads Retrieved: {data.get('totalLeads')}")
    for lead in data.get("data", []):
        print(f"-> Company: {lead['companyName']} | ERP: {lead['erpStack']['primarySystem']} | Score: {lead['erpStack']['confidenceScore']}%")
else:
    print(f"Error calling microservice: {data.get('message', response.text)}")`;

  const snippetCurl = `curl -X POST "${apiEndpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${selectedKeyForTest || 'proteus_live_sec_master_ai_2026'}" \\
  -d '{
    "targetCompanies": [
      "Reliance Industries",
      "Tata Steel",
      "Mahindra & Mahindra"
    ],
    "contactLookup": "CIO, IT Director, Head of ERP",
    "supplementalPrompt": "Focus on SAP S/4HANA or ERPNext migration signals in India.",
    "options": {
      "saveToDatabase": true,
      "includeConfidenceBreakdown": true,
      "maxLeadsPerCompany": 3
    }
  }'`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-950 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-800/50 font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Cpu size={12} className="text-indigo-400" />
                REST Microservice Gateway v1.0
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full border border-emerald-800/50 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live & Authenticated
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Microservice Connector for <span className="text-indigo-400 font-extrabold">&ldquo;Proteus Lead AI&rdquo;</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              This application functions as a high-performance backend intelligence microservice. Your upcoming app can send target companies, executive search criteria, and advisory prompts, receiving enriched lead objects, ERP stack telemetry, and contact info in a standardized JSON payload.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Microservice Base Endpoint</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{apiEndpointUrl}</span>
            </div>
            <button
              onClick={() => handleCopyText(apiEndpointUrl, 'endpoint')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Copy endpoint URL"
            >
              {copiedEndpoint ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 flex-wrap">
          <button
            onClick={() => setActiveSubTab('playground')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'playground'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Play size={13} className={activeSubTab === 'playground' ? 'text-amber-300' : 'text-slate-400'} />
            <span>Interactive Test Playground</span>
          </button>

          <button
            onClick={() => setActiveSubTab('keys')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'keys'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Key size={13} className={activeSubTab === 'keys' ? 'text-amber-200' : 'text-slate-400'} />
            <span>API Keys & Key Vault ({keys.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('snippets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'snippets'
                ? 'bg-emerald-650 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Code size={13} className={activeSubTab === 'snippets' ? 'text-emerald-200' : 'text-slate-400'} />
            <span>Ready-to-Copy Code Snippets</span>
          </button>

          <button
            onClick={() => setActiveSubTab('docs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'docs'
                ? 'bg-sky-650 text-white shadow-md shadow-sky-900/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <BookOpen size={13} className={activeSubTab === 'docs' ? 'text-sky-200' : 'text-slate-400'} />
            <span>API Documentation & Checklist</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PLAYGROUND & TEST CONSOLE */}
      {/* ========================================================================= */}
      {activeSubTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Request Builder */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Microservice Input Parameters</h3>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">POST /api/v1/leads/discover</span>
              </div>

              {/* Select Active Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Authenticate With API Key</span>
                  <span className="text-[10px] text-slate-400 font-normal">Passed in Bearer header</span>
                </label>
                <select
                  value={selectedKeyForTest}
                  onChange={(e) => setSelectedKeyForTest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                >
                  <option value="proteus_live_sec_master_ai_2026">proteus_live_sec_master_ai_2026 (Default Master Key)</option>
                  {keys.map((k) => (
                    <option key={k.id} value={k.fullKey || k.key}>
                      {k.name} ({k.maskedKey})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Companies (One per line) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Target Companies (One per line)</span>
                  <span className="text-[10px] text-indigo-400 font-bold">Required</span>
                </label>
                <textarea
                  rows={4}
                  value={playgroundCompanies}
                  onChange={(e) => setPlaygroundCompanies(e.target.value)}
                  placeholder="e.g. Reliance Industries&#10;Tata Steel&#10;Mahindra & Mahindra"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Contact Person Lookup (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Contact Person Lookup (Optional)</span>
                  <span className="text-[10px] text-slate-400">e.g. CIO, Head of ERP</span>
                </label>
                <input
                  type="text"
                  value={playgroundContactLookup}
                  onChange={(e) => setPlaygroundContactLookup(e.target.value)}
                  placeholder="e.g. CIO, IT Director, Head of ERP"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Supplemental Advisory Prompt (Refine Search Query) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Supplemental Advisory Prompt</span>
                  <span className="text-[10px] text-slate-400">Refine Search Focus</span>
                </label>
                <textarea
                  rows={3}
                  value={playgroundAdvisoryPrompt}
                  onChange={(e) => setPlaygroundAdvisoryPrompt(e.target.value)}
                  placeholder="e.g. Focus specifically on SAP S/4HANA or ERPNext migration signals..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Auto Save to Cloud SQL Database */}
              <label className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={playgroundSaveDb}
                  onChange={(e) => setPlaygroundSaveDb(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Automatically Persist Discovered Leads</span>
                  <span className="text-[10px] text-slate-400">Saves records directly to Cloud SQL PostgreSQL database</span>
                </div>
              </label>

              {/* Test Button */}
              <button
                type="button"
                onClick={handleRunPlaygroundTest}
                disabled={isTestingApi}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
              >
                {isTestingApi ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-amber-300" />
                    <span>Executing Live Microservice AI Search...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} className="text-amber-300" />
                    <span>Test Microservice API Live</span>
                  </>
                )}
              </button>
            </div>

            {/* Request Payload Preview Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">Payload Sent by &ldquo;Proteus Lead AI&rdquo;</span>
                <button
                  onClick={() => handleCopyText(JSON.stringify(currentRequestPayload, null, 2), 'payload')}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedPayload ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 p-3 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 border border-slate-800/80">
                {JSON.stringify(currentRequestPayload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Right: Live Returned Response Payload Viewer */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex-1 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Live Microservice Response Payload</h3>
                </div>

                <div className="flex items-center gap-2">
                  {testLatency !== null && (
                    <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      Latency: <strong className="text-emerald-400">{testLatency}ms</strong>
                    </span>
                  )}
                  {testResult && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono font-bold">
                      200 OK
                    </span>
                  )}
                </div>
              </div>

              {testError && (
                <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Error Response Returned:</span>
                  </div>
                  <p className="font-mono">{testError}</p>
                </div>
              )}

              {testResult ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Lead Summary Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Leads Returned</span>
                      <span className="text-lg font-bold text-white">{testResult.totalLeads || 0}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Status</span>
                      <span className="text-lg font-bold text-emerald-400">{testResult.status?.toUpperCase()}</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Authenticated As</span>
                      <span className="text-xs font-bold text-indigo-300 truncate block mt-1">{testResult.microservice?.authenticatedClient || 'Master Client'}</span>
                    </div>
                  </div>

                  {/* Formatted JSON Output */}
                  <div className="relative flex-1 flex flex-col">
                    <div className="flex items-center justify-between bg-slate-900/90 px-3 py-1.5 rounded-t-xl border-t border-x border-slate-800 text-[10px] font-mono text-slate-400">
                      <span>HTTP 200 • application/json</span>
                      <button
                        onClick={() => handleCopyText(JSON.stringify(testResult, null, 2), 'payload')}
                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={11} />
                        <span>Copy Response JSON</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900/70 p-4 rounded-b-xl text-xs font-mono text-emerald-300/90 overflow-y-auto max-h-[420px] border border-slate-800 leading-relaxed select-all">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : !isTestingApi ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-3">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
                    <Send size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-300">Ready to Test Microservice</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Click the &ldquo;Test Microservice API Live&rdquo; button to execute a real live lookup and inspect the returned payload.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                  <RefreshCw size={28} className="animate-spin text-indigo-400" />
                  <p className="text-xs font-mono">Querying web, ERP directories & LinkedIn traces...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. API KEYS & KEY VAULT */}
      {/* ========================================================================= */}
      {activeSubTab === 'keys' && (
        <div className="space-y-6">
          {/* Create New Key Box */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Key size={16} className="text-amber-400" />
              <span>Generate API Key for &ldquo;Proteus Lead AI&rdquo;</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create unique API keys to grant external apps and microservice clients authenticated access to the Lead Intelligence engine.
            </p>

            <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Proteus Lead AI Production Engine"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isGeneratingKey || !newKeyName.trim()}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                {isGeneratingKey ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Plus size={13} />
                )}
                <span>Generate New API Key</span>
              </button>
            </form>
          </div>

          {/* Active Keys Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Active API Keys</h4>
              </div>
              <button
                onClick={fetchKeys}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Refresh keys"
              >
                <RefreshCw size={13} className={isLoadingKeys ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Key Label & Details</th>
                    <th className="py-3 px-4">API Token Key</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Created By</th>
                    <th className="py-3 px-4">Usage Count</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{k.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Created: {new Date(k.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-amber-300 text-[11px]">
                            {k.maskedKey || k.key}
                          </span>
                          <button
                            onClick={() => handleCopyText(k.fullKey || k.key, 'key', k.id)}
                            className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
                            title="Copy full key"
                          >
                            {copiedKeyId === k.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          {k.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">{k.createdBy}</td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-slate-300 font-bold">{k.usageCount || 0}</span> calls
                      </td>

                      <td className="py-3 px-4 text-right">
                        {k.key !== 'proteus_live_sec_master_ai_2026' && (
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                            title="Revoke Key"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. READY-TO-COPY CODE SNIPPETS */}
      {/* ========================================================================= */}
      {activeSubTab === 'snippets' && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code size={16} className="text-emerald-400" />
                <span>Integration Snippets for Developers</span>
              </h3>
              <p className="text-xs text-slate-400">
                Give these code snippets to the development team building &ldquo;Proteus Lead AI&rdquo;.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSnippetLanguage('nodejs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  snippetLanguage === 'nodejs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Node.js / JS
              </button>
              <button
                onClick={() => setSnippetLanguage('python')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  snippetLanguage === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setSnippetLanguage('curl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  snippetLanguage === 'curl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                cURL
              </button>
            </div>
          </div>

          {/* Snippet Display */}
          <div className="relative">
            <button
              onClick={() =>
                handleCopyText(
                  snippetLanguage === 'nodejs'
                    ? snippetNodeJs
                    : snippetLanguage === 'python'
                    ? snippetPython
                    : snippetCurl,
                  'snippet'
                )
              }
              className="absolute top-3 right-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer z-10"
            >
              {copiedSnippet ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedSnippet ? 'Copied Code' : 'Copy Snippet'}</span>
            </button>

            <pre className="bg-slate-900 p-5 rounded-2xl text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800 leading-relaxed">
              {snippetLanguage === 'nodejs' && snippetNodeJs}
              {snippetLanguage === 'python' && snippetPython}
              {snippetLanguage === 'curl' && snippetCurl}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCUMENTATION & IMPLEMENTATION CHECKLIST */}
      {/* ========================================================================= */}
      {activeSubTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Developer Step-by-Step Checklist */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers size={16} className="text-indigo-400" />
              <span>3-Step Checklist for &ldquo;Proteus Lead AI&rdquo; Developers</span>
            </h3>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <strong className="text-white block mb-1">Set Environment Variables in the new app</strong>
                  <p className="text-slate-400">
                    Store the microservice URL and API key in the new app&rsquo;s <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">.env</code> file:
                  </p>
                  <pre className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-slate-300 mt-2 border border-slate-800">
                    LEAD_ENGINE_URL={originUrl}&#10;LEAD_ENGINE_API_KEY={selectedKeyForTest || 'proteus_live_sec_master_ai_2026'}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <strong className="text-white block mb-1">Create API Client Function</strong>
                  <p className="text-slate-400">
                    Construct a standard HTTP request to <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">POST /api/v1/leads/discover</code> passing the Bearer token in the Authorization header.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <strong className="text-white block mb-1">Consume and Display Enriched Leads</strong>
                  <p className="text-slate-400">
                    Parse the <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300 font-mono">data</code> array in the response to render the leads, contacts, ERP stacks, and pitch hooks in the Proteus Lead AI interface.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schema & Field Definitions */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database size={16} className="text-emerald-400" />
              <span>Request & Response Specification</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-slate-200 block mb-1">Request Parameters</strong>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-300">targetCompanies</strong> (Array or Multiline String): List of company names.</li>
                  <li><strong className="text-slate-300">contactLookup</strong> (String, Optional): Executive designations to search for.</li>
                  <li><strong className="text-slate-300">supplementalPrompt</strong> (String, Optional): Advisory search instructions.</li>
                  <li><strong className="text-slate-300">options.saveToDatabase</strong> (Boolean): Automatically saves records to database.</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <strong className="text-slate-200 block mb-1">Returned Lead Object Fields</strong>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li><strong className="text-slate-300">companyName, domain, website, linkedinPage</strong>: Verified digital identifiers.</li>
                  <li><strong className="text-slate-300">erpStack</strong>: Primary ERP (SAP, ERPNext, Odoo, etc.), confidence score (0-100), and evidence.</li>
                  <li><strong className="text-slate-300">contacts</strong>: Array of executive profiles with verified email and phone.</li>
                  <li><strong className="text-slate-300">resumeTraces</strong>: LinkedIn resume traces with strict employment tenure chronological checks.</li>
                  <li><strong className="text-slate-300">salesPitch</strong>: Actionable customized sales pitch hook for outbound sales.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
