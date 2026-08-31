import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  RefreshCw, 
  Database, 
  Cpu, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ArrowUpRight,
  Zap,
  PieChart as PieIcon,
  BarChart3,
  Server,
  Globe,
  Sliders
} from 'lucide-react';

export interface UsageLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userName?: string;
  apiKeyName?: string;
  source: 'web_ui' | 'microservice_api';
  endpoint: string;
  companyCount: number;
  companiesSearched: string[];
  modelUsed: string;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  totalTokens: number;
  googleSearchCalls: number;
  estimatedCostUsd: number;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

export interface UsageAnalytics {
  totalCalls: number;
  totalCompaniesResearched: number;
  totalCostUsd: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalGroundingSearches: number;
  averageLatencyMs: number;
  successRatePercentage: number;
  byUser: Array<{
    userEmail: string;
    calls: number;
    companiesCount: number;
    costUsd: number;
    tokens: number;
    lastActive: string;
  }>;
  byDate: Array<{
    date: string;
    calls: number;
    costUsd: number;
    companiesCount: number;
    tokens: number;
  }>;
  bySource: {
    webUiCalls: number;
    webUiCost: number;
    microserviceCalls: number;
    microserviceCost: number;
  };
  recentLogs: UsageLog[];
}

interface ApiCostManagerProps {
  idToken?: string | null;
  sessionEmail?: string;
}

