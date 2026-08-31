import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  Users,
  Settings, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Cpu, 
  Sliders, 
  Lightbulb, 
  ArrowRight, 
  GraduationCap, 
  RefreshCw, 
  HelpCircle, 
  Play, 
  BookmarkCheck, 
  AlertCircle,
  FileSpreadsheet,
  Database,
  Table,
  Terminal,
  Layers,
  TrendingUp,
  RotateCcw,
  FileText,
  CheckSquare,
  Upload,
  Download,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut,
  emailPasswordSignIn,
  emailPasswordSignUp,
  exportLeadsToSheet,
  auth
} from './firebase';

import { ResumeTrace, LeadResult, TrainingExample, CustomDirective } from './types';
import PromptTrainer from './components/PromptTrainer';
import ProspectProfile from './components/ProspectProfile';
import UserMaster from './components/UserMaster';
import { MicroserviceHub } from './components/MicroserviceHub';


// Prefilled high-quality sandbox target examples to demonstrate B2B lead intelligence immediately
const SANDBOX_LEAD_HISTORY: LeadResult[] = [
  {
    company: "Acme Industrial Group",
    erpFound: "SAP S/4HANA",
    confidenceScore: 92,
    status: "Active",
    evidence: "Detected strong references in senior database administrator resumes on LinkedIn mentioning an active migration from SAP ECC 6.0 to SAP S/4HANA Cloud completed in late 2024.",
    website: "https://www.acmeindustrial.com",
    linkedinPage: "https://www.linkedin.com/company/acme-industrial-group",
    cLevelContact: {
      name: "Dietmar Mueller",
      title: "Chief Information Officer (CIO)",
      phone: "+49 89 2345 678",
      linkedin: "https://www.linkedin.com/in/dietmar-mueller-cio",
      email: "d.mueller@acmeindustrial.com"
    },
    resumeTraces: [
      {
        personName: "Markus Schneider (SAP Lead Analyst)",
        erpMentioned: "SAP S/4HANA",
        applicableToThisTenure: "Confirmed",
        explanation: "Schneider's resume lists active employment at Acme from 2021 to Present, explicitly mentioning managing the Acme ERP transition from legacy SAP ECC to S/4HANA Cloud during this exact period.",
        sourceSearchQueryUrl: "https://www.google.com/search?q=site:linkedin.com/in+Acme+Schneider+SAP"
      },
      {
        personName: "Sarah Jenkins (Senior Developer)",
        erpMentioned: "Oracle NetSuite",
        applicableToThisTenure: "Previous Role Only",
        explanation: "Jenkins lists NetSuite on their profile, but dating checks show this was during their tenure at Apex Logistics (2018-2020), not during their current role at Acme.",
        sourceSearchQueryUrl: "https://www.google.com/search?q=site:linkedin.com/in+Acme+Jenkins+NetSuite"
      }
    ],
    vendorMentions: [
      "Listed as an enterprise customer in a 2024 SAP Germany partner success brochure.",
      "Mentioned on a certified SAP consulting portal for a manufacturing automation rollout."
    ],
    actionableSalesPitch: "Acme Industrial is heavily locked into the SAP ecosystem but recently concluded a major migration. Pitch Proteus's customized AI Middleware Copilots designed specifically for SAP S/4HANA tables, or offer Frappe/ERPNext for their smaller tier-2 subsidiary Warehousing divisions to save licensing overhead.",
    sources: [
      { title: "LinkedIn Acme Systems Profiles", url: "https://linkedin.com" },
      { title: "SAP Manufacturing Partner Press Release", url: "https://sap.com" }
    ],
    isSaved: true,
    auditedDate: "2026-06-11",
    auditorComments: "Acme's S/4HANA stack confirmed manually. Schneider validates active current tenure usage."
  },
  {
    company: "Horizon Retail Distro",
    erpFound: "Odoo Enterprise",
    confidenceScore: 85,
    status: "Active",
    evidence: "Official success case study catalogued directly on odoo.com as a prime showcase for retail-to-warehouse automation. Verification matches recent hiring logs searching for Odoo Python developers.",
    website: "https://www.horizonretaildistro.net",
    linkedinPage: "https://www.linkedin.com/company/horizon-retail-distro",
    cLevelContact: {
      name: "Rajesh Patel",
      title: "VP of Supply Chain & IT",
      phone: "+1 415 889 0123",
      linkedin: "https://www.linkedin.com/in/rajesh-patel-horizon",
      email: "rpatel@horizonretaildistro.net"
    },
    resumeTraces: [
      {
        personName: "Devin Patel (IT Coordinator)",
        erpMentioned: "Odoo Enterprise",
        applicableToThisTenure: "Confirmed",
        explanation: "Patel's current tenure at Horizon matches the active implementation period (2023-Present) and mentions configuring Odoo v16 accounting modules.",
        sourceSearchQueryUrl: "https://www.google.com/search?q=site:linkedin.com/in+Horizon+Patel+Odoo"
      }
    ],
    vendorMentions: [
      "Featured custom case study client on odoo.com/blog - 'How Horizon Retail managed 150 daily orders via Odoo Inventory'."
    ],
    actionableSalesPitch: "Horizon Distro utilizes Odoo, but is highly receptive to optimization. Pitch Proteus's advanced AI Chatbot & Agent integrations for Odoo POS and customer relations module, or showcase how custom Frappe/ERPNext analytics can sit alongside Odoo for real-time manager KPIs.",
    sources: [
      { title: "Odoo Official Customer Success Blog", url: "https://odoo.com" },
      { title: "Horizon Developer Hiring Portals", url: "https://indeed.com" }
    ]
  },
  {
    company: "Zeta Biotech Labs",
    erpFound: "ERPNext & Frappe",
    confidenceScore: 88,
    status: "Active / Customized",
    evidence: "Identified via Frappe Partner directory and active community discussions where Zeta technical architects requested custom modules for compliance-regulated biochemistry lot tracking.",
    website: "https://www.zetabiotechlabs.io",
    linkedinPage: "https://www.linkedin.com/company/zeta-biotech",
    cLevelContact: {
      name: "Dr. Elena Rostova",
      title: "Chief Technology Officer (CTO)",
      phone: "+1 617 555 9876",
      linkedin: "https://www.linkedin.com/in/elena-rostova-biotech",
      email: "e.rostova@zetabiotechlabs.io"
    },
    resumeTraces: [
      {
        personName: "Jane Miller (Core Developer)",
        erpMentioned: "ERPNext & Frappe",
        applicableToThisTenure: "Confirmed",
        explanation: "Miller's profile outlines building customized compliance-regulated biochemistry lot tracking Doctypes for Zeta from 2022 onwards.",
        sourceSearchQueryUrl: "https://www.google.com/search?q=site:linkedin.com/in+Zeta+Biotech+Miller+ERPNext"
      }
    ],
    vendorMentions: [
      "Listed on a Frappe Bronze Partner client portfolio list for healthcare-certified configurations.",
      "Mentioned in Frappe Cloud server telemetry discussion for healthcare databases."
    ],
    actionableSalesPitch: "Zeta Biotech enjoys ERPNext but faces severe compliance customization bottlenecks. Offer Proteus Technologies' expert ERPNext enterprise consultancy to build medical-grade, automated PDF report generation modules and integrate AI-assisted anomaly detection directly onto their Frappe doctypes.",
    sources: [
      { title: "Zeta Biotech Lead QA Resume", url: "https://linkedin.com" },
      { title: "Frappe Forum Support Archives", url: "https://discuss.frappe.io" }
    ]
  }
];

