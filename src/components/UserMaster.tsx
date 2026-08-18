import React, { useState, useEffect } from 'react';
import { Users, Trash2, Plus, Shield, Search, Loader2, CheckCircle2, AlertCircle, History, RefreshCw, KeyRound, Lock, UserCheck } from 'lucide-react';

interface WhitelistEntry {
  id: number;
  emailOrDomain: string;
  role: string;
  createdAt: string;
  isRegistered?: boolean;
}

interface AuthLogEntry {
  id: number;
  email: string;
  action: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  reason: string;
  ipAddress?: string;
  createdAt: string;
}

interface UserMasterProps {
  idToken: string;
}

export default function UserMaster({ idToken }: UserMasterProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [authLogs, setAuthLogs] = useState<AuthLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [newEmailOrDomain, setNewEmailOrDomain] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [logFilterQuery, setLogFilterQuery] = useState('');

  const fetchWhitelist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch authorized users master list.');
      }
      const data = await res.json();
      setWhitelist(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to retrieve whitelists.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuthLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/auth-logs', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAuthLogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch auth logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (idToken) {
      fetchWhitelist();
      fetchAuthLogs();
    }
  }, [idToken]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTerm = newEmailOrDomain.trim().toLowerCase();
    if (!cleanTerm) return;

    const isDomain = !cleanTerm.includes('@');
    
    // Support generic email and domain format checking to support any environment hosting
    let isValid = false;
    if (isDomain) {
      isValid = cleanTerm.includes('.') && cleanTerm.length > 3;
    } else {
      isValid = cleanTerm.includes('@') && cleanTerm.split('@')[1].includes('.') && cleanTerm.length > 5;
    }

    if (!isValid) {
      setError('Invalid format. Please enter a valid email address (e.g., user@domain.com) or domain wildcard (e.g., domain.com).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          emailOrDomain: newEmailOrDomain.trim(),
          role: newRole
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to authorize this user email or domain.');
      }

      await res.json();
      setSuccess(`Successfully authorized "${newEmailOrDomain.trim()}" with "${newRole}" permissions.`);
      setNewEmailOrDomain('');
      fetchWhitelist();
      fetchAuthLogs();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save authorization rule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number, term: string) => {
    if (!window.confirm(`Are you sure you want to delete the authorization rule for "${term}"?`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to remove authorization rule.');
      }

      setSuccess(`Authorization rule for "${term}" has been removed successfully.`);
      fetchWhitelist();
      fetchAuthLogs();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to remove authorization.');
    }
  };

  const filteredList = whitelist.filter(entry => 
    entry.emailOrDomain.toLowerCase().includes(filterQuery.toLowerCase()) ||
    entry.role.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredAuthLogs = authLogs.filter(log => 
    log.email.toLowerCase().includes(logFilterQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(logFilterQuery.toLowerCase()) ||
    log.status.toLowerCase().includes(logFilterQuery.toLowerCase()) ||
    log.reason.toLowerCase().includes(logFilterQuery.toLowerCase())
  );

  return (
    <div id="user-master-panel" className="w-full flex-1 p-6 bg-slate-900/10 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-full text-slate-100">
      {/* Left panel: Add new whitelists */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Shield className="text-indigo-400" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Create & Authorize User</h2>
          </div>
          
          <p className="text-xs text-slate-400 leading-normal">
            Authorize a teammate's corporate email address or entire domain wildcard. Once created here, the user can immediately set their password upon logging in.
          </p>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-semibold font-mono mb-1.5">
                User Email or Corporate Domain
              </label>
              <input
                type="text"
                placeholder="E.g., brijesh.jadav@proteustech.in or company.com"
                value={newEmailOrDomain}
                onChange={(e) => setNewEmailOrDomain(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
              />
              <span className="text-[10px] text-amber-500/90 mt-1 block font-mono">
                🔒 Access Control: Only users whitelisted on this index can register or log in.
              </span>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 uppercase font-semibold font-mono mb-1.5">
                Assigned Permission Level
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-indigo-500 outline-none transition-all cursor-pointer"
              >
                <option value="user">User (Lead Discovery & Reporting Access)</option>
                <option value="admin">Admin (Full System & User Master Control)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newEmailOrDomain.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 disabled:bg-slate-800 text-white disabled:text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:translate-y-0.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  <span>Authorizing user...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create / Authorize User</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Onboarding Advice Card */}
        <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-800/40 text-slate-300 text-[11px] leading-relaxed space-y-2">
          <div className="text-indigo-300 font-bold flex items-center gap-1.5 font-mono uppercase text-[10px] tracking-wider">
            <span>🔑</span> How Invited Users Set Password:
          </div>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-400 text-[11px]">
            <li><strong className="text-slate-200">Admin Action:</strong> Create the user here by adding their email (e.g., <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">brijesh.jadav@proteustech.in</code>).</li>
            <li><strong className="text-slate-200">User Login:</strong> When the user visits the app, they click <strong className="text-indigo-300 font-semibold">"Register (Invite Only)"</strong> on the sign-in screen.</li>
            <li><strong className="text-slate-200">Set Password:</strong> The user enters their email and chooses their preferred password (min 6 chars) to activate their account.</li>
          </ol>
        </div>
      </div>

      {/* Right panel: Table list with authorized entries */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Alerts Block */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-xl text-xs flex gap-3 items-start animate-pulse">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-xl text-xs flex gap-3 items-start">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col flex-1 min-h-[400px]">
          {/* Header toolbar with view switching tabs */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users size={14} />
                  <span>Authorized Users ({whitelist.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('logs');
                    fetchAuthLogs();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'logs'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History size={14} />
                  <span>Live Auth Logs ({authLogs.length})</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'users' ? (
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-2.5 top-2 text-slate-500" size={12} />
                  <input
                    type="text"
                    placeholder="Search authorized users..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-350 placeholder-slate-600 outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-48 sm:w-64">
                    <Search className="absolute left-2.5 top-2 text-slate-500" size={12} />
                    <input
                      type="text"
                      placeholder="Search auth logs..."
                      value={logFilterQuery}
                      onChange={(e) => setLogFilterQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-350 placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchAuthLogs}
                    disabled={isLoadingLogs}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-all cursor-pointer"
                    title="Refresh Auth Logs"
                  >
                    <RefreshCw size={13} className={isLoadingLogs ? 'animate-spin text-indigo-400' : ''} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {activeTab === 'users' ? (
              isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-2">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs font-mono">Retrieving User Master Index...</span>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-center select-none">
                  <Users size={32} className="text-slate-700 mb-2" />
                  <p className="text-xs font-mono">No matching authorized user rules exist.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-850/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/10">
                      <th className="p-4 pl-6">Authorized Email / Domain</th>
                      <th className="p-4">Password / Account Status</th>
                      <th className="p-4">Permission</th>
                      <th className="p-4 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40 text-xs">
                    {filteredList.map((entry) => {
                      const isDomain = !entry.emailOrDomain.includes('@');
                      return (
                        <tr 
                          key={entry.id}
                          className="hover:bg-slate-900/20 transition-colors"
                        >
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2">
                              <span 
                                className={`w-2 h-2 rounded-full ${
                                  isDomain 
                                    ? 'bg-indigo-400' 
                                    : entry.isRegistered 
                                    ? 'bg-emerald-400' 
                                    : 'bg-amber-400 animate-pulse'
                                } shrink-0`} 
                              />
                              <span className="font-mono text-slate-200 font-bold">{entry.emailOrDomain}</span>
                              {isDomain && (
                                <span className="text-[9px] bg-indigo-550/10 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.2 rounded font-mono font-semibold">
                                  Org Wildcard
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {isDomain ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
                                Domain Whitelisted
                              </span>
                            ) : entry.isRegistered ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                <CheckCircle2 size={11} className="text-emerald-400" /> Password Set & Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                ⏳ Invited (Pending Password)
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span 
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                entry.role === 'admin'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {entry.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(entry.id, entry.emailOrDomain)}
                              title="Remove authorization rule"
                              className="p-1 text-slate-500 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/20 border border-slate-850 hover:border-rose-900/45 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            ) : (
              /* LIVE AUTH AUDIT LOGS VIEW */
              isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-2">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs font-mono">Fetching Authentication Logs...</span>
                </div>
              ) : filteredAuthLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-center select-none">
                  <History size={32} className="text-slate-700 mb-2" />
                  <p className="text-xs font-mono">No authentication events logged yet.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-850/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/10">
                      <th className="p-4 pl-6">Time</th>
                      <th className="p-4">User Email</th>
                      <th className="p-4">Action Event</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6">Reason / Log Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/40 text-xs font-mono">
                    {filteredAuthLogs.map((log) => {
                      const formattedTime = log.createdAt 
                        ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : 'Just now';
                      const formattedDate = log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : '';

                      return (
                        <tr key={log.id} className="hover:bg-slate-900/20 transition-colors">
                          <td className="p-4 pl-6 text-slate-400 text-[11px] whitespace-nowrap">
                            <div>{formattedTime}</div>
                            <div className="text-[9px] text-slate-600">{formattedDate}</div>
                          </td>
                          <td className="p-4 text-slate-200 font-bold">
                            {log.email}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[10px] font-mono">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4">
                            {log.status === 'SUCCESS' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                <CheckCircle2 size={11} className="text-emerald-400" /> SUCCESS
                              </span>
                            ) : log.status === 'DENIED' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                <AlertCircle size={11} className="text-rose-400" /> DENIED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                <AlertCircle size={11} className="text-amber-400" /> FAILED
                              </span>
                            )}
                          </td>
                          <td className="p-4 pr-6 text-slate-300 text-[11px] max-w-md truncate">
                            {log.reason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>

          {/* Counts metrics */}
          <div className="p-3.5 bg-slate-900/10 border-t border-slate-850 text-[10px] text-slate-500 font-mono text-center flex justify-between items-center px-6">
            {activeTab === 'users' ? (
              <>
                <span>Total Authorized Rules: {whitelist.length}</span>
                <span>Invited users set their password upon initial login</span>
              </>
            ) : (
              <>
                <span>Authentication Events Logged: {authLogs.length}</span>
                <span>Auditing login & invite whitelist checks in real time</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