export const ApiCostManager: React.FC<ApiCostManagerProps> = ({ idToken, sessionEmail }) => {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'web_ui' | 'microservice_api'>('all');
  const [dateRangePreset, setDateRangePreset] = useState<'7d' | '30d' | 'this_month' | 'all' | 'custom'>('30d');
  
  // Custom Date Filters (YYYY-MM-DD)
  const defaultDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }, []);

  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  // Apply Preset Changes
  const handlePresetChange = (preset: '7d' | '30d' | 'this_month' | 'all' | 'custom') => {
    setDateRangePreset(preset);
    const now = new Date();
    const endStr = now.toISOString().split('T')[0];

    if (preset === '7d') {
      const s = new Date();
      s.setDate(now.getDate() - 7);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(endStr);
    } else if (preset === '30d') {
      const s = new Date();
      s.setDate(now.getDate() - 30);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(endStr);
    } else if (preset === 'this_month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(endStr);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedUser && selectedUser !== 'all') params.append('userEmail', selectedUser);
      if (selectedSource && selectedSource !== 'all') params.append('source', selectedSource);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
      if (sessionEmail) headers['x-user-email'] = sessionEmail;

      const res = await fetch(`/api/analytics/usage?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load usage analytics (${res.status})`);
      }
      const data = await res.json();
      if (data.status === 'success' && data.analytics) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Invalid usage analytics response');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching API cost analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedUser, selectedSource, startDate, endDate]);

  // Unique users list for dropdown filter
  const userOptions = useMemo(() => {
    if (!analytics?.byUser) return [];
    return analytics.byUser.map(u => u.userEmail);
  }, [analytics]);

  // Filtered recent logs for live table
  const displayedLogs = useMemo(() => {
    if (!analytics?.recentLogs) return [];
    if (!logSearchQuery.trim()) return analytics.recentLogs;
    const q = logSearchQuery.toLowerCase().trim();
    return analytics.recentLogs.filter(l => 
      l.userEmail.toLowerCase().includes(q) ||
      (l.userName && l.userName.toLowerCase().includes(q)) ||
      (l.apiKeyName && l.apiKeyName.toLowerCase().includes(q)) ||
      l.endpoint.toLowerCase().includes(q) ||
      l.companiesSearched.some(c => c.toLowerCase().includes(q))
    );
  }, [analytics, logSearchQuery]);

  // Export filtered logs to CSV
  const handleExportCsv = () => {
    if (!displayedLogs || displayedLogs.length === 0) return;
    const headers = ['Timestamp', 'User / Client', 'Source', 'Endpoint', 'Companies', 'Tokens', 'Search Calls', 'Estimated Cost (USD)', 'Latency (ms)', 'Status'];
    const rows = displayedLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userEmail}"`,
      `"${l.source}"`,
      `"${l.endpoint}"`,
      `"${l.companiesSearched.join('; ')}"`,
      l.totalTokens,
      l.googleSearchCalls,
      l.estimatedCostUsd.toFixed(4),
      l.latencyMs,
      `"${l.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `proteus_api_usage_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <DollarSign size={13} />
              <span>Real-Time Cost & Quota Controller</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              API Usage & Cost Management
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Track Gemini LLM token consumption, Google Search grounding overhead, and microservice queries with user-level breakdowns and custom date ranges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAnalytics()}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-indigo-400' : ''} />
              <span>Refresh Metrics</span>
            </button>
            <button
              onClick={handleExportCsv}
              disabled={!displayedLogs.length}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* User Filter */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Filter by User / Client</label>
            <div className="relative">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium cursor-pointer"
              >
                <option value="all">All Users & Clients</option>
                {userOptions.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <Users size={13} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Source Filter */}
          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Traffic Source</label>
            <div className="relative">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as any)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none font-medium cursor-pointer"
              >
                <option value="all">All Sources</option>
                <option value="web_ui">Web UI App</option>
                <option value="microservice_api">Microservice API</option>
              </select>
              <Sliders size={13} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Time Range Preset</label>
            <div className="flex bg-slate-900/90 border border-slate-700 p-0.5 rounded-xl">
              {(['7d', '30d', 'this_month', 'all'] as const).map(preset => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                    dateRangePreset === preset
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset === '7d' ? '7D' : preset === '30d' ? '30D' : preset === 'this_month' ? 'Month' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="md:col-span-4 flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>
            <span className="text-slate-500 text-xs mt-5">to</span>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateRangePreset('custom');
                }}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs font-semibold">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total API Cost</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              ${(analytics?.totalCostUsd || 0).toFixed(4)}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">USD</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            LLM Tokens + Google Search Grounding charges
          </p>
        </div>

        {/* Total Calls */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Invocations</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {analytics?.totalCalls || 0}
            </span>
            <span className="text-[11px] text-indigo-400 font-semibold">requests</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Companies Researched:</span>
            <span className="text-slate-300 font-bold">{analytics?.totalCompaniesResearched || 0}</span>
          </div>
        </div>

        {/* Token Volume */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-violet-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Token Volume</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Cpu size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {((analytics?.totalTokens || 0) / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-violet-400 font-semibold">tokens</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>In: {((analytics?.totalPromptTokens || 0) / 1000).toFixed(1)}k</span>
            <span>Out: {((analytics?.totalCompletionTokens || 0) / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Avg Latency & Success */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Performance</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {analytics?.averageLatencyMs ? (analytics.averageLatencyMs / 1000).toFixed(1) : '0.0'}s
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">avg speed</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Success Rate:</span>
            <span className="text-emerald-400 font-bold">{analytics?.successRatePercentage || 100}%</span>
          </div>
        </div>
      </div>

      {/* Breakdown Section: By User & By Date Daily Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User-Level Cost Breakdown Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">User & Client Cost Attribution</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Sorted by highest spend</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">User / Client Email</th>
                  <th className="py-2.5 px-3 text-right">Invocations</th>
                  <th className="py-2.5 px-3 text-right">Companies</th>
                  <th className="py-2.5 px-3 text-right">Tokens</th>
                  <th className="py-2.5 px-3 text-right text-emerald-400">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {analytics?.byUser && analytics.byUser.length > 0 ? (
                  analytics.byUser.map((user, idx) => (
                    <tr key={user.userEmail} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                            {user.userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white block font-mono">{user.userEmail}</span>
                            <span className="text-[10px] text-slate-500">
                              Last active: {new Date(user.lastActive).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                        {user.calls}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {user.companiesCount}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {(user.tokens / 1000).toFixed(1)}k
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        ${user.costUsd.toFixed(4)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No usage data found for the selected user/date filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Source & Daily Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Source Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon size={16} className="text-violet-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Source Breakdown</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* Web UI */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Globe size={13} className="text-blue-400" /> Web UI Application
                  </span>
                  <span className="font-mono text-slate-400">
                    {analytics?.bySource?.webUiCalls || 0} calls • <strong className="text-emerald-400">${(analytics?.bySource?.webUiCost || 0).toFixed(4)}</strong>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${analytics?.totalCalls ? ((analytics.bySource.webUiCalls / analytics.totalCalls) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Microservice API */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Cpu size={13} className="text-violet-400" /> Microservice Gateway (Proteus Lead AI)
                  </span>
                  <span className="font-mono text-slate-400">
                    {analytics?.bySource?.microserviceCalls || 0} calls • <strong className="text-emerald-400">${(analytics?.bySource?.microserviceCost || 0).toFixed(4)}</strong>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${analytics?.totalCalls ? ((analytics.bySource.microserviceCalls / analytics.totalCalls) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200 block mb-0.5">Budget Alert / Cost Safeguards:</strong>
              Average research query costs approx. <strong>$0.038 USD</strong> (including live Google web grounding search verification).
            </div>
          </div>

          {/* Daily Trend List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Daily Cost Velocity</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Past Days</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {analytics?.byDate && analytics.byDate.length > 0 ? (
                analytics.byDate.slice(-7).reverse().map(d => (
                  <div key={d.date} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 font-mono text-slate-300">
                      <Calendar size={12} className="text-slate-500" />
                      <span>{d.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-slate-400 font-mono">{d.calls} calls</span>
                      <span className="text-emerald-400 font-bold font-mono">${d.costUsd.toFixed(4)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-500">No daily logs recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Live API Call Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database size={15} className="text-indigo-400" />
              <span>Detailed Request & Cost Audit Log</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Showing {displayedLogs.length} audit entries matching your criteria
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search user, company, key..."
              value={logSearchQuery}
              onChange={(e) => setLogSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User / Client</th>
                <th className="py-2.5 px-3">Endpoint & Source</th>
                <th className="py-2.5 px-3">Companies Searched</th>
                <th className="py-2.5 px-3 text-right">Tokens</th>
                <th className="py-2.5 px-3 text-right">Latency</th>
                <th className="py-2.5 px-3 text-right text-emerald-400">Est. Cost</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {displayedLogs.length > 0 ? (
                displayedLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-white font-medium block text-xs truncate max-w-[180px]">
                        {log.userEmail}
                      </span>
                      {log.apiKeyName && (
                        <span className="text-[10px] text-violet-400 font-mono">{log.apiKeyName}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="text-slate-300 font-mono text-[11px] block">{log.endpoint}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        log.source === 'microservice_api' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.source === 'microservice_api' ? 'REST Microservice' : 'Web UI'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {log.companiesSearched.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-200 truncate max-w-[120px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {log.totalTokens.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 text-[11px]">
                      ${log.estimatedCostUsd.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                          <CheckCircle2 size={11} /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[10px]" title={log.errorMessage}>
                          <AlertCircle size={11} /> Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center font-sans text-slate-500 text-xs">
                    No matching API execution records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