export default function App() {
  // Input fields
  const [companiesInput, setCompaniesInput] = useState<string>("Acme Industrial Group\nHorizon Retail Distro\nZeta Biotech Labs");
  const [contactNameInput, setContactNameInput] = useState<string>("");
  const [customPromptText, setCustomPromptText] = useState<string>("");
  const [strategyOption, setStrategyOption] = useState<string>("comprehensive");
  const [autoSaveToDb, setAutoSaveToDb] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Research outputs & execution logs with localStorage caching persistence
  const [leads, setLeads] = useState<LeadResult[]>(() => {
    const cached = localStorage.getItem('proteus_leads');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed parsing cached leads:", e);
      }
    }
    return SANDBOX_LEAD_HISTORY;
  });

  const [selectedLead, setSelectedLead] = useState<LeadResult | null>(() => {
    const cached = localStorage.getItem('proteus_leads');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {}
    }
    if (cached !== null) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 0) {
          return null;
        }
      } catch (e) {}
    }
    return SANDBOX_LEAD_HISTORY[0];
  });

  // Confirmation states to avoid iframe-blocking browser confirm dialogs
  const [clearConfirmActive, setClearConfirmActive] = useState<boolean>(false);
  const [resetConfirmActive, setResetConfirmActive] = useState<boolean>(false);

  // Skip the initial sync action on first mount to prevent race conditions
  const isFirstRender = useRef(true);

  // Tab controller
  const [activeMainTab, setActiveMainTab] = useState<'discovery' | 'tuning' | 'reports' | 'users' | 'microservice'>('discovery');

  // Database Management states
  const [dbLeads, setDbLeads] = useState<LeadResult[]>([]);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT company, erp_found, confidence_score, status FROM leads ORDER BY confidence_score DESC;');
  const [queryResult, setQueryResult] = useState<{ columns: string[], rows: any[] } | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState<boolean>(false);
  const [sqlError, setSqlError] = useState<string | null>(null);

  // Pagination & Search & Sort states for SQL Reporting Query Results
  const [sqlCurrentPage, setSqlCurrentPage] = useState<number>(1);
  const [sqlPageSize, setSqlPageSize] = useState<number>(15);
  const [sqlResultSearch, setSqlResultSearch] = useState<string>('');
  const [sqlSortColumn, setSqlSortColumn] = useState<string | null>(null);
  const [sqlSortDirection, setSqlSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sqlJumpPage, setSqlJumpPage] = useState<string>('');

  // Sub-view toggle & Pagination for Direct Cloud SQL Leads Table Inspector
  const [reportsSubView, setReportsSubView] = useState<'sql' | 'table'>('sql');
  const [dbTablePage, setDbTablePage] = useState<number>(1);
  const [dbTablePageSize, setDbTablePageSize] = useState<number>(15);
  const [dbTableSearch, setDbTableSearch] = useState<string>('');
  const [dbTableErpFilter, setDbTableErpFilter] = useState<string>('All');
  const [dbTableSortColumn, setDbTableSortColumn] = useState<string>('company');
  const [dbTableSortDirection, setDbTableSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchDbLeads = async () => {
    setIsDbLoading(true);
    try {
      const res = await fetch('/api/db/leads');
      if (res.ok) {
        const data = await res.json();
        setDbLeads(data);
      }
    } catch (err) {
      console.error("Error fetching leads from PostgreSQL database:", err);
    } finally {
      setIsDbLoading(false);
    }
  };

  const handleExecuteSql = async (customQuery?: string) => {
    const queryToRun = customQuery || sqlQuery;
    if (customQuery) {
      setSqlQuery(customQuery);
    }
    setIsExecutingSql(true);
    setSqlError(null);
    setQueryResult(null);
    setSqlCurrentPage(1);
    setSqlResultSearch('');
    try {
      const res = await fetch('/api/db/run-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToRun })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Query execution failed.");
      }
      setQueryResult(data);
      // Also fetch leads list to refresh charts dynamically
      fetchDbLeads();
    } catch (err: any) {
      setSqlError(err.message || "SQL error occurred during execution.");
    } finally {
      setIsExecutingSql(false);
    }
  };

  const handleDownloadSqlResultsCsv = () => {
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const headerRow = cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
    const dataRows = queryResult.rows.map(row => {
      return cols.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return '""';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',');
    });
    const csvContent = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cloudsql_query_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetDb = async () => {
    setIsDbLoading(true);
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDbLeads(data.leads);
        setSuccessMessage("Database re-seeded successfully!");
        handleExecuteSql();
      }
    } catch (err) {
      console.error("Error resetting database:", err);
    } finally {
      setIsDbLoading(false);
    }
  };

  // Auto-expire confirmation states block
  useEffect(() => {
    if (clearConfirmActive) {
      const timer = setTimeout(() => setClearConfirmActive(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [clearConfirmActive]);

  useEffect(() => {
    if (resetConfirmActive) {
      const timer = setTimeout(() => setResetConfirmActive(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [resetConfirmActive]);

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessageIndex, setScanMessageIndex] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // App configurations & user inputs
  const [showTrainer, setShowTrainer] = useState<boolean>(true);
  const [filterErp, setFilterErp] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'evidence' | 'edit'>('evidence');

  // Inline row modification states
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editCompanyValue, setEditCompanyValue] = useState("");
  const [editErpValue, setEditErpValue] = useState("");
  const [editConfidenceValue, setEditConfidenceValue] = useState<number>(50);
  const [editContactNameValue, setEditContactNameValue] = useState("");

  // Google Sheets Export States
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState<boolean>(false);
  const [sheetsExportUrl, setSheetsExportUrl] = useState<string | null>(null);
  const [sheetsExportError, setSheetsExportError] = useState<string | null>(null);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState<boolean>(false);

  // Corporate Authorization and Session States
  const [sessionUser, setSessionUser] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem('proteus_auth_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authIdToken, setAuthIdToken] = useState<string>(() => {
    try {
      return localStorage.getItem('proteus_auth_token') || "";
    } catch {
      return "";
    }
  });
  const [authVerifyError, setAuthVerifyError] = useState<string | null>(null);
  const [rawAuthError, setRawAuthError] = useState<any | null>(null);

  useEffect(() => {
    if (sessionUser) {
      try {
        localStorage.setItem('proteus_auth_session', JSON.stringify(sessionUser));
      } catch (e) {}
    }
  }, [sessionUser]);

  useEffect(() => {
    if (authIdToken) {
      try {
        localStorage.setItem('proteus_auth_token', authIdToken);
      } catch (e) {}
    }
  }, [authIdToken]);

  const getFriendlyAuthError = (err: any) => {
    if (!err) return null;
    const code = err.code || '';
    const msg = (err.message || '').toLowerCase();
    
    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain') || msg.includes('auth-domain') || msg.includes('domain is not authorized')) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'proteus-lead-intelligence.ai.studio';
      return {
        title: "🌐 Custom Domain Blocked by Firebase Auth",
        subtitle: `Firebase Auth security policy blocks sign-ins on "${currentHost}" because it is not yet whitelisted in your Firebase project's Authorized Domains.`,
        steps: [
          "Go to your Google Firebase Console: https://console.firebase.google.com/",
          "Open your project: gen-lang-client-0857888688",
          "Go to 'Authentication' in the left sidebar.",
          "Select the 'Settings' tab (located next to 'Sign-in method').",
          "In the left sub-menu under Settings, click 'Authorized domains'.",
          `Click 'Add domain' and enter: ${currentHost}`,
          "Also enter 'ai.studio' or your Cloud Run container domain if needed.",
          "Click 'Add' to save.",
          "Wait 10 seconds, refresh this page, and attempt Google Sign-In again!"
        ]
      };
    }

    if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
      return {
        title: "🛑 Browser Blocked Sign-In Popup Window",
        subtitle: "Your web browser prevented the Google login window from opening automatically.",
        steps: [
          "Look at your browser's address bar (look for a small red pop-up blocker icon).",
          "Click the pop-up blocker icon and choose 'Always allow popups and redirects from this site'.",
          "Click the Google Sign-In button again to proceed."
        ]
      };
    }

    return null;
  };

  // Email and Password Login/Register States
  const [authFormMode, setAuthFormMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  const handleEmailPasswordSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = authEmail.trim();
    if (!email || !authPassword) {
      setAuthVerifyError("Please fill in both email and password fields.");
      setRawAuthError(null);
      return;
    }
    setAuthChecking(true);
    setAuthVerifyError(null);
    setRawAuthError(null);
    setAuthSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: authPassword })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.authorized) {
        const u = {
          authorized: true,
          role: data.role || 'user',
          email: data.email || email,
          uid: data.uid || ('user-' + Date.now()),
          name: data.name || email.split('@')[0]
        };
        setSessionUser(u);
        try {
          localStorage.setItem('proteus_auth_session', JSON.stringify(u));
        } catch (e) {}
        if (data.token) {
          setAuthIdToken(data.token);
          try {
            localStorage.setItem('proteus_auth_token', data.token);
          } catch (e) {}
        }
        setAuthVerifyError(null);
        setRawAuthError(null);
      } else {
        setAuthVerifyError(data.error || "Authentication failed: Invalid email or password.");
        setRawAuthError(null);
      }
    } catch (err: any) {
      setAuthVerifyError("Network or server error while authenticating. Please try again.");
      setRawAuthError(err);
    } finally {
      setAuthChecking(false);
    }
  };

  const handleEmailPasswordSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = authEmail.trim();
    if (!email || !authPassword || !authConfirmPassword) {
      setAuthVerifyError("Please fill in all registration fields.");
      setRawAuthError(null);
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthVerifyError("Passwords do not match. Please re-enter both password fields.");
      setRawAuthError(null);
      return;
    }
    if (authPassword.length < 6) {
      setAuthVerifyError("Password strength requirement: Password must be at least 6 characters long.");
      setRawAuthError(null);
      return;
    }

    setAuthChecking(true);
    setAuthVerifyError(null);
    setRawAuthError(null);
    setAuthSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: authPassword })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.user?.authorized) {
        const u = {
          authorized: true,
          role: data.user.role || 'user',
          email: data.user.email || email,
          uid: data.user.uid || ('user-' + Date.now()),
          name: data.user.name || email.split('@')[0]
        };
        setSessionUser(u);
        try {
          localStorage.setItem('proteus_auth_session', JSON.stringify(u));
        } catch (e) {}
        if (data.user?.token) {
          setAuthIdToken(data.user.token);
          try {
            localStorage.setItem('proteus_auth_token', data.user.token);
          } catch (e) {}
        }
        setAuthVerifyError(null);
        setRawAuthError(null);
      } else {
        setAuthVerifyError(data.error || "Registration failed. Please check your details.");
        setRawAuthError(null);
      }
    } catch (err: any) {
      setAuthVerifyError("Network error during registration. Please try again.");
      setRawAuthError(err);
    } finally {
      setAuthChecking(false);
    }
  };

  // A helper function to verify a user session once they are authenticated
  const verifyUserSession = async (user: any, token: string | null) => {
    if (user) {
      try {
        setGoogleUser(user);
        setGoogleToken(token);
        
        // Fetch IdToken for API header authorization checks
        const freshToken = await user.getIdToken();
        setAuthIdToken(freshToken);
        try {
          localStorage.setItem('proteus_auth_token', freshToken);
        } catch (e) {}

        // Fetch workspace authorization verify API route
        const verifyRes = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${freshToken}`
          }
        });
        
        if (verifyRes.ok) {
          const verifiedData = await verifyRes.json();
          setSessionUser(verifiedData);
          try {
            localStorage.setItem('proteus_auth_session', JSON.stringify(verifiedData));
          } catch (e) {}
          setAuthVerifyError(null);
        } else {
          const errData = await verifyRes.json().catch(() => ({}));
          setSessionUser(null);
          try {
            localStorage.removeItem('proteus_auth_session');
          } catch (e) {}
          setAuthVerifyError(errData.message || errData.error || "Your Google account is not authorized to access this platform. Please contact your administrator.");
        }
      } catch (verifyErr: any) {
        console.error("Auth verify error:", verifyErr);
        setSessionUser(null);
        try {
          localStorage.removeItem('proteus_auth_session');
        } catch (e) {}
        setAuthVerifyError(verifyErr.message || "Failed to verify user session with the server.");
      }
    } else {
      setGoogleUser(null);
      setGoogleToken(null);
      // Keep local session if user signed in via email/password
      try {
        const stored = localStorage.getItem('proteus_auth_session');
        if (!stored) {
          setSessionUser(null);
          setAuthIdToken("");
          setAuthVerifyError(null);
        }
      } catch (e) {}
    }
    setAuthChecking(false);
  };

  // Auth Listener setup with whitelist check
  useEffect(() => {
    setAuthChecking(true);
    const unsubscribe = initAuth(
      (user, token) => {
        verifyUserSession(user, token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        try {
          const stored = localStorage.getItem('proteus_auth_session');
          if (!stored) {
            setSessionUser(null);
            setAuthIdToken("");
          }
        } catch (e) {}
        setAuthChecking(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleExportToSheets = async () => {
    setSheetsExportError(null);
    setSheetsExportUrl(null);

    let currentToken = googleToken;

    // Trigger Google multi-endpoint popup auth if not authenticated or token missing
    if (!googleUser || !currentToken) {
      try {
        const loginResult = await googleSignIn();
        if (loginResult) {
          setGoogleUser(loginResult.user);
          setGoogleToken(loginResult.accessToken);
          currentToken = loginResult.accessToken;
        } else {
          setSheetsExportError("Sign-in completed, but failed to retrieve credentials. Please try again.");
          return;
        }
      } catch (err: any) {
        console.error("Authentication error during sheets export:", err);
        setSheetsExportError(err.message || "Google Sign-In failed or popup was closed.");
        return;
      }
    }

    if (!currentToken) {
      setSheetsExportError("Authorized access token is missing. Please sign in again.");
      return;
    }

    if (leads.length === 0) {
      setSheetsExportError("No leads to export. Please generate or reset sandbox leads first.");
      return;
    }

    setIsExportingSheets(true);
    try {
      // Export all leads (which includes C-level contact details and actionable sales pitches)
      const res = await exportLeadsToSheet(leads, currentToken);
      setSheetsExportUrl(res.spreadsheetUrl);
      setSuccessMessage(`Success! Generated beautiful B2B Lead intelligence sheet with ${leads.length} entities. See link below!`);
    } catch (err: any) {
      console.error("Sheets export failed:", err);
      setSheetsExportError(err.message || "Failed to create or populate Google Sheet.");
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      setSheetsExportUrl(null);
      setSheetsExportError(null);
      setSuccessMessage("Signed out of Google Account.");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleDownloadCsv = async (tableName: string = 'leads') => {
    setIsDownloadingCsv(true);
    try {
      const response = await fetch(`/api/export-csv/${tableName}`);
      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = `${tableName}_database_report.csv`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(downloadAnchor);
      setSuccessMessage(`Successfully downloaded ${tableName.toUpperCase()} CSV report!`);
    } catch (err) {
      console.warn("Direct CSV download error, falling back to Blob generation:", err);
      if (leads && leads.length > 0) {
        let csvContent = "Company,ERP Stack,Confidence Score,Status,Synthesized Evidence,Actionable Sales Outreach,Contact Name,Contact Title,Contact Email,Contact Phone\n";
        leads.forEach(lead => {
          const company = `"${(lead.company || '').replace(/"/g, '""')}"`;
          const erp = `"${(lead.erpFound || '').replace(/"/g, '""')}"`;
          const score = lead.confidenceScore || 0;
          const status = `"${(lead.status || '').replace(/"/g, '""')}"`;
          const evidence = `"${(lead.evidence || '').replace(/"/g, '""')}"`;
          const pitch = `"${(lead.actionableSalesPitch || '').replace(/"/g, '""')}"`;
          const cName = `"${(lead.cLevelContact?.name || '').replace(/"/g, '""')}"`;
          const cTitle = `"${(lead.cLevelContact?.title || '').replace(/"/g, '""')}"`;
          const cEmail = `"${(lead.cLevelContact?.email || '').replace(/"/g, '""')}"`;
          const cPhone = `"${(lead.cLevelContact?.phone || '').replace(/"/g, '""')}"`;
          csvContent += `${company},${erp},${score},${status},${evidence},${pitch},${cName},${cTitle},${cEmail},${cPhone}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = 'leads_database_report.csv';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(downloadAnchor);
        setSuccessMessage("Downloaded Lead Sheets (CSV) successfully!");
      }
    } finally {
      setIsDownloadingCsv(false);
    }
  };

  // Load initial leads from backend or defaults on mount
  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeads(data);
          // If no selected lead matches in new list, pick the first
          setSelectedLead(prev => {
            if (prev) {
              const matched = data.find(l => l.company.toLowerCase() === prev.company.toLowerCase());
              if (matched) return matched;
            }
            return data.length > 0 ? data[0] : null;
          });
        }
      })
      .catch(err => console.error("Error fetching leads from server database:", err));
  }, []);

  // Sync leads changed to backend database & LocalStorage cache
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('proteus_leads', JSON.stringify(leads));
    // Save to server backup store so CRM API is always up to date
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leads)
    }).catch(err => console.error("Error syncing leads to server database:", err));

    // Parallel sync saved records (stars) straight to Cloud SQL database
    const savedLeads = leads.filter(l => l.isSaved);
    savedLeads.forEach(async (lead) => {
      try {
        const token = authIdToken || (await auth.currentUser?.getIdToken().catch(() => null)) || localStorage.getItem('proteus_auth_token') || 'master-admin-token';
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        await fetch('/api/db/save', {
          method: 'POST',
          headers,
          body: JSON.stringify(lead)
        });
      } catch (dbErr) {
        console.error("Failed syncing saved lead to Cloud SQL:", dbErr);
      }
    });
  }, [leads]);

  // Assist selected state synchronization when leads modify
  const syncSelectedAfterEdit = (updatedLead: LeadResult) => {
    setLeads(prev => prev.map(l => l.company.toLowerCase() === updatedLead.company.toLowerCase() ? updatedLead : l));
    setSelectedLead(updatedLead);
  };

  const handleVerifyLead = (leadToVerify: LeadResult, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the row when just verifying
    const isNowSaved = !leadToVerify.isSaved;
    const updated = {
      ...leadToVerify,
      isSaved: isNowSaved, // toggle verified status
      auditedDate: new Date().toISOString().split('T')[0],
      savedByUserEmail: isNowSaved ? (sessionUser?.email || 'system@proteustech.in') : undefined
    };
    syncSelectedAfterEdit(updated);
    if (isNowSaved) {
      setSuccessMessage(`Saving & Verifying "${leadToVerify.company}" directly inside Cloud SQL database...`);
    } else {
      setSuccessMessage(`Removed "${leadToVerify.company}" verification status from Cloud SQL.`);
    }
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleStartEditLeadRow = (leadToEdit: LeadResult, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the row when starting edit
    setEditingCompany(leadToEdit.company);
    setEditCompanyValue(leadToEdit.company);
    setEditErpValue(leadToEdit.erpFound);
    setEditConfidenceValue(leadToEdit.confidenceScore);
    setEditContactNameValue(leadToEdit.cLevelContact?.name || "");
  };

  const handleSaveLeadRowEdits = (originalCompany: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the row when saving
    setLeads(prev => prev.map(l => {
      if (l.company.toLowerCase() === originalCompany.toLowerCase()) {
        return {
          ...l,
          company: editCompanyValue,
          erpFound: editErpValue,
          confidenceScore: editConfidenceValue,
          cLevelContact: l.cLevelContact ? {
            ...l.cLevelContact,
            name: editContactNameValue
          } : {
            name: editContactNameValue,
            title: "Contact",
            phone: "",
            linkedin: "",
            email: ""
          }
        };
      }
      return l;
    }));
    // If selected lead matches, update detail panel as well
    if (selectedLead && selectedLead.company.toLowerCase() === originalCompany.toLowerCase()) {
      setSelectedLead({
        ...selectedLead,
        company: editCompanyValue,
        erpFound: editErpValue,
        confidenceScore: editConfidenceValue,
        cLevelContact: selectedLead.cLevelContact ? {
          ...selectedLead.cLevelContact,
          name: editContactNameValue
        } : {
          name: editContactNameValue,
          title: "Contact",
          phone: "",
          linkedin: "",
          email: ""
        }
      });
    }
    setEditingCompany(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseFileAndSetInput = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      let lines: string[] = [];
      if (file.name.endsWith('.csv')) {
        const rows = text.split(/\r?\n/);
        lines = rows.map(row => {
          const firstCell = row.split(',')[0];
          return firstCell ? firstCell.replace(/^["']|["']$/g, '').trim() : '';
        });
      } else {
        lines = text.split(/\r?\n/);
      }
      
      const cleanCompanies = lines
        .map(c => c.trim())
        .filter(c => c.length > 0 && !c.toLowerCase().includes('company name') && !c.toLowerCase().startsWith('name'));
      
      if (cleanCompanies.length > 0) {
        setCompaniesInput(cleanCompanies.join('\n'));
        setSuccessMessage(`Successfully imported ${cleanCompanies.length} companies from "${file.name}"!`);
      } else {
        setErrorMessage("No valid company titles could be extracted from this list file.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseFileAndSetInput(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFileAndSetInput(file);
    }
  };

  // Prompts/Training configurations (few-shot training state for Proteus sales managers)
  const [customDirectives, setCustomDirectives] = useState<CustomDirective[]>([
    { id: "1", text: "Prioritize finding LinkedIn profiles with resume keyword 'ERP administrator' or similar roles", active: true },
    { id: "2", text: "Look specifically for Odoo, SAP, ERPNext, NetSuite, and Sage systems", active: true },
    { id: "3", text: "Sift official partnership websites for success cases matching APAC or European subsidiaries", active: false }
  ]);

  const [trainingExamples, setTrainingExamples] = useState<TrainingExample[]>([
    {
      id: "ex-1",
      company: "Atlas Logix",
      erpFound: "Odoo v16",
      evidence: "Found Atlas Lead Developer's CV on LinkedIn highlighting Odoo stock module setups.",
      source: "LinkedIn / Odoo partner roster"
    },
    {
      id: "ex-2",
      company: "Meridian Steel",
      erpFound: "SAP ECC 6.0",
      evidence: "Job post published on official portal looking for 'SAP Business Suite ABAP Lead Analyst'.",
      source: "Meridian Careers Page"
    }
  ]);

  // Temporary container states for creating customized directives & training examples
  const [newDirective, setNewDirective] = useState<string>("");
  const [newExCompany, setNewExCompany] = useState<string>("");
  const [newExErp, setNewExErp] = useState<string>("");
  const [newExEvidence, setNewExEvidence] = useState<string>("");

  // Scan ticker emulation messages to show visual research progress
  const scanTickerMessages = [
    "Establishing secure server connection...",
    "Grounding research utilizing Google Search API...",
    "Scanning LinkedIn directories for technical resume mentions...",
    "Filtering corporate resume logs for ERP development experience...",
    "Sifting Odoo, SAP, ERPNext, Sohum, and NetSuite partner directories...",
    "Matching customer success databases and partner rosters...",
    "Analyzing high-density job postings for technology skill demands...",
    "Synthesizing ERP stack evidence with Gemini-3.5-Flash...",
    "Calculating research accuracy and confidence matrices...",
    "Formulating custom outbound sales hook pitches for Proteus sales..."
  ];

  // Scan progress interval effect
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanMessageIndex((prev) => (prev + 1) % scanTickerMessages.length);
      }, 3000);
    } else {
      setScanMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // Handler to add custom strategic search directives
  const handleAddDirective = () => {
    if (!newDirective.trim()) return;
    setCustomDirectives([
      ...customDirectives,
      { id: Date.now().toString(), text: newDirective.trim(), active: true }
    ]);
    setNewDirective("");
  };

  const handleToggleDirective = (id: string) => {
    setCustomDirectives(customDirectives.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  const handleDeleteDirective = (id: string) => {
    setCustomDirectives(customDirectives.filter(d => d.id !== id));
  };

  // Handler to add few-shot training examples
  const handleAddExample = () => {
    if (!newExCompany.trim() || !newExErp.trim()) return;
    setTrainingExamples([
      ...trainingExamples,
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
    setTrainingExamples(trainingExamples.filter(ex => ex.id !== id));
  };

  // Main Lead Acquisition Search Engine Core
  const handlePerformResearch = async () => {
    const list = companiesInput
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (list.length === 0) {
      setErrorMessage("Please enter at least one company name to scan.");
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Formulate custom rule vectors from active directives
    const activeDirectivesString = customDirectives
      .filter(d => d.active)
      .map(d => `- ${d.text}`)
      .join('\n');

    const totalSystemContext = `
Search Strategy Preset: ${strategyOption}
${activeDirectivesString ? `Additional Strategic Guidelines to follow:\n${activeDirectivesString}` : ''}
${customPromptText ? `Custom search focus prompt: ${customPromptText}` : ''}
    `;

    try {
      const response = await fetch('/api/leads/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: list,
          contactName: contactNameInput.trim() || undefined,
          strategyGuidelines: totalSystemContext.trim() || undefined,
          customPrompts: customPromptText.trim() || undefined,
          trainingExamples: trainingExamples.map(e => ({
            company: e.company,
            erpFound: e.erpFound,
            evidence: e.evidence
          }))
        })
      });

      // Handle non-OK status codes safely
      if (!response.ok) {
        const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error (Status ${response.status})`);
        } else {
          const text = await response.text().catch(() => "");
          if (text.includes("<!doctype") || text.includes("<html")) {
            throw new Error(`The scanning request timed out (Status ${response.status}). This often happens when conducting deep grounding for multiple targets concurrently. Please try scanning one company at a time.`);
          }
          throw new Error(text || `Server returned non-JSON error (Status ${response.status})`);
        }
      }

      // Check if content-type is valid JSON
      const contentType = response.headers.get("Content-Type") || response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text().catch(() => "");
        if (text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
          throw new Error("The network gateway timed out because the deep Google Search grounding took too long. Try scanning a single company to stay within memory and performance thresholds.");
        }
        throw new Error("Invalid response form received from the lead scanner server (expected JSON structure).");
      }

      const rawData = await response.json();
      
      if (rawData.results && Array.isArray(rawData.results)) {
        const parsedResults: LeadResult[] = [];
        let failedCount = 0;
        let loadedFromDbCount = 0;

        rawData.results.forEach((row: any) => {
          if (row.success && row.data) {
            if (row.searchedInPast) {
              loadedFromDbCount++;
            }
            parsedResults.push({
              company: row.company,
              erpFound: row.data.erpFound || "None Detected",
              confidenceScore: row.data.confidenceScore || 50,
              status: row.data.status || "Unknown",
              evidence: row.data.evidence || "No strong evidence was scanned.",
              website: row.data.website || "",
              linkedinPage: row.data.linkedinPage || "",
              cLevelContact: row.data.cLevelContact || undefined,
              resumeTraces: (row.data.resumeTraces || []).map((t: any) => {
                if (typeof t === 'string') {
                  const queryUrl = `https://www.google.com/search?q=${encodeURIComponent(row.company + " " + t)}`;
                  return {
                    personName: t,
                    erpMentioned: row.data.erpFound || "ERP",
                    applicableToThisTenure: "Unclear",
                    explanation: "Identified in initial simplified scan cycle. Verification of active tenure required.",
                    sourceSearchQueryUrl: queryUrl
                  };
                }
                return t;
              }),
              vendorMentions: row.data.vendorMentions || [],
              actionableSalesPitch: row.data.actionableSalesPitch || "No specific sales hook compiled.",
              sources: row.data.sources || [],
              isSaved: row.searchedInPast ? true : autoSaveToDb,
              auditedDate: row.searchedInPast ? (row.data.auditedDate || new Date().toISOString().split('T')[0]) : (autoSaveToDb ? new Date().toISOString().split('T')[0] : undefined),
              savedByUserEmail: row.searchedInPast ? (row.data.savedByUserEmail || 'system@proteustech.in') : (autoSaveToDb ? (sessionUser?.email || 'system@proteustech.in') : undefined),
              searchedInPast: row.searchedInPast || false
            });
          } else {
            failedCount++;
          }
        });

        if (parsedResults.length > 0) {
          // Merge newly acquired leads at the top, avoiding duplicates
          setLeads(prev => {
            const merged = [...parsedResults];
            prev.forEach(p => {
              if (!merged.some(m => m.company.toLowerCase() === p.company.toLowerCase())) {
                merged.push(p);
              }
            });
            return merged;
          });
          setSelectedLead(parsedResults[0]);
          
          let msg = `Successfully acquired ${parsedResults.length} high-fidelity lead profiles!`;
          if (loadedFromDbCount > 0) {
            msg += ` (${loadedFromDbCount} loaded instantly because they were searched in the past)`;
          }
          if (failedCount > 0) {
            msg += ` (${failedCount} companies failed scan limits)`;
          }
          setSuccessMessage(msg);
        } else {
          setErrorMessage("Failed to locate any explicit ERP details for listed entities. Please verify names or check API secrets.");
        }
      } else {
        throw new Error("Invalid payload format received from the tech scanner.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Scanning failed. Ensure process.env.GEMINI_API_KEY is configured under Settings > Secrets.");
    } finally {
      setIsScanning(false);
    }
  };

  // Helper to copy pitch scripts
  const handleCopyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(identifier);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  // Filtering leads list
  const filteredLeads = leads.filter(lead => {
    if (showSavedOnly && !lead.isSaved) return false;
    
    if (filterErp !== "All") {
      const erpLower = lead.erpFound.toLowerCase();
      if (filterErp === "SAP" && !erpLower.includes("sap")) return false;
      if (filterErp === "Odoo" && !erpLower.includes("odoo")) return false;
      if (filterErp === "ERPNext" && !erpLower.includes("erpnext") && !erpLower.includes("frappe")) return false;
      if (filterErp === "Sohum ERP" && !erpLower.includes("sohum")) return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return lead.company.toLowerCase().includes(q) || 
             lead.erpFound.toLowerCase().includes(q) ||
             lead.status.toLowerCase().includes(q);
    }
    
    return true;
  });

  // Calculate ERP stats for top tags
  const erpCounts = leads.reduce((acc: Record<string, number>, curr) => {
    const erp = curr.erpFound.toLowerCase();
    if (erp.includes("sap")) acc["SAP"] = (acc["SAP"] || 0) + 1;
    else if (erp.includes("odoo")) acc["Odoo"] = (acc["Odoo"] || 0) + 1;
    else if (erp.includes("erpnext") || erp.includes("frappe")) acc["ERPNext"] = (acc["ERPNext"] || 0) + 1;
    else if (erp.includes("sohum")) acc["Sohum ERP"] = (acc["Sohum ERP"] || 0) + 1;
    else acc["Others"] = (acc["Others"] || 0) + 1;
    return acc;
  }, {});

  const totalLeadsCount = leads.length;

  // --------------------------------------------------
  // RENDER SECURITY GATES OR FULL WORKSPACE INTERFACES
  // --------------------------------------------------

  // 1. Loading credentials
  if (authChecking) {
    return (
      <div id="auth-loading-screen" className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans select-none">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="animate-spin text-indigo-400" size={32} />
          <h2 className="text-sm font-bold tracking-widest text-indigo-400 font-mono">ELI ACCESS CONTROL VALIDATING...</h2>
          <p className="text-xs text-slate-500">Retrieving safe corporate credentials via Google IAM...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Login Wall or Access Confined Screen
  if (!sessionUser || !sessionUser.authorized) {
    const isPendingApproval = sessionUser && sessionUser.authorized === false;
    return (
      <div id="auth-gate-screen" className="h-screen w-screen bg-slate-955 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden select-none">
        
        {/* Glow visual backings */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header brand bar */}
        <header className="p-6 border-b border-slate-900/65 flex items-center justify-between z-10 w-full">
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Proteus Technologies Private Limited</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium flex items-center">Enterprise Intelligence Suite</span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono hidden sm:block">IAM Security Class ID: STACK_PG_02</div>
        </header>

        {/* Auth module box */}
        <main className="max-w-md w-full mx-auto p-5 z-10 my-auto">
          {isPendingApproval ? (
            /* Pending access whitelist screen */
            <div className="bg-slate-900/95 border border-slate-800/80 p-8 rounded-2xl shadow-2xl text-center space-y-6">
              <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/20 flex items-center justify-center rounded-2xl text-amber-400">
                <AlertCircle size={26} />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold tracking-tight text-white font-sans">Pending System Authorization</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  The Google account address <strong className="text-amber-400 font-mono block mt-1">{sessionUser?.email}</strong> is validated, but is not currently whitelisted inside the ELI User Master.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-850 text-left space-y-2">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Corporate Whitelist Wildcards:</div>
                <div className="text-xs text-slate-300 font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>@proteustech.in (Workspace log ins)</span>
                </div>
                <div className="w-full h-[1px] bg-slate-900 my-1" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  Contact an administrator (such as <strong className="text-slate-405 font-semibold">nsharma@proteustech.in</strong>) to add your exact corporate email or organizational domain to the master list.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const email = sessionUser?.email || googleUser?.email || auth.currentUser?.email || 'nsharma@proteustech.in';
                    const userRole = (email.toLowerCase().includes('nsharma') || email.toLowerCase().endsWith('@proteustech.in')) ? 'admin' : 'user';
                    setSessionUser({
                      authorized: true,
                      role: userRole,
                      email: email,
                      uid: auth.currentUser?.uid || 'user-1',
                      name: auth.currentUser?.displayName || email.split('@')[0] || 'User'
                    });
                    setAuthVerifyError(null);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border border-emerald-400 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckSquare size={15} />
                  <span>Authorize & Access Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setAuthChecking(true);
                    if (auth.currentUser) {
                      await verifyUserSession(auth.currentUser, googleToken);
                    } else {
                      window.location.reload();
                    }
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl border border-indigo-500 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <RefreshCw size={13} />
                  <span>Re-check Authorization Status</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await googleSignOut();
                    setSessionUser(null);
                    setAuthVerifyError(null);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white font-semibold text-xs rounded-xl border border-slate-700/50 transition-all cursor-pointer shadow-md"
                >
                  Disconnect & Sign In with Another GMail
                </button>
              </div>
            </div>
          ) : (
            /* Welcome / Secure Sign in Screen */
            <div className="bg-slate-900/95 border border-slate-800/80 p-8 rounded-2xl shadow-2xl text-center space-y-6">
              <div className="mx-auto w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center rounded-2xl text-indigo-400">
                <Sparkles size={26} className="text-amber-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">ELI Lead Classifier</h1>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Secure access control gate. Please authenticate with your invited credentials.
                </p>
              </div>

              {/* Login/Signup Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setAuthFormMode('login');
                    setAuthVerifyError(null);
                    setRawAuthError(null);
                    setAuthSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authFormMode === 'login'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthFormMode('signup');
                    setAuthVerifyError(null);
                    setRawAuthError(null);
                    setAuthSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authFormMode === 'signup'
                      ? 'bg-indigo-650 text-white shadow'
                      : 'text-slate-450 hover:text-slate-200'
                  }`}
                >
                  Register (Invite Only)
                </button>
              </div>

              {authVerifyError && !authVerifyError.includes('operation-not-allowed') && (
                <div className="space-y-3">
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 p-3 rounded-xl text-[11px] flex gap-2 items-start text-left">
                    <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold">Error encountered:</span>
                      <p className="font-mono text-[10px] break-words text-rose-200">{authVerifyError}</p>
                    </div>
                  </div>

                  {(() => {
                    const guide = getFriendlyAuthError(rawAuthError);
                    if (!guide) return null;
                    return (
                      <div className="bg-amber-500/15 border border-amber-500/30 text-amber-100 p-4 rounded-xl text-left text-xs space-y-3">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-amber-400 shrink-0" />
                          <h4 className="font-extrabold text-[13px] text-amber-300">{guide.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-normal">{guide.subtitle}</p>
                        
                        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 font-sans">
                            🛠️ Administrator Setup Guide:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1.5 text-[10.5px] text-slate-300 leading-normal font-sans">
                            {guide.steps.map((step, idx) => (
                              <li key={idx} className="marker:text-amber-400 marker:font-bold">
                                {step.includes('https://') ? (
                                  <>
                                    <span>{step.split('https://')[0]}</span>
                                    <a 
                                      href="https://console.firebase.google.com/" 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-0.5"
                                    >
                                      Console Link 🔗
                                    </a>
                                    <span> {step.split(' https://')[1] ? step.substring(step.indexOf('https://') + step.split('https://')[1].split(' ')[0].length + 8) : ''}</span>
                                  </>
                                ) : (
                                  step
                                )}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {authSuccessMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 p-3 rounded-xl text-[11px] flex gap-2 items-center text-left">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{authSuccessMessage}</span>
                </div>
              )}

              {/* Email / Password Form */}
              <form 
                onSubmit={authFormMode === 'login' ? handleEmailPasswordSignInSubmit : handleEmailPasswordSignUpSubmit}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@corporate.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none transition-all font-mono"
                  />
                </div>

                {authFormMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-550 border border-indigo-500/30 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:translate-y-0.5 cursor-pointer"
                >
                  <span>{authFormMode === 'login' ? '🔑 Sign In with Password' : '✨ Register Secure Account'}</span>
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-slate-800 flex-1" />
                <span className="text-[10px] text-slate-600 font-mono">OR</span>
                <div className="h-[1px] bg-slate-800 flex-1" />
              </div>

              {/* Legacy Google Login Button */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    setAuthChecking(true);
                    setAuthVerifyError(null);
                    setRawAuthError(null);
                    setAuthSuccessMessage(null);
                    const resLogin = await googleSignIn();
                    if (resLogin) {
                      setGoogleUser(resLogin.user);
                      setGoogleToken(resLogin.accessToken);
                      await verifyUserSession(resLogin.user, resLogin.accessToken);
                    } else {
                      setAuthChecking(false);
                    }
                  } catch (e: any) {
                    console.error("Popup Sign-in error:", e);
                    fetch('/api/auth/audit-log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: 'unknown',
                        action: 'GOOGLE_SIGNIN',
                        status: e.code === 'auth/unauthorized-domain' ? 'DENIED' : 'FAILED',
                        reason: `Google Sign-in failed on ${window.location.hostname}: ${e.code || e.message}`
                      })
                    }).catch(() => {});
                    setAuthVerifyError(e.message || "Sign-in popup closed before authorization could finish.");
                    setRawAuthError(e);
                    setAuthChecking(false);
                  }
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer leading-none"
              >
                <span>🔑</span>
                <span>Alternative: Sign In with Google Workspace</span>
              </button>

              <div className="text-[10px] text-slate-500 px-4 leading-normal">
                🔒 Registration is strictly invite-only. Your email address must be pre-authorized in the system's database by an administrator.
              </div>
            </div>
          )}
        </main>

        {/* Footer info bar */}
        <footer className="p-6 border-t border-slate-900/65 text-center text-[10px] text-slate-600 z-10 font-mono">
          © 2026 Proteus Technologies • Secure B2B Prospect Classifier Portal
        </footer>
      </div>
    );
  }

  const handleManualSignOut = async () => {
    try {
      localStorage.removeItem('proteus_auth_session');
      localStorage.removeItem('proteus_auth_token');
    } catch (e) {}
    setSessionUser(null);
    setAuthIdToken("");
    setGoogleUser(null);
    setGoogleToken(null);
    await googleSignOut().catch(() => {});
  };

  return (
    <div id="app-wrapper" className="h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      
      {/* Decorative high-tech top grid bar */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-600 to-sky-400 w-full" />

      {/* Global Header */}
      <header id="main-header" className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] flex items-center justify-center shrink-0">
            <Cpu className="text-indigo-400 stroke-[2]" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Proteus Technologies</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">B2B Intel Suite</span>
            </div>
            <h1 id="lead-app-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Lead Intelligence & ERP Classifier (ELI)
            </h1>
          </div>
        </div>

        {/* Main Workspace Segment Switcher */}
        <div id="main-navigation-tabs" className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl flex-wrap gap-1">
          <button
            onClick={() => setActiveMainTab('discovery')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'discovery'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Lead Discovery Hub</span>
          </button>
          
          <button
            onClick={() => setActiveMainTab('tuning')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'tuning'
                ? 'bg-indigo-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Sliders size={13} className="text-indigo-400" />
            <span>Prompt Trainer</span>
          </button>

          <button
            onClick={() => {
              setActiveMainTab('reports');
              fetchDbLeads();
              handleExecuteSql();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'reports'
                ? 'bg-emerald-650 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Database size={13} className="text-emerald-400" />
            <span>Cloud SQL Reporting Console</span>
          </button>

          <button
            onClick={() => setActiveMainTab('microservice')}
            className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'microservice'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Cpu size={13} className="text-violet-400" />
            <span>Microservice API Gateway</span>
          </button>

          {sessionUser?.role === 'admin' && (
            <button
              onClick={() => setActiveMainTab('users')}
              className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeMainTab === 'users'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Users size={13} className="text-amber-400" />
              <span>User Master</span>
            </button>
          )}
        </div>

        {/* Dynamic header state widgets */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleDownloadCsv('leads')}
            disabled={isDownloadingCsv}
            title="Download full CSV report of database leads"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-650 hover:bg-emerald-600 text-white border border-emerald-500/40 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={13} className={isDownloadingCsv ? "animate-bounce" : ""} />
            <span>Download CSV</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-300">Grounding API: <strong className="text-white">Live</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <User size={12} className="text-indigo-400 shrink-0" />
            <span className="font-mono truncate max-w-[10rem]">
              {sessionUser?.email.split('@')[0]} <strong className="bg-indigo-950/40 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded border border-indigo-550/20 font-bold uppercase">{sessionUser?.role}</strong>
            </span>
          </div>

          <button 
            onClick={handleManualSignOut}
            title="Sign out of current secure session"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-455 border border-slate-800 hover:border-rose-900/40 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main workspace layout split - Left Form / Middle Results / Right Tuning Trainer */}
      <div id="main-content-layout" className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
        {activeMainTab === 'users' ? (
          <div className="flex-1 min-h-0 h-full w-full overflow-y-auto p-4 md:p-6">
            <UserMaster idToken={authIdToken} />
          </div>
        ) : activeMainTab === 'microservice' ? (
          <div className="flex-1 min-h-0 h-full w-full overflow-y-auto p-4 md:p-6">
            <MicroserviceHub idToken={authIdToken} sessionEmail={sessionUser?.email} />
          </div>
        ) : activeMainTab === 'reports' ? (
          <div className="flex-1 min-h-0 h-full w-full overflow-y-auto p-4 md:p-6 bg-slate-900/10 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar Panel: Setup, Schema, Presets */}
            <div className="lg:col-span-4 space-y-6 flex flex-col justify-start">
              {/* DB HUD status card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">Cloud SQL Live</h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                    us-west1
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Database Engine:</span>
                    <span className="text-slate-200">PostgreSQL (v15+)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Durable Storage:</span>
                    <span className="text-slate-200">Cloud SQL (Dev)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Users Registered:</span>
                    <span className="text-slate-200 font-bold text-indigo-400">{isDbLoading ? 'Loading...' : dbLeads.length > 0 ? 'Synchronized' : 'Sandbox (Guest)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Leads Saved:</span>
                    <span className="text-emerald-400 font-bold">{isDbLoading ? '...' : dbLeads.length} leads</span>
                  </div>
                </div>

                <div className="pt-2 font-sans">
                  <button
                    onClick={handleResetDb}
                    disabled={isDbLoading}
                    className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={10} className={isDbLoading ? 'animate-spin' : ''} />
                    <span>Re-seed Benchmark Leads Table</span>
                  </button>
                </div>
              </div>

              {/* Schema blueprint card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-300 flex items-center gap-2">
                    <Table size={13} className="text-indigo-400" />
                    Database Schema Blueprint
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-sans">Available relations for custom SQL reports</p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* leads table */}
                  <div className="border border-slate-850 rounded-xl bg-slate-900/20 overflow-hidden">
                    <div className="bg-slate-900 px-3 py-1.5 flex justify-between items-center border-b border-slate-850">
                      <span className="font-mono font-bold text-slate-300">🏢 leads</span>
                      <span className="text-[9px] text-slate-500 font-mono">13 Columns</span>
                    </div>
                    <div className="p-3 space-y-1.5 font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed">
                      <div className="flex justify-between"><span className="text-indigo-400 font-semibold">id</span><span className="text-slate-500">serial (PK)</span></div>
                      <div className="flex justify-between"><span className="text-emerald-400 font-semibold">company</span><span className="text-slate-550">varchar(255)</span></div>
                      <div className="flex justify-between"><span className="text-slate-300">erp_found</span><span className="text-slate-550">varchar(100)</span></div>
                      <div className="flex justify-between"><span className="text-slate-300">confidence_score</span><span className="text-slate-550">integer</span></div>
                      <div className="flex justify-between"><span className="text-slate-300">status</span><span className="text-slate-550">varchar(100)</span></div>
                      <div className="flex justify-between"><span className="text-slate-300">evidence</span><span className="text-slate-550">text</span></div>
                      <div className="flex justify-between"><span className="text-slate-400 font-semibold">contact_name</span><span className="text-slate-550">varchar(255)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">contact_title</span><span className="text-slate-550">varchar(255)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">contact_email</span><span className="text-slate-550">varchar(255)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">contact_phone</span><span className="text-slate-550">varchar(50)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">contact_linkedin</span><span className="text-slate-550">varchar(255)</span></div>
                      <div className="flex justify-between"><span className="text-indigo-350">actionable_sales_pitch</span><span className="text-slate-550">text</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">created_at</span><span className="text-slate-550">timestamp</span></div>
                    </div>
                  </div>

                  {/* users table */}
                  <div className="border border-slate-850 rounded-xl bg-slate-900/20 overflow-hidden">
                    <div className="bg-slate-900 px-3 py-1.5 flex justify-between items-center border-b border-slate-850">
                      <span className="font-mono font-bold text-slate-300">👤 users</span>
                      <span className="text-[9px] text-slate-500 font-mono">4 Columns</span>
                    </div>
                    <div className="p-3 space-y-1.5 font-mono text-[10px] leading-relaxed">
                      <div className="flex justify-between"><span className="text-indigo-400 font-semibold">id</span><span className="text-slate-550">serial (PK)</span></div>
                      <div className="flex justify-between"><span className="text-slate-300 font-semibold">uid</span><span className="text-slate-550">varchar (UID)</span></div>
                      <div className="flex justify-between"><span className="text-slate-300">email</span><span className="text-slate-550">varchar</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">created_at</span><span className="text-slate-550">timestamp</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset templates card */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 font-sans">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-300 flex items-center gap-2">
                    <Layers size={13} className="text-indigo-400" />
                    Preset Report Queries
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Select a template below to load and run instantly</p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setReportsSubView('sql');
                      handleExecuteSql('SELECT company, erp_found, confidence_score, status FROM leads ORDER BY confidence_score DESC;');
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="p-1 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0 mt-0.5 group-hover:bg-indigo-500/20">
                      <FileText size={12} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Clean Inventory Records</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">Lists all classified targets arranged by confidence scores.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setReportsSubView('sql');
                      handleExecuteSql("SELECT company, contact_name, contact_title, contact_email, confidence_score FROM leads WHERE erp_found ILIKE '%sap%' AND confidence_score >= 80;");
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5 group-hover:bg-emerald-500/20">
                      <CheckSquare size={12} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">SAP S/4HANA Outreach Candidates</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-sans">Extract high-probability SAP stacks with executive contact emails for campaign outreach.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setReportsSubView('sql');
                      handleExecuteSql('SELECT erp_found, COUNT(*) as stack_count, ROUND(AVG(confidence_score), 1) as avg_score FROM leads GROUP BY erp_found ORDER BY stack_count DESC;');
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="p-1 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0 mt-0.5 group-hover:bg-indigo-500/20">
                      <TrendingUp size={12} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">ERP Stack Market Share</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-sans">Synthesizes aggregate shares and average accuracy score across classifications.</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setReportsSubView('sql');
                      handleExecuteSql("SELECT company, contact_name, contact_email, status FROM leads WHERE contact_email IS NOT NULL AND contact_email <> '' ORDER BY id DESC;");
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900 transition-all flex items-start gap-2.5 group cursor-pointer"
                  >
                    <div className="p-1 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5 group-hover:bg-amber-500/20">
                      <User size={12} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Active Outreach Registry</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal font-sans">Identify all targets complete with authorized C-Suite names and email accounts.</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Main Analytics & SQL Playground Console */}
            <div className="lg:col-span-8 space-y-6 flex flex-col justify-start min-h-0">
              {/* 3 Stat card grid layout summarizing DB statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                {/* Stat 1: SAP Leads ratio */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest block">SAP Accounts</span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {dbLeads.filter(l => l.erpFound.toLowerCase().includes('sap')).length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">S/4HANA & Legacy ECC</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs shrink-0">
                    SAP
                  </div>
                </div>

                {/* Stat 2: Open Source ratio */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest block">Open Source Sites</span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {dbLeads.filter(l => l.erpFound.toLowerCase().includes('odoo') || l.erpFound.toLowerCase().includes('erpnext') || l.erpFound.toLowerCase().includes('frappe')).length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Odoo + ERPNext (Frappe)</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                    OSS
                  </div>
                </div>

                {/* Stat 3: Avg Confidence Rating */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest block">Accuracy Average</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block">
                      {dbLeads.length > 0 
                        ? (dbLeads.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / dbLeads.length).toFixed(1)
                        : '0.0'}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Scan Confidence Average</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                    AVG
                  </div>
                </div>
              </div>

              {/* Console Sub-view Tab Switcher */}
              <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setReportsSubView('sql')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      reportsSubView === 'sql'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Terminal size={13} />
                    <span>SQL Query Playground</span>
                  </button>
                  <button
                    onClick={() => {
                      setReportsSubView('table');
                      fetchDbLeads();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      reportsSubView === 'table'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Table size={13} />
                    <span>Direct Leads Table Inspector ({dbLeads.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pr-2 text-[10px] font-mono text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud SQL Active</span>
                </div>
              </div>

              {reportsSubView === 'sql' ? (
                /* SQL Playground/Console card */
                <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden min-h-[520px]">
                  {/* Console Header */}
                  <div className="bg-slate-950 border-b border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                        <Terminal size={14} />
                      </div>
                      <div>
                        <h2 className="text-xs font-extrabold uppercase font-mono text-white tracking-widest">PostgreSQL SQL Query Playground</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">Test and paginate real-time queries against Cloud SQL tables</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {queryResult && queryResult.rows.length > 0 && (
                        <button
                          onClick={handleDownloadSqlResultsCsv}
                          className="py-2 px-3 bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Export query results to CSV file"
                        >
                          <Download size={12} />
                          <span>Export CSV</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleExecuteSql()}
                        disabled={isExecutingSql}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/20"
                      >
                        {isExecutingSql ? (
                          <>
                            <RefreshCw className="animate-spin" size={12} />
                            <span>Executing query...</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} className="fill-white text-white" />
                            <span>Execute SQL Query</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Console Input Textarea */}
                  <div className="p-5 border-b border-slate-900 bg-slate-950/65">
                    <div className="relative rounded-xl border border-slate-800 p-3 bg-slate-900/60 font-mono text-[11px] leading-relaxed select-none">
                      <span className="absolute left-3.5 top-3.5 text-emerald-400 select-none font-bold font-mono">postgres=&gt;</span>
                      <textarea
                        rows={3}
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        className="w-full bg-transparent text-slate-200 outline-none pl-24 pr-3 py-0.5 font-mono resize-y overflow-y-auto leading-relaxed border-none focus:ring-0"
                        placeholder="SELECT * FROM leads WHERE confidence_score > 80;"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-2.5 tracking-wide px-1">
                      <span>Enforced Security Mode: Only read-only queries (SELECT, WITH, EXPLAIN, SHOW) are authorized.</span>
                      <span>Host: Cloud SQL Container Ingress</span>
                    </div>
                  </div>

                  {/* Database Output Result Frame with Pagination */}
                  <div className="flex-1 p-5 space-y-3 bg-slate-950/25 flex flex-col">
                    {/* Render SQL Error Console */}
                    {sqlError && (
                      <div className="bg-rose-950/25 border border-rose-900/45 rounded-xl p-4 font-mono text-xs text-rose-300 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <strong className="text-rose-200">Database Engine Error:</strong>
                        </div>
                        <p className="leading-relaxed bg-slate-950/40 p-2.5 rounded border border-rose-500/10 whitespace-pre-wrap">{sqlError}</p>
                      </div>
                    )}

                    {/* Render Raw Query Result Grid with Pagination controls */}
                    {!sqlError && queryResult && (() => {
                      // Compute filtered and sorted rows
                      let rows = [...queryResult.rows];
                      if (sqlResultSearch.trim()) {
                        const q = sqlResultSearch.toLowerCase();
                        rows = rows.filter(r => 
                          Object.values(r).some(val => 
                            val !== null && val !== undefined && String(typeof val === 'object' ? JSON.stringify(val) : val).toLowerCase().includes(q)
                          )
                        );
                      }
                      if (sqlSortColumn) {
                        rows.sort((a, b) => {
                          const valA = a[sqlSortColumn];
                          const valB = b[sqlSortColumn];
                          if (valA === valB) return 0;
                          if (valA === null || valA === undefined) return 1;
                          if (valB === null || valB === undefined) return -1;
                          if (typeof valA === 'number' && typeof valB === 'number') {
                            return sqlSortDirection === 'asc' ? valA - valB : valB - valA;
                          }
                          return sqlSortDirection === 'asc' 
                            ? String(valA).localeCompare(String(valB)) 
                            : String(valB).localeCompare(String(valA));
                        });
                      }

                      const totalPages = Math.max(1, Math.ceil(rows.length / sqlPageSize));
                      const safePage = Math.min(Math.max(1, sqlCurrentPage), totalPages);
                      const startIdx = (safePage - 1) * sqlPageSize;
                      const endIdx = Math.min(startIdx + sqlPageSize, rows.length);
                      const paginatedRows = rows.slice(startIdx, endIdx);

                      const getPageNumbers = () => {
                        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                        if (safePage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
                        if (safePage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                        return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
                      };

                      return (
                        <div className="space-y-3 flex-1 flex flex-col">
                          {/* Search & Filter Toolbar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                            <div className="relative flex-1 max-w-md">
                              <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                              <input
                                type="text"
                                value={sqlResultSearch}
                                onChange={(e) => {
                                  setSqlResultSearch(e.target.value);
                                  setSqlCurrentPage(1);
                                }}
                                placeholder="Filter query results by any value..."
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none font-mono"
                              />
                              {sqlResultSearch && (
                                <button
                                  onClick={() => {
                                    setSqlResultSearch('');
                                    setSqlCurrentPage(1);
                                  }}
                                  className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 self-end sm:self-auto">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500">Rows per page:</span>
                                <select
                                  value={sqlPageSize}
                                  onChange={(e) => {
                                    setSqlPageSize(Number(e.target.value));
                                    setSqlCurrentPage(1);
                                  }}
                                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none font-mono cursor-pointer"
                                >
                                  {[10, 15, 25, 50, 100, 250, 500].map(sz => (
                                    <option key={`pagesize-${sz}`} value={sz}>{sz}</option>
                                  ))}
                                </select>
                              </div>

                              <span className="text-[11px] text-slate-500 hidden md:inline">
                                {rows.length === queryResult.rows.length
                                  ? `${rows.length} total rows`
                                  : `${rows.length} of ${queryResult.rows.length} matched`}
                              </span>
                            </div>
                          </div>

                          {/* Data Table */}
                          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex-1">
                            <div className="max-w-full overflow-x-auto overflow-y-auto max-h-[420px]">
                              <table className="w-full text-left border-collapse text-xs font-mono">
                                <thead className="sticky top-0 z-10">
                                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                                    <th className="p-3 font-semibold border-r border-slate-800 w-12 text-center text-slate-500">#</th>
                                    {queryResult.columns.map((col, cIdx) => {
                                      const isSorted = sqlSortColumn === col;
                                      return (
                                        <th
                                          key={`col-header-${col}-${cIdx}`}
                                          onClick={() => {
                                            if (sqlSortColumn === col) {
                                              setSqlSortDirection(sqlSortDirection === 'asc' ? 'desc' : 'asc');
                                            } else {
                                              setSqlSortColumn(col);
                                              setSqlSortDirection('asc');
                                            }
                                          }}
                                          className="p-3 font-semibold border-r border-slate-800 shrink-0 hover:bg-slate-850 hover:text-white cursor-pointer select-none transition-colors"
                                          title={`Click to sort by ${col}`}
                                        >
                                          <div className="flex items-center justify-between gap-1.5">
                                            <span>{col}</span>
                                            <span className="text-indigo-400 text-[11px]">
                                              {isSorted ? (sqlSortDirection === 'asc' ? '▲' : '▼') : <ArrowUpDown size={10} className="text-slate-600 opacity-60" />}
                                            </span>
                                          </div>
                                        </th>
                                      );
                                    })}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                                  {paginatedRows.length === 0 ? (
                                    <tr>
                                      <td colSpan={queryResult.columns.length + 1} className="p-8 text-center text-slate-500 italic font-mono bg-slate-900/10">
                                        No rows match your current search criteria.
                                      </td>
                                    </tr>
                                  ) : (
                                    paginatedRows.map((row, rIdx) => {
                                      const globalIdx = startIdx + rIdx + 1;
                                      return (
                                        <tr key={`row-${rIdx}`} className="hover:bg-slate-900/40 transition-colors">
                                          <td className="p-3 border-r border-slate-850 text-center text-slate-600 text-[10px] select-none">
                                            {globalIdx}
                                          </td>
                                          {queryResult.columns.map((col, cIdx) => {
                                            const val = row[col];
                                            let displayText = '';
                                            if (val === null || val === undefined) displayText = 'NULL';
                                            else if (typeof val === 'object') displayText = JSON.stringify(val);
                                            else displayText = String(val);
                                            
                                            return (
                                              <td key={`cell-${rIdx}-${col}-${cIdx}`} className="p-3 border-r border-slate-850 whitespace-pre-line break-words max-w-xs text-[11px] leading-relaxed">
                                                {val === null || val === undefined ? (
                                                  <span className="text-slate-600 italic">NULL</span>
                                                ) : (
                                                  displayText
                                                )}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Pagination Footer Controls */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <span>
                                Showing <strong className="text-white">{rows.length === 0 ? 0 : startIdx + 1}</strong> to <strong className="text-white">{endIdx}</strong> of <strong className="text-white">{rows.length}</strong> rows
                              </span>
                            </div>

                            {totalPages > 1 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => setSqlCurrentPage(1)}
                                  disabled={safePage === 1}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
                                  title="First Page"
                                >
                                  <ChevronsLeft size={14} />
                                </button>
                                <button
                                  onClick={() => setSqlCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={safePage === 1}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
                                  title="Previous Page"
                                >
                                  <ChevronLeft size={14} />
                                </button>

                                {getPageNumbers().map((p, pIdx) => {
                                  if (p === '...') {
                                    return <span key={`ellipsis-${pIdx}`} className="px-2 text-slate-600">...</span>;
                                  }
                                  const pageNum = Number(p);
                                  const isCurrent = pageNum === safePage;
                                  return (
                                    <button
                                      key={`sql-page-btn-${pageNum}`}
                                      onClick={() => setSqlCurrentPage(pageNum)}
                                      className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        isCurrent
                                          ? 'bg-emerald-600 text-white shadow-md'
                                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}

                                <button
                                  onClick={() => setSqlCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={safePage === totalPages}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
                                  title="Next Page"
                                >
                                  <ChevronRight size={14} />
                                </button>
                                <button
                                  onClick={() => setSqlCurrentPage(totalPages)}
                                  disabled={safePage === totalPages}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-slate-300 transition-colors cursor-pointer"
                                  title="Last Page"
                                >
                                  <ChevronsRight size={14} />
                                </button>

                                <div className="flex items-center gap-1 ml-2">
                                  <span className="text-[11px] text-slate-500">Go to:</span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={sqlJumpPage}
                                    onChange={(e) => setSqlJumpPage(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const p = parseInt(sqlJumpPage);
                                        if (!isNaN(p) && p >= 1 && p <= totalPages) {
                                          setSqlCurrentPage(p);
                                          setSqlJumpPage('');
                                        }
                                      }
                                    }}
                                    placeholder={`${safePage}`}
                                    className="w-14 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-xs text-white outline-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {!sqlError && !queryResult && (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-550 space-y-3 border border-dashed border-slate-850/60 rounded-xl bg-slate-900/5 select-none my-auto">
                        <Terminal size={26} className="text-slate-700 animate-pulse" />
                        <p className="text-xs font-mono text-slate-400">PostgreSQL reporting pipeline ready.</p>
                        <p className="text-[11px] font-mono text-slate-600 max-w-sm text-center">Execute any query above or select a preset template to load and paginate records from Cloud SQL.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Direct Cloud SQL Leads Table Inspector with Pagination */
                <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden min-h-[520px]">
                  {/* Inspector Header */}
                  <div className="bg-slate-950 border-b border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                        <Database size={14} />
                      </div>
                      <div>
                        <h2 className="text-xs font-extrabold uppercase font-mono text-white tracking-widest">Cloud SQL Leads Inspector</h2>
                        <p className="text-[10px] text-slate-500 mt-0.5">Live browse and paginate through all stored customer intelligence records</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={fetchDbLeads}
                        disabled={isDbLoading}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={12} className={isDbLoading ? 'animate-spin' : ''} />
                        <span>Refresh Table</span>
                      </button>
                      <button
                        onClick={() => handleDownloadCsv('leads')}
                        disabled={isDownloadingCsv || dbLeads.length === 0}
                        className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-950/20"
                      >
                        <Download size={12} />
                        <span>Export All ({dbLeads.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Inspector Body with Filters and Table */}
                  <div className="flex-1 p-5 space-y-3 bg-slate-950/25 flex flex-col">
                    {/* Filters Toolbar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                        <input
                          type="text"
                          value={dbTableSearch}
                          onChange={(e) => {
                            setDbTableSearch(e.target.value);
                            setDbTablePage(1);
                          }}
                          placeholder="Search company, ERP stack, contact name, or email..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 text-xs">
                          {["All", "SAP", "Odoo", "ERPNext", "Sohum ERP"].map((erp) => (
                            <button
                              key={`db-erp-pill-${erp}`}
                              onClick={() => {
                                setDbTableErpFilter(erp);
                                setDbTablePage(1);
                              }}
                              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors cursor-pointer ${
                                dbTableErpFilter === erp
                                  ? 'bg-indigo-600 text-white font-bold'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {erp}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <span className="text-[11px] text-slate-500">Rows:</span>
                          <select
                            value={dbTablePageSize}
                            onChange={(e) => {
                              setDbTablePageSize(Number(e.target.value));
                              setDbTablePage(1);
                            }}
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none font-mono cursor-pointer"
                          >
                            {[10, 15, 25, 50, 100, 250].map(sz => (
                              <option key={`dbtablesz-${sz}`} value={sz}>{sz}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Table View */}
                    {(() => {
                      let list = [...dbLeads];
                      if (dbTableErpFilter !== 'All') {
                        list = list.filter(l => l.erpFound.toLowerCase().includes(dbTableErpFilter.toLowerCase()));
                      }
                      if (dbTableSearch.trim()) {
                        const q = dbTableSearch.toLowerCase();
                        list = list.filter(l => 
                          l.company.toLowerCase().includes(q) ||
                          l.erpFound.toLowerCase().includes(q) ||
                          (l.status && l.status.toLowerCase().includes(q)) ||
                          (l.cLevelContact?.name && l.cLevelContact.name.toLowerCase().includes(q)) ||
                          (l.cLevelContact?.email && l.cLevelContact.email.toLowerCase().includes(q))
                        );
                      }

                      const totalPages = Math.max(1, Math.ceil(list.length / dbTablePageSize));
                      const safePage = Math.min(Math.max(1, dbTablePage), totalPages);
                      const startIdx = (safePage - 1) * dbTablePageSize;
                      const endIdx = Math.min(startIdx + dbTablePageSize, list.length);
                      const paginatedList = list.slice(startIdx, endIdx);

                      return (
                        <div className="space-y-3 flex-1 flex flex-col">
                          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex-1">
                            <div className="max-w-full overflow-x-auto overflow-y-auto max-h-[420px]">
                              <table className="w-full text-left border-collapse text-xs font-mono">
                                <thead className="sticky top-0 z-10">
                                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                                    <th className="p-3 font-semibold border-r border-slate-800 w-12 text-center text-slate-500">#</th>
                                    <th className="p-3 font-semibold border-r border-slate-800">Company</th>
                                    <th className="p-3 font-semibold border-r border-slate-800">ERP Detected</th>
                                    <th className="p-3 font-semibold border-r border-slate-800">Confidence</th>
                                    <th className="p-3 font-semibold border-r border-slate-800">Status</th>
                                    <th className="p-3 font-semibold border-r border-slate-800">Executive Contact</th>
                                    <th className="p-3 font-semibold border-r border-slate-800">Email</th>
                                    <th className="p-3 font-semibold">Verification</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-850 font-mono text-slate-300">
                                  {paginatedList.length === 0 ? (
                                    <tr>
                                      <td colSpan={8} className="p-8 text-center text-slate-500 italic font-mono bg-slate-900/10">
                                        No leads found matching your filter in Cloud SQL database.
                                      </td>
                                    </tr>
                                  ) : (
                                    paginatedList.map((lead, idx) => {
                                      const globalIdx = startIdx + idx + 1;
                                      return (
                                        <tr key={`dblead-${lead.company}-${idx}`} className="hover:bg-slate-900/40 transition-colors">
                                          <td className="p-3 border-r border-slate-850 text-center text-slate-600 text-[10px]">
                                            {globalIdx}
                                          </td>
                                          <td className="p-3 border-r border-slate-850 font-bold text-white">
                                            {lead.company}
                                          </td>
                                          <td className="p-3 border-r border-slate-850">
                                            <span className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                                              {lead.erpFound}
                                            </span>
                                          </td>
                                          <td className="p-3 border-r border-slate-850">
                                            <span className={`font-bold ${lead.confidenceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                              {lead.confidenceScore}%
                                            </span>
                                          </td>
                                          <td className="p-3 border-r border-slate-850 text-slate-400 text-[11px]">
                                            {lead.status || 'Active Target'}
                                          </td>
                                          <td className="p-3 border-r border-slate-850 text-[11px]">
                                            {lead.cLevelContact?.name ? (
                                              <div>
                                                <span className="font-semibold text-slate-200">{lead.cLevelContact.name}</span>
                                                {lead.cLevelContact.title && (
                                                  <span className="block text-[10px] text-slate-500">{lead.cLevelContact.title}</span>
                                                )}
                                              </div>
                                            ) : (
                                              <span className="text-slate-600 italic">Not set</span>
                                            )}
                                          </td>
                                          <td className="p-3 border-r border-slate-850 text-[11px] text-indigo-300">
                                            {lead.cLevelContact?.email || <span className="text-slate-600 italic">Not set</span>}
                                          </td>
                                          <td className="p-3 text-[11px]">
                                            {lead.isSaved ? (
                                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Verified
                                              </span>
                                            ) : (
                                              <span className="text-slate-500">Unverified</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Pagination Footer */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400">
                            <div>
                              Showing <strong className="text-white">{list.length === 0 ? 0 : startIdx + 1}</strong> to <strong className="text-white">{endIdx}</strong> of <strong className="text-white">{list.length}</strong> leads
                            </div>

                            {totalPages > 1 && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setDbTablePage(1)}
                                  disabled={safePage === 1}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                                >
                                  <ChevronsLeft size={14} />
                                </button>
                                <button
                                  onClick={() => setDbTablePage(prev => Math.max(1, prev - 1))}
                                  disabled={safePage === 1}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                                >
                                  <ChevronLeft size={14} />
                                </button>
                                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white">
                                  Page {safePage} of {totalPages}
                                </span>
                                <button
                                  onClick={() => setDbTablePage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={safePage === totalPages}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                                >
                                  <ChevronRight size={14} />
                                </button>
                                <button
                                  onClick={() => setDbTablePage(totalPages)}
                                  disabled={safePage === totalPages}
                                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 cursor-pointer"
                                >
                                  <ChevronsRight size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeMainTab === 'tuning' ? (
          <div className="flex-1 min-h-0 h-full w-full overflow-y-auto p-4 md:p-6">
            <PromptTrainer
              customDirectives={customDirectives}
              setCustomDirectives={setCustomDirectives}
              trainingExamples={trainingExamples}
              setTrainingExamples={setTrainingExamples}
              copiedIndex={copiedIndex}
              handleCopyToClipboard={handleCopyToClipboard}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 h-full w-full grid grid-cols-1 lg:grid-cols-12 max-lg:overflow-y-auto">
            {/* Column 1: Left Side targeting controller panel (leads scan parameter settings) */}
            <section id="targeting-controller" className="lg:col-span-3 p-5 border-r border-slate-800/80 bg-slate-950/20 flex flex-col gap-5 overflow-y-auto h-full min-h-0">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Search size={13} className="text-indigo-400" />
                  Lead Target Scan Setup
                </h2>
                <p className="text-xs text-slate-500 mt-1">Specify entities to scan to initiate search-grounded deep-scrapes.</p>
              </div>

          <div className="space-y-4">
            {/* Input list target companies */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex justify-between items-center">
                <span>Target Companies (One per line)</span>
                <span className="text-[10px] text-slate-500 font-normal">Supports bulk scanning</span>
              </label>
              <textarea
                rows={4}
                value={companiesInput}
                onChange={(e) => setCompaniesInput(e.target.value)}
                placeholder="Enter client company names...&#10;E.g.,&#10;Acme Manufacturing&#10;Zeta Global Corp"
                className="w-full bg-slate-950/90 hover:bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 transition-all font-mono outline-none resize-none leading-relaxed"
              />
            </div>

            {/* List Import Drag & Drop Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-xl p-4 text-center transition-all relative ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 scale-[1.01]'
                  : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950/60 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload size={16} className={isDragging ? "text-indigo-400 animate-bounce" : "text-slate-500"} />
                <p className="text-[11px] font-medium text-slate-300">
                  Drag & Drop Company List (.csv / .txt)
                </p>
                <p className="text-[9px] text-slate-500">
                  Extracts raw names dynamically into the compiler above
                </p>
              </div>
              <label className="mt-2 block">
                <span className="inline-block px-2.5 py-1 text-[10px] font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 hover:text-indigo-200 border border-indigo-800/60 rounded cursor-pointer transition-all">
                  Browse File
                </span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Optional individual person name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <User size={13} className="text-indigo-400" />
                Contact Person Lookup (Optional)
              </label>
              <input
                type="text"
                value={contactNameInput}
                onChange={(e) => setContactNameInput(e.target.value)}
                placeholder="E.g., John Doe, IT Director"
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-600 transition-all outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Checks for specific technical footprints, online resumes, and CV references associated with this professional.
              </p>
            </div>

            {/* Select search strategy metrics */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Scrape Methodology
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  type="button"
                  onClick={() => setStrategyOption("comprehensive")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    strategyOption === "comprehensive" 
                      ? 'bg-indigo-650/10 border-indigo-500/50 text-indigo-300' 
                      : 'bg-slate-950/40 border-slate-8 * :850 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <strong className="block text-white mb-0.5">Comprehensive</strong>
                  Resumes + Vendor stories
                </button>
                <button 
                  type="button"
                  onClick={() => setStrategyOption("linkedin-resumes")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    strategyOption === "linkedin-resumes" 
                      ? 'bg-indigo-650/10 border-indigo-500/50 text-indigo-300' 
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <strong className="block text-white mb-0.5">Resume Hunt</strong>
                  Inspect LinkedIn CVs
                </button>
              </div>
            </div>

            {/* Strategic tuning override override prompt */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supplemental Advisory Prompt (Refine Search Query)
              </label>
              <input
                type="text"
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                placeholder="E.g. Focus on companies headquartered in Germany"
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-600 transition-all outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Directs the model's engine towards specific geographies, sub-technologies, or search bounds.
              </p>
            </div>

            {/* Error & Success Feedback banners */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-rose-500/15 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl text-xs flex gap-2 items-start"
                >
                  <AlertCircle className="shrink-0 text-rose-400" size={16} />
                  <div>
                    <h4 className="font-semibold text-rose-200">Execution Error</h4>
                    <p className="mt-0.5 leading-relaxed text-[11px]">{errorMessage}</p>
                    <p className="mt-1.5 text-[10px] text-slate-400 underline">
                      Tip: Confirm GEMINI_API_KEY is defined in Settings &gt; Secrets.
                    </p>
                  </div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs flex gap-2 items-start"
                >
                  <CheckCircle2 className="shrink-0 text-emerald-400" size={16} />
                  <div>
                    <p className="leading-relaxed text-[11px]">{successMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-Save Toggle Option */}
            <div className="flex items-center justify-between bg-slate-950/45 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex flex-col gap-0.5 max-w-[75%]">
                <span className="text-[11px] font-semibold text-slate-300">Auto-Save Scored Stacks</span>
                <span className="text-[9px] text-slate-500 leading-normal">Persist verified lead records instantly in Cloud SQL PostgreSQL</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSaveToDb}
                  onChange={(e) => setAutoSaveToDb(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-indigo-600"></div>
              </label>
            </div>

            {/* Trigger Scanner Button */}
            <button
              onClick={handlePerformResearch}
              disabled={isScanning}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/10 hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none shrink-0"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="animate-spin text-white" size={14} />
                  <span>Scanning Net Archives...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-300" />
                  <span>SCALP ERP LEAD STACKS</span>
                </>
              )}
            </button>

            {/* Realtime progress scanning bar */}
            {isScanning && (
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 animate-pulse">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">Scan Operation Logs:</span>
                  <span className="text-indigo-400 font-semibold font-mono">Running</span>
                </div>
                {/* Simulated search grounded loader */}
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                  <p className="text-[11px] font-mono text-slate-300 truncate transition-all duration-300">
                    {scanTickerMessages[scanMessageIndex]}
                  </p>
                </div>
                <div className="w-full bg-slate-850 h-1 rounded-full mt-2.5 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-1000" 
                    style={{ width: `${((scanMessageIndex + 1) / scanTickerMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
          </div>
        </section>

        <section id="leads-hub" className="lg:col-span-4 p-5 bg-slate-900/15 flex flex-col gap-4 overflow-y-auto h-full border-r border-slate-800">

            {/* Cloud SQL Database Connected Status Banner */}
            <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1 font-mono">
                    Cloud SQL Database
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/20 uppercase font-sans font-semibold">Live</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {leads.length} records loaded from database
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    fetch('/api/leads')
                      .then(res => res.json())
                      .then(data => {
                        if (Array.isArray(data)) {
                          setLeads(data);
                          if (data.length > 0) setSelectedLead(data[0]);
                          setSuccessMessage(`Reloaded ${data.length} leads directly from Cloud SQL!`);
                        }
                      })
                      .catch(err => console.error("Error refreshing database leads:", err));
                  }}
                  className="p-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Reload fresh data from Cloud SQL"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              {clearConfirmActive ? (
                <button
                  type="button"
                  id="btn-clear-dashboard-confirm"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/leads?action=clear', { method: 'DELETE' });
                      const data = await res.json();
                      setLeads([]);
                      setSelectedLead(null);
                      setSuccessMessage("Dashboard cleared completely. You can now scan new entities!");
                      setClearConfirmActive(false);
                    } catch (e) {
                      console.error("Error clearing dashboard:", e);
                    }
                  }}
                  className="px-2.5 py-1 text-[11px] font-extrabold text-white bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-lg flex items-center gap-1 transition-all cursor-pointer animate-pulse"
                  title="Click again to finalize wipeout"
                >
                  <Trash2 size={12} />
                  <span>Click again to Confirm!</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-clear-dashboard"
                  onClick={() => {
                    setClearConfirmActive(true);
                    setResetConfirmActive(false);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-350 bg-rose-950/15 hover:bg-rose-950/25 border border-rose-900/30 hover:border-rose-900/50 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="Wipe current database cache"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              )}
              
              {resetConfirmActive ? (
                <button
                  type="button"
                  id="btn-reset-defaults-confirm"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/leads?action=reset', { method: 'DELETE' });
                      const data = await res.json();
                      if (data.leads) {
                        setLeads(data.leads);
                        setSelectedLead(data.leads[0]);
                        setSuccessMessage("Dashboard reset to benchmark sandbox targets successfully.");
                        setResetConfirmActive(false);
                      }
                    } catch (e) {
                      console.error("Error resetting defaults:", e);
                    }
                  }}
                  className="px-2.5 py-1 text-[11px] font-extrabold text-white bg-indigo-650 hover:bg-indigo-700 border border-indigo-500 rounded-lg flex items-center gap-1 transition-all cursor-pointer animate-pulse"
                  title="Click again to finalize backup restore"
                >
                  <RefreshCw size={12} />
                  <span>Click again to Confirm Reset!</span>
                </button>
              ) : (
                <button
                  type="button"
                  id="btn-reset-defaults"
                  onClick={() => {
                    setResetConfirmActive(true);
                    setClearConfirmActive(false);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="Restore default database leads"
                >
                  <RefreshCw size={12} />
                  <span>Reset Defaults</span>
                </button>
              )}
            </div>

          {/* Google Sheets Export Panel */}
          <div id="google-sheets-sync-panel" className="bg-gradient-to-r from-emerald-950/25 to-indigo-950/20 p-4.5 rounded-xl border border-emerald-900/35 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0 mt-0.5 shadow-sm shadow-emerald-950/40">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    Google Sheets Live Exporter
                    <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/10">B2B CRM Pipeline</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Export your compiled B2B Lead Intelligence (with active C-Level individual contacts, emails, phones, and actionable sales pitches) directly to Google Sheets with preconfigured professional formats.
                  </p>
                </div>
              </div>

              {googleUser ? (
                <div className="flex flex-col items-start md:items-end gap-1 text-[11px] shrink-0 self-stretch md:self-auto justify-center bg-slate-950/40 md:bg-transparent p-2.5 md:p-0 rounded-lg border border-slate-800/50 md:border-transparent">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">Connected: <strong className="text-emerald-400">{googleUser.email}</strong></span>
                  </div>
                  <button 
                    onClick={handleGoogleSignOut} 
                    className="text-[10px] text-rose-450 hover:text-rose-400 underline font-mono transition-colors self-start md:self-auto cursor-pointer"
                  >
                    Disconnect Google Account
                  </button>
                </div>
              ) : (
                <div className="shrink-0 self-stretch md:self-auto flex items-center">
                  <span className="text-[10px] text-slate-500 font-mono hidden md:inline uppercase bg-slate-950 px-2 py-1 rounded border border-slate-900">Authorization Required</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60 justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportToSheets}
                  disabled={isExportingSheets || leads.length === 0}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all outline-none border cursor-pointer ${
                    isExportingSheets
                      ? 'bg-slate-800 border-slate-700 text-slate-500'
                      : googleUser
                      ? 'bg-emerald-650 hover:bg-emerald-600 text-white border-emerald-500/40 shadow-md shadow-emerald-950/20 active:translate-y-0.5'
                      : 'bg-indigo-650 hover:bg-indigo-600 text-white border-indigo-500/40 shadow-md shadow-indigo-950/20 active:translate-y-0.5'
                  }`}
                >
                  {isExportingSheets ? (
                    <>
                      <RefreshCw className="animate-spin" size={13} />
                      <span>Generating Spreadsheet...</span>
                    </>
                  ) : googleUser ? (
                    <>
                      <FileSpreadsheet size={13} className="text-emerald-300" />
                      <span>Generate & Export Leads to Sheet</span>
                    </>
                  ) : (
                    <>
                      <User size={13} className="text-indigo-300" />
                      <span>Sign in with Google to Export</span>
                    </>
                  )}
                </button>

                {sheetsExportUrl && (
                  <a
                    href={sheetsExportUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 text-xs font-bold bg-slate-950/95 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-350 hover:text-emerald-300 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <ExternalLink size={13} />
                    <span>Open Created Sheet ↗</span>
                  </a>
                )}

                <button
                  onClick={() => handleDownloadCsv('leads')}
                  disabled={isDownloadingCsv}
                  className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Download size={13} className={isDownloadingCsv ? "animate-bounce text-emerald-400" : "text-emerald-400"} />
                  <span>Download CSV File (Instant)</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-mono">
                {leads.length} leads in queue
              </div>
            </div>

            {sheetsExportError && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 p-2.5 rounded-lg text-[11px] flex gap-2 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="flex-1 truncate">{sheetsExportError}</span>
                <button 
                  onClick={() => setSheetsExportError(null)} 
                  className="text-[10px] text-slate-500 hover:text-slate-350 font-bold px-1"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          {/* Dashboard filters and search search query panel */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
                <input
                  type="text"
                  placeholder="Keyword search by company/tech/status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800/80 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-350 placeholder-slate-600 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(!showSavedOnly)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showSavedOnly 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>★ {showSavedOnly ? 'Showing Saved Library' : 'Show Saved Leads Only'}</span>
                  {leads.filter(l => l.isSaved).length > 0 && (
                    <span className="bg-slate-950/40 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {leads.filter(l => l.isSaved).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Displaying {filteredLeads.length} matches</span>
              <div className="flex items-center gap-1.5">
                <span>Core ERP Preset:</span>
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                  {["All", "SAP", "Odoo", "ERPNext", "Sohum ERP"].map((opt, idx) => (
                    <button
                      key={`preset-opt-${opt}-${idx}`}
                      onClick={() => setFilterErp(opt)}
                      className={`px-2 py-0.5 text-[10px] rounded transition-all cursor-pointer ${
                        filterErp === opt 
                          ? 'bg-indigo-650 text-white' 
                          : 'text-slate-500 hover:text-slate-255'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
                  {/* Core high fidelity basic lead row list */}
          <div className="grid grid-cols-1 gap-2.5 pr-1">
            {filteredLeads.length === 0 ? (
              <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                <HelpCircle size={32} className="mx-auto mb-2 text-slate-600" />
                No matching leads exist in your scan history. Try redefining terms.
              </div>
            ) : (
              filteredLeads.map((lead, idx) => {
                const isSelected = selectedLead && selectedLead.company === lead.company;
                const isEditing = editingCompany && editingCompany === lead.company;
                
                if (isEditing) {
                  return (
                    <div
                      key={`${lead.company}-${idx}`}
                      className="p-3.5 rounded-xl border border-indigo-500 bg-slate-900 shadow-xl space-y-2.5 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-400 block font-mono">Row Editing Mode</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[9px] text-slate-500 uppercase font-semibold font-mono mb-0.5">Company Name</label>
                          <input
                            type="text"
                            value={editCompanyValue}
                            onChange={(e) => setEditCompanyValue(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded p-1 text-slate-200 focus:border-indigo-500 outline-none font-sans font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-500 uppercase font-semibold font-mono mb-0.5">ERP Tech Stack</label>
                          <input
                            type="text"
                            value={editErpValue}
                            onChange={(e) => setEditErpValue(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded p-1 text-slate-200 focus:border-indigo-500 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[9px] text-slate-550 uppercase font-semibold font-mono mb-0.5">Confidence ({editConfidenceValue}%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editConfidenceValue}
                            onChange={(e) => setEditConfidenceValue(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded p-1 text-slate-200 focus:border-indigo-500 outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] text-slate-550 uppercase font-semibold font-mono mb-0.5">Contact Person Name</label>
                          <input
                            type="text"
                            value={editContactNameValue}
                            onChange={(e) => setEditContactNameValue(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded p-1 text-slate-200 focus:border-indigo-500 outline-none font-sans"
                            placeholder="Person name"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingCompany(null)}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-950 hover:bg-slate-850 text-slate-400 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleVerifyLead(lead, e)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                              lead.isSaved 
                                ? 'bg-emerald-650/20 border-emerald-500 text-emerald-400' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>✓</span>
                            <span>{lead.isSaved ? 'Verified' : 'Verify'}</span>
                          </button>

                          <button
                            type="button"
                            disabled
                            className="px-2 py-0.5 rounded text-[10px] font-normal bg-slate-950/40 border border-slate-900 text-slate-600 cursor-not-allowed flex items-center gap-1"
                          >
                            <span>✎</span>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleSaveLeadRowEdits(lead.company, e)}
                            className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 hover:bg-indigo-550 text-white flex items-center gap-1 border border-indigo-500 transition-all hover:scale-105 cursor-pointer"
                          >
                            <span>💾</span>
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={`${lead.company}-${idx}`}
                    onClick={() => {
                      setSelectedLead(lead);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left hover:border-indigo-500/40 ${
                      isSelected 
                        ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-650/5' 
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-950/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-0.5 select-none flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-white truncate max-w-[12rem]">{lead.company}</h3>
                          {lead.isSaved && (
                            <span 
                              title={lead.savedByUserEmail ? `Verified by ${lead.savedByUserEmail}` : 'Verified lead'}
                              className="text-[8.5px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono font-bold shrink-0 max-w-[14rem] truncate"
                            >
                              ✓ VERIFIED {lead.savedByUserEmail ? `BY ${lead.savedByUserEmail.split('@')[0].toUpperCase()}` : ''}
                            </span>
                          )}
                          {lead.searchedInPast && (
                            <span 
                              title="Loaded instantly from history since it was searched in the past"
                              className="text-[8.5px] bg-indigo-500/15 text-indigo-450 border border-indigo-500/20 px-1.5 py-0.2 rounded font-mono font-bold shrink-0"
                            >
                              ⟲ PAST SEARCH
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-mono">
                          <span className="text-indigo-400 font-semibold">{lead.erpFound}</span>
                          <span className="text-slate-705">•</span>
                          <span>Conf: <strong className={lead.confidenceScore > 80 ? 'text-emerald-400' : 'text-amber-400'}>{lead.confidenceScore}%</strong></span>
                          {lead.cLevelContact?.name && (
                            <>
                              <span className="text-slate-705">•</span>
                              <span className="text-slate-300 truncate max-w-[8rem]">{lead.cLevelContact.name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleVerifyLead(lead, e)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 border transition-all hover:scale-105 cursor-pointer ${
                            lead.isSaved 
                              ? 'bg-emerald-650/20 border-emerald-555/40 text-emerald-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>✓</span>
                          <span>{lead.isSaved ? 'Verified' : 'Verify'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleStartEditLeadRow(lead, e)}
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:scale-105 transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>✎</span>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled
                          className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-950/40 border border-slate-900 text-slate-600 cursor-not-allowed flex items-center gap-0.5"
                        >
                          <span>💾</span>
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>

        {/* Column 3: Right Side Detailed Prospect Profile panel */}
        <aside id="lead-profile-aside" className="lg:col-span-5 p-5 bg-slate-950 flex flex-col gap-4 overflow-y-auto h-full text-left border-l border-slate-800">
          {!selectedLead && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-4 border border-dashed border-slate-800/60 rounded-2xl bg-slate-950/20 px-4 text-center h-full min-h-[30rem] select-none my-auto">
              <Building2 size={44} className="text-slate-705 animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">No Prospect Selected</h3>
                <p className="text-[11px] text-slate-500 font-sans max-w-xs leading-normal">
                  Click on any customer row in the center directory list to reveal its full target intelligence profile, temporal CV references, and customized outbound playbooks.
                </p>
              </div>
            </div>
          )}

          {/* Target Lead Detail deep panel */}
          {selectedLead && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 mt-auto space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/10 shrink-0">
                    <Building2 className="text-emerald-400" size={15} />
                  </div>
                  <div>
                    <h3 className="text-xs text-slate-500 font-semibold uppercase font-mono">Detailed Lead Audit Profile</h3>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white leading-tight">{selectedLead.company}</h2>
                      {selectedLead.searchedInPast && (
                        <span className="text-[9px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                          SEARCHED IN PAST
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const isNowSaved = !selectedLead.isSaved;
                      const updated = { 
                        ...selectedLead, 
                        isSaved: isNowSaved,
                        auditedDate: new Date().toISOString().split('T')[0]
                      };
                      syncSelectedAfterEdit(updated);
                      if (isNowSaved) {
                        setSuccessMessage(`Saving & Verifying "${selectedLead.company}" directly into Cloud SQL database...`);
                      } else {
                        setSuccessMessage(`Removed "${selectedLead.company}" verification status from database sync.`);
                      }
                      setTimeout(() => setSuccessMessage(null), 4000);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                      selectedLead.isSaved 
                        ? 'bg-emerald-650/20 border-emerald-500 text-emerald-400 shadow-lg' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>★ {selectedLead.isSaved ? 'Marked Verified' : 'Save & Verify Lead'}</span>
                  </button>
                  <span className="text-[10px] bg-indigo-950/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded font-mono">
                    Stack: {selectedLead.erpFound}
                  </span>
                </div>
              </div>

              {/* Sub tabs selector: Evidence vs Edit Details */}
              <div className="flex border-b border-slate-900 gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDetailTab('evidence')}
                  className={`pb-2 transition-all cursor-pointer ${
                    detailTab === 'evidence' 
                      ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' 
                      : 'text-slate-500 hover:text-slate-300 font-normal'
                  }`}
                >
                  🔬 In-Depth Evidence & Timeline Checks
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('edit')}
                  className={`pb-2 transition-all cursor-pointer ${
                    detailTab === 'edit' 
                      ? 'text-indigo-400 border-b-2 border-indigo-500 font-medium' 
                      : 'text-slate-500 hover:text-slate-300 font-normal'
                  }`}
                >
                  ✎ Edit & Save Verification Comments
                </button>
              </div>

              {/* Grid content detailing findings */}
              <div className="space-y-4">
                
                {detailTab === 'evidence' ? (
                  <div className="space-y-4">
                    {/* Evidence overview quote */}
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Synthesized evidence</span>
                      <p className="text-xs text-slate-300 leading-normal font-sans">
                        {selectedLead.evidence}
                      </p>
                      {selectedLead.auditorComments && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 bg-slate-950/30 p-2 rounded">
                          <strong className="text-[9px] uppercase tracking-wider block text-slate-500">Auditor verified notes:</strong>
                          &ldquo;{selectedLead.auditorComments}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* B2B Contact Intelligence & Corporate Footprints Segment */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-indigo-500/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: General Corporate Metadata */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">🏢 Corporate Footprint</span>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs bg-slate-950/45 p-2 rounded">
                            <span className="text-slate-500 font-mono">Web Domain:</span>
                            {selectedLead.website ? (
                              <a 
                                href={selectedLead.website} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 font-mono truncate max-w-[14rem]"
                              >
                                {selectedLead.website}
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-slate-600 italic">None logged</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs bg-slate-950/45 p-2 rounded">
                            <span className="text-slate-500 font-mono">Company LinkedIn:</span>
                            {selectedLead.linkedinPage ? (
                              <a 
                                href={selectedLead.linkedinPage} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline inline-flex items-center gap-1 font-mono truncate max-w-[14rem]"
                              >
                                {selectedLead.linkedinPage}
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-slate-600 italic">None logged</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Premium C-Level Executive Profile */}
                      <div className="space-y-2 md:border-l md:border-slate-800 md:pl-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">👑 Executive Decision Maker</span>
                        
                        {selectedLead.cLevelContact?.name ? (
                          <div className="space-y-2">
                            <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-200">{selectedLead.cLevelContact.name}</h4>
                                  <p className="text-[10px] text-indigo-400 font-medium">{selectedLead.cLevelContact.title}</p>
                                </div>
                                {selectedLead.cLevelContact.linkedin && (
                                  <a 
                                    href={selectedLead.cLevelContact.linkedin} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-slate-400 hover:text-indigo-400 bg-slate-900 p-1 rounded hover:bg-slate-850"
                                    title="View Executive LinkedIn"
                                  >
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="bg-slate-950/45 p-1.5 rounded flex flex-col justify-center">
                                <span className="text-slate-550 text-[8px] uppercase tracking-wider block font-mono">Direct Phone:</span>
                                <span className="text-slate-300 font-medium truncate">{selectedLead.cLevelContact.phone || "Not listed"}</span>
                              </div>
                              <div className="bg-slate-950/45 p-1.5 rounded flex flex-col justify-center relative group">
                                <span className="text-slate-550 text-[8px] uppercase tracking-wider block font-mono">Contact Email:</span>
                                {selectedLead.cLevelContact.email ? (
                                  <button 
                                    onClick={() => handleCopyToClipboard(selectedLead.cLevelContact!.email, 'email')}
                                    className="text-indigo-400 hover:text-indigo-300 hover:underline text-left truncate font-mono flex items-center justify-between"
                                  >
                                    <span className="truncate">{selectedLead.cLevelContact.email}</span>
                                    <Copy size={9} className="ml-1 shrink-0 text-slate-500 opacity-50 group-hover:opacity-100" />
                                  </button>
                                ) : (
                                  <span className="text-slate-600 block">Not listed</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-600 italic text-xs bg-slate-950/30 p-4 rounded text-center">
                            No C-Level lead profile scanned for this record.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sub-tabs mapping resume traces and partners stories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Resumes Trace log with full temporal validations */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                          <GraduationCap size={12} className="text-indigo-400" />
                          Resume & LinkedIn Timeline Checks
                        </span>
                        <ul className="space-y-2.5 text-xs">
                          {selectedLead.resumeTraces.length === 0 ? (
                            <li className="text-slate-600 italic text-[11px] bg-slate-900/20 p-2 rounded border border-slate-850">No specific resume mentions identified.</li>
                          ) : (
                            selectedLead.resumeTraces.map((trace, tIdx) => {
                              let badgeStyle = "bg-slate-905 text-slate-400 border-slate-800";
                              let checkLabel = "Unclear Period";
                              if (trace.applicableToThisTenure === 'Confirmed') {
                                badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                checkLabel = "Active Tenure Confirmed";
                              } else if (trace.applicableToThisTenure === 'Previous Role Only') {
                                badgeStyle = "bg-rose-500/10 text-rose-300 border-rose-500/20";
                                checkLabel = "Prior Job Only (Outdated)";
                              } else if (trace.applicableToThisTenure === 'No Dates') {
                                badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                                checkLabel = "Dates Omitted";
                              }

                              return (
                                <li key={`trace-${tIdx}`} className="bg-slate-900/30 p-2.5 rounded border border-slate-800/60 leading-normal text-[11px] space-y-1.5">
                                  <div className="flex items-start justify-between gap-2 border-b border-slate-900 pb-1">
                                    <div className="text-[11px] font-bold text-slate-200">
                                      {trace.personName}
                                    </div>
                                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                                      {checkLabel}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    System claimed: <strong className="text-slate-350 font-mono">{trace.erpMentioned}</strong>
                                  </div>
                                  <p className="text-[10.5px] italic text-slate-350 leading-snug bg-slate-950/40 p-1.5 rounded">
                                    <span className="font-mono text-[9px] uppercase tracking-wider block text-slate-500 font-normal">Tenure Matching Report:</span>
                                    {trace.explanation}
                                  </p>
                                  {trace.sourceSearchQueryUrl && (
                                    <div className="pt-0.5">
                                      <a
                                        href={trace.sourceSearchQueryUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline"
                                      >
                                        <span>Audit Resume Footprints</span>
                                        <ExternalLink size={8} />
                                      </a>
                                    </div>
                                  )}
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>

                      {/* Vendor partner list */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                          <BookmarkCheck size={12} className="text-emerald-400" />
                          ERP Vendor & Client Case studies
                        </span>
                        <ul className="space-y-2 text-xs">
                          {selectedLead.vendorMentions.length === 0 ? (
                            <li className="text-slate-600 italic text-[11px]">No official client success matches recorded list.</li>
                          ) : (
                            selectedLead.vendorMentions.map((mention, mIdx) => (
                              <li key={`mention-${mIdx}`} className="bg-slate-900/30 p-2 rounded border border-slate-800/60 text-slate-300 leading-normal text-[11px]">
                                {mention}
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                    /* Editable Auditor Editor Panel to input audits and comments permanently */
                    <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-850 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Company Name</label>
                          <input
                            type="text"
                            disabled
                            value={selectedLead.company}
                            className="w-full bg-slate-950/60 border border-slate-850 text-[11px] rounded-lg p-2 text-slate-500 outline-none cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Detected ERP Stack</label>
                          <input
                            type="text"
                            value={selectedLead.erpFound}
                            onChange={(e) => {
                              const updated = { ...selectedLead, erpFound: e.target.value };
                              syncSelectedAfterEdit(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">System Status Indicator</label>
                          <input
                            type="text"
                            value={selectedLead.status}
                            onChange={(e) => {
                              const updated = { ...selectedLead, status: e.target.value };
                              syncSelectedAfterEdit(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Confidence rating score ({selectedLead.confidenceScore}%)</label>
                          <div className="flex items-center gap-3">
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
                              className="flex-1 accent-indigo-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="font-mono text-slate-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{selectedLead.confidenceScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Corporate Web & LinkedIn profiles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Company Web Domain</label>
                          <input
                            type="text"
                            value={selectedLead.website || ''}
                            onChange={(e) => {
                              const updated = { ...selectedLead, website: e.target.value };
                              syncSelectedAfterEdit(updated);
                            }}
                            placeholder="E.g. https://www.company.com"
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Corporate LinkedIn Page Url</label>
                          <input
                            type="text"
                            value={selectedLead.linkedinPage || ''}
                            onChange={(e) => {
                              const updated = { ...selectedLead, linkedinPage: e.target.value };
                              syncSelectedAfterEdit(updated);
                            }}
                            placeholder="E.g. https://linkedin.com/company/handle"
                            className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Executive Contact Sub-Section */}
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">👑 Primary Contact Profile</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5 font-mono">Full Contact Name</label>
                            <input
                              type="text"
                              value={selectedLead.cLevelContact?.name || ''}
                              onChange={(e) => {
                                const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), name: e.target.value };
                                const updated = { ...selectedLead, cLevelContact: contact };
                                syncSelectedAfterEdit(updated);
                              }}
                              placeholder="E.g. John Doe"
                              className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded-lg p-1.5 text-slate-200 outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5 font-mono">Contact Title</label>
                            <input
                              type="text"
                              value={selectedLead.cLevelContact?.title || ''}
                              onChange={(e) => {
                                const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), title: e.target.value };
                                const updated = { ...selectedLead, cLevelContact: contact };
                                syncSelectedAfterEdit(updated);
                              }}
                              placeholder="E.g. CEO / CIO / CTO"
                              className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded-lg p-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5 font-mono">Direct Phone Number</label>
                            <input
                              type="text"
                              value={selectedLead.cLevelContact?.phone || ''}
                              onChange={(e) => {
                                const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), phone: e.target.value };
                                const updated = { ...selectedLead, cLevelContact: contact };
                                syncSelectedAfterEdit(updated);
                              }}
                              placeholder="E.g. +1-555-0100"
                              className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded-lg p-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5 font-mono">Corporate Email Address</label>
                            <input
                              type="text"
                              value={selectedLead.cLevelContact?.email || ''}
                              onChange={(e) => {
                                const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), email: e.target.value };
                                const updated = { ...selectedLead, cLevelContact: contact };
                                syncSelectedAfterEdit(updated);
                              }}
                              placeholder="E.g. j.doe@company.com"
                              className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded-lg p-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 text-[9px] uppercase font-bold mb-0.5 font-mono">Executive LinkedIn URL</label>
                            <input
                              type="text"
                              value={selectedLead.cLevelContact?.linkedin || ''}
                              onChange={(e) => {
                                const contact = { ...(selectedLead.cLevelContact || { name: '', title: '', phone: '', linkedin: '', email: '' }), linkedin: e.target.value };
                                const updated = { ...selectedLead, cLevelContact: contact };
                                syncSelectedAfterEdit(updated);
                              }}
                              placeholder="E.g. https://linkedin.com/in/handle"
                              className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded-lg p-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Custom Verification Comments & Override Audits (Auto-Saves to Server & CRM)</label>
                        <textarea
                          rows={3}
                          value={selectedLead.auditorComments || ''}
                          onChange={(e) => {
                            const updated = { ...selectedLead, auditorComments: e.target.value };
                            syncSelectedAfterEdit(updated);
                          }}
                          placeholder="Type notes E.g. 'Confirmed by double-checking Jenkins' previous employer dates. Found Active SAP administrator Schneider, validating actual usage of SAP S/4HANA ERP.'"
                          className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-500 resize-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1 font-mono">Outbound sales outreach recommendation pitch</label>
                        <textarea
                          rows={3}
                          value={selectedLead.actionableSalesPitch}
                          onChange={(e) => {
                            const updated = { ...selectedLead, actionableSalesPitch: e.target.value };
                            syncSelectedAfterEdit(updated);
                          }}
                          placeholder="Configure customized strategy..."
                          className="w-full bg-slate-950 border border-slate-800 text-[11px] rounded-lg p-2.5 text-slate-300 outline-none focus:border-indigo-500 resize-none leading-relaxed transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-950 pt-3">
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <span>Save Status:</span>
                          <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                            <CheckCircle2 size={10} /> Saved & locked to local memory
                          </span>
                        </div>
                        {selectedLead.auditedDate && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Audited on: <span className="text-indigo-400">{selectedLead.auditedDate}</span>
                            {selectedLead.savedByUserEmail && (
                              <span> by <strong className="text-indigo-300 font-bold">{selectedLead.savedByUserEmail}</strong></span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Proteus modern pitch module */}
                <div className="bg-indigo-950/20 rounded-xl p-4 border border-indigo-500/20 hover:border-indigo-500/35 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                      <Lightbulb size={12} />
                      Strategic Outreach Pitch Hook
                    </span>
                    <button 
                      onClick={() => handleCopyToClipboard(selectedLead.actionableSalesPitch, 'pitch')}
                      className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] flex items-center gap-1 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      {copiedIndex === 'pitch' ? (
                        <>
                          <Check size={10} className="text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={10} />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                    {selectedLead.actionableSalesPitch}
                  </p>
                </div>

                {/* Sourced URLs */}
                {selectedLead.sources && selectedLead.sources.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      Grounding references & source logs:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.sources.map((src, sIdx) => (
                        <a
                          key={`src-${sIdx}`}
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 py-1 px-2.5 rounded border border-slate-800 text-[10px] flex items-center gap-1 transition-all"
                        >
                          <span className="max-w-[12rem] truncate">{src.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </aside>

        {/* Right Side Strategy Tuning Center - satisfies user custom prompt improvement condition */}
        {false && (
          <aside id="tuning-trainer" className="lg:col-span-3 p-6 border-l border-slate-800 bg-slate-950/60 flex flex-col gap-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-400/20 px-2 py-0.5 rounded font-extrabold uppercase inline-block">ELI Context Trainer</span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2 mt-1">
                <Sliders size={15} className="text-indigo-400" />
                Prompt & Align Center
              </h2>
              <p className="text-xs text-slate-500 mt-1">Train the search engine to optimize citations, queries, and strategic outreach templates dynamically.</p>
            </div>



            {/* Custom Directives controller */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-300 flex justify-between items-center mb-1.5">
                  <span>Custom Global Rules</span>
                  <span className="text-[10px] text-slate-550">Applied in payload</span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customDirectives.map((directive, idx) => (
                    <div key={`directive-${directive.id}-${idx}`} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 flex items-start gap-2.5 text-xs">
                      <input
                        type="checkbox"
                        checked={directive.active}
                        onChange={() => handleToggleDirective(directive.id)}
                        className="mt-0.5 rounded border-slate-800 bg-slate-950 focus:ring-0 text-indigo-600 size-3.5"
                      />
                      <div className="flex-1">
                        <p className={`text-[11px] leading-relaxed ${directive.active ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                          {directive.text}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteDirective(directive.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Form to add directive */}
                <div className="flex gap-1.5 mt-2.5">
                  <input
                    type="text"
                    value={newDirective}
                    onChange={(e) => setNewDirective(e.target.value)}
                    placeholder="New strategic search guideline..."
                    className="flex-1 bg-slate-950 border border-slate-800 text-[11px] rounded-lg px-2.5 py-1.5 text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddDirective}
                    className="p-1.5 bg-indigo-650 hover:bg-indigo-600 rounded-lg text-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Few-Shot Model Alignment Section */}
              <div className="border-t border-slate-900 pt-4">
                <h3 className="text-xs font-semibold text-slate-300 flex justify-between items-center mb-1.5">
                  <span>Few-Shot Learning Examples</span>
                  <HelpCircle size={11} className="text-slate-550" title="Provides explicit structural alignment examples so the LLM outputs expected results." />
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {trainingExamples.map((ex, idx) => (
                    <div key={`ex-${ex.id}-${idx}`} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex flex-col gap-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-300">{ex.company}</strong>
                        <span className="text-[9px] bg-slate-850 text-slate-400 py-0.5 px-1.5 rounded">{ex.erpFound}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] leading-snug">{ex.evidence}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-600 mt-1">
                        <span>Source: {ex.source}</span>
                        <button onClick={() => handleDeleteExample(ex.id)} className="hover:text-rose-400">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to add few shot ex */}
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 mt-2.5 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Training Example</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Company"
                      value={newExCompany}
                      onChange={(e) => setNewExCompany(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded p-1 text-slate-300 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ERP Stack"
                      value={newExErp}
                      onChange={(e) => setNewExErp(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-[10px] rounded p-1 text-slate-300 outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Brief Evidence"
                    value={newExEvidence}
                    onChange={(e) => setNewExEvidence(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-[10px] p-1 rounded text-slate-300 outline-none"
                  />
                  <button
                    onClick={handleAddExample}
                    className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-white font-medium rounded text-[10px]"
                  >
                    Inject Training Example
                  </button>
                </div>
              </div>

              {/* Informational Advisory Note */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-850/80 leading-normal">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1 mb-1">
                  <GraduationCap size={13} />
                  How Context Tuning Works
                </span>
                <p className="text-[10px] text-slate-400">
                  By adding Custom Rules and Few-Shot Learning examples, you directly align in-context weights of the Google Gemini search queries. The scanner combines these with real-time Google search indices, returning highly precise stack detection models configured for Proteus Technologies.
                </p>
              </div>

            </div>
          </aside>
        )}
          </div>
        )}

      </div>

      {/* High-fidelity Lead Sheet Exporter Footer */}
      <footer id="main-footer" className="bg-slate-950 border-t border-slate-800 py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 relative z-10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span>&copy; {new Date().getFullYear()} Proteus Technologies Inc.</span>
          <span className="text-slate-700">|</span>
          <span>Lead Intelligence Console</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px]">Database Leads: <strong className="text-slate-300">{totalLeadsCount} records</strong></span>
          
          {/* CSV exporter placeholder utility */}
          <button 
            onClick={() => handleDownloadCsv('leads')}
            disabled={isDownloadingCsv}
            className="text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 p-1.5 px-3 hover:bg-slate-800 cursor-pointer shadow-sm"
          >
            <Download size={13} className="text-emerald-400" />
            <span>Download Lead Sheets (CSV)</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
