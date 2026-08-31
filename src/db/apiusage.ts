import fs from 'fs';
import path from 'path';

export interface ApiUsageLog {
  id: string;
  timestamp: string; // ISO 8601
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
  googleSearchCalls: number; // Grounding search calls count
  estimatedCostUsd: number;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

const API_USAGE_STORE_PATH = path.join(process.cwd(), 'api_usage_store.json');

// Gemini 2.5/3.5 Flash standard pricing constants (per million tokens & per 1000 search queries)
// Input: ~$0.075 / 1M tokens ($0.000000075 / token)
// Output: ~$0.30 / 1M tokens ($0.0000003 / token)
// Google Search Grounding: ~$0.035 per search query (35 per 1000 searches)
const COST_PER_INPUT_TOKEN = 0.0000001;
const COST_PER_OUTPUT_TOKEN = 0.0000004;
const COST_PER_GROUNDED_SEARCH = 0.035;

function readUsageLogs(): ApiUsageLog[] {
  try {
    if (fs.existsSync(API_USAGE_STORE_PATH)) {
      const content = fs.readFileSync(API_USAGE_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading api_usage_store.json:', err);
  }
  return [];
}

function writeUsageLogs(logs: ApiUsageLog[]) {
  try {
    // Keep up to latest 5000 records to maintain high performance
    const trimmed = logs.slice(-5000);
    fs.writeFileSync(API_USAGE_STORE_PATH, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing api_usage_store.json:', err);
  }
}

// Ensure store exists
export function initApiUsageStore() {
  if (!fs.existsSync(API_USAGE_STORE_PATH)) {
    // Seed initial mock historical usage so the user sees informative charts right away
    const now = new Date();
    const seedLogs: ApiUsageLog[] = [];
    const seedUsers = ['nsharma@proteustech.in', 'brijesh.jadav@proteustech.in', 'microservice:Proteus Lead AI Client'];
    
    for (let i = 14; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const callCount = Math.floor(Math.random() * 8) + 2;
      for (let j = 0; j < callCount; j++) {
        const u = seedUsers[Math.floor(Math.random() * seedUsers.length)];
        const companies = ['Reliance Industries', 'Tata Steel', 'Mahindra', 'Infosys', 'L&T'].slice(0, Math.floor(Math.random() * 3) + 1);
        const promptTokens = companies.length * (450 + Math.floor(Math.random() * 200));
        const compTokens = companies.length * (650 + Math.floor(Math.random() * 350));
        const searchCalls = companies.length;
        const cost = (promptTokens * COST_PER_INPUT_TOKEN) + (compTokens * COST_PER_OUTPUT_TOKEN) + (searchCalls * COST_PER_GROUNDED_SEARCH);
        
        seedLogs.push({
          id: `log-${d.getTime()}-${j}`,
          timestamp: new Date(d.getTime() + j * 3600000).toISOString(),
          userEmail: u,
          userName: u.includes('@') ? u.split('@')[0] : 'Proteus Microservice Engine',
          apiKeyName: u.startsWith('microservice') ? 'Master Production Microservice Key' : undefined,
          source: u.startsWith('microservice') ? 'microservice_api' : 'web_ui',
          endpoint: u.startsWith('microservice') ? '/api/v1/leads/discover' : '/api/leads/discover',
          companyCount: companies.length,
          companiesSearched: companies,
          modelUsed: 'gemini-3.5-flash',
          estimatedPromptTokens: promptTokens,
          estimatedCompletionTokens: compTokens,
          totalTokens: promptTokens + compTokens,
          googleSearchCalls: searchCalls,
          estimatedCostUsd: Number(cost.toFixed(4)),
          latencyMs: 1800 + Math.floor(Math.random() * 2200),
          status: 'SUCCESS'
        });
      }
    }
    writeUsageLogs(seedLogs);
  }
}
initApiUsageStore();

export interface LogUsageParams {
  userEmail: string;
  userName?: string;
  apiKeyName?: string;
  source: 'web_ui' | 'microservice_api';
  endpoint: string;
  companiesSearched: string[];
  modelUsed?: string;
  promptTokens?: number;
  completionTokens?: number;
  groundedSearchCount?: number;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

// Record an API execution event
export async function logApiUsage(params: LogUsageParams): Promise<ApiUsageLog> {
  const logs = readUsageLogs();
  const companyCount = Math.max(1, params.companiesSearched.length);
  
  // Estimate tokens if not directly available from model response metadata
  const promptTokens = params.promptTokens || (companyCount * 550);
  const compTokens = params.completionTokens || (companyCount * 850);
  const searchCalls = params.groundedSearchCount !== undefined ? params.groundedSearchCount : companyCount;
  
  const estimatedCost = (promptTokens * COST_PER_INPUT_TOKEN) + 
                        (compTokens * COST_PER_OUTPUT_TOKEN) + 
                        (searchCalls * COST_PER_GROUNDED_SEARCH);

  const entry: ApiUsageLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userEmail: (params.userEmail || 'unknown@proteustech.in').toLowerCase().trim(),
    userName: params.userName || params.userEmail.split('@')[0],
    apiKeyName: params.apiKeyName,
    source: params.source,
    endpoint: params.endpoint,
    companyCount,
    companiesSearched: params.companiesSearched,
    modelUsed: params.modelUsed || 'gemini-3.5-flash',
    estimatedPromptTokens: promptTokens,
    estimatedCompletionTokens: compTokens,
    totalTokens: promptTokens + compTokens,
    googleSearchCalls: searchCalls,
    estimatedCostUsd: Number(estimatedCost.toFixed(4)),
    latencyMs: params.latencyMs,
    status: params.status,
    errorMessage: params.errorMessage
  };

  logs.push(entry);
  writeUsageLogs(logs);
  return entry;
}

export interface UsageAnalyticsFilter {
  userEmail?: string;
  startDate?: string; // ISO string or YYYY-MM-DD
  endDate?: string;   // ISO string or YYYY-MM-DD
  source?: 'all' | 'web_ui' | 'microservice_api';
}

export interface UsageAnalyticsResult {
  totalCalls: number;
  totalCompaniesResearched: number;
  totalCostUsd: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalGroundingSearches: number;
  averageLatencyMs: number;
  successRatePercentage: number;
  
  // Breakdowns
  byUser: Array<{
    userEmail: string;
    calls: number;
    companiesCount: number;
    costUsd: number;
    tokens: number;
    lastActive: string;
  }>;
  byDate: Array<{
    date: string; // YYYY-MM-DD
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
  recentLogs: ApiUsageLog[];
}

// Query analytics with filters
export async function getUsageAnalytics(filters: UsageAnalyticsFilter = {}): Promise<UsageAnalyticsResult> {
  const logs = readUsageLogs();
  
  let filtered = logs;

  if (filters.userEmail && filters.userEmail !== 'all') {
    const target = filters.userEmail.toLowerCase().trim();
    filtered = filtered.filter(l => l.userEmail.toLowerCase().includes(target));
  }

  if (filters.source && filters.source !== 'all') {
    filtered = filtered.filter(l => l.source === filters.source);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    filtered = filtered.filter(l => new Date(l.timestamp).getTime() >= start);
  }

  if (filters.endDate) {
    // Include the entire end date till 23:59:59
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    const endMs = end.getTime();
    filtered = filtered.filter(l => new Date(l.timestamp).getTime() <= endMs);
  }

  // Sort descending by timestamp
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  let totalCost = 0;
  let totalPromptTokens = 0;
  let totalCompTokens = 0;
  let totalGroundingSearches = 0;
  let totalLatency = 0;
  let successCount = 0;
  let totalCompanies = 0;

  const userMap: Record<string, { calls: number; companiesCount: number; costUsd: number; tokens: number; lastActive: string }> = {};
  const dateMap: Record<string, { calls: number; costUsd: number; companiesCount: number; tokens: number }> = {};
  const sourceBreakdown = {
    webUiCalls: 0,
    webUiCost: 0,
    microserviceCalls: 0,
    microserviceCost: 0
  };

  for (const log of filtered) {
    totalCost += log.estimatedCostUsd || 0;
    totalPromptTokens += log.estimatedPromptTokens || 0;
    totalCompTokens += log.estimatedCompletionTokens || 0;
    totalGroundingSearches += log.googleSearchCalls || 0;
    totalLatency += log.latencyMs || 0;
    totalCompanies += log.companyCount || 1;
    if (log.status === 'SUCCESS') successCount++;

    // User aggregation
    const u = log.userEmail || 'unknown';
    if (!userMap[u]) {
      userMap[u] = { calls: 0, companiesCount: 0, costUsd: 0, tokens: 0, lastActive: log.timestamp };
    }
    userMap[u].calls += 1;
    userMap[u].companiesCount += log.companyCount || 1;
    userMap[u].costUsd += log.estimatedCostUsd || 0;
    userMap[u].tokens += log.totalTokens || 0;
    if (new Date(log.timestamp) > new Date(userMap[u].lastActive)) {
      userMap[u].lastActive = log.timestamp;
    }

    // Date aggregation (YYYY-MM-DD)
    const d = log.timestamp.split('T')[0];
    if (!dateMap[d]) {
      dateMap[d] = { calls: 0, costUsd: 0, companiesCount: 0, tokens: 0 };
    }
    dateMap[d].calls += 1;
    dateMap[d].costUsd += log.estimatedCostUsd || 0;
    dateMap[d].companiesCount += log.companyCount || 1;
    dateMap[d].tokens += log.totalTokens || 0;

    // Source breakdown
    if (log.source === 'microservice_api') {
      sourceBreakdown.microserviceCalls += 1;
      sourceBreakdown.microserviceCost += log.estimatedCostUsd || 0;
    } else {
      sourceBreakdown.webUiCalls += 1;
      sourceBreakdown.webUiCost += log.estimatedCostUsd || 0;
    }
  }

  const byUser = Object.keys(userMap).map(u => ({
    userEmail: u,
    calls: userMap[u].calls,
    companiesCount: userMap[u].companiesCount,
    costUsd: Number(userMap[u].costUsd.toFixed(4)),
    tokens: userMap[u].tokens,
    lastActive: userMap[u].lastActive
  })).sort((a, b) => b.costUsd - a.costUsd);

  const byDate = Object.keys(dateMap).sort().map(d => ({
    date: d,
    calls: dateMap[d].calls,
    costUsd: Number(dateMap[d].costUsd.toFixed(4)),
    companiesCount: dateMap[d].companiesCount,
    tokens: dateMap[d].tokens
  }));

  return {
    totalCalls: filtered.length,
    totalCompaniesResearched: totalCompanies,
    totalCostUsd: Number(totalCost.toFixed(4)),
    totalPromptTokens,
    totalCompletionTokens: totalCompTokens,
    totalTokens: totalPromptTokens + totalCompTokens,
    totalGroundingSearches,
    averageLatencyMs: filtered.length > 0 ? Math.round(totalLatency / filtered.length) : 0,
    successRatePercentage: filtered.length > 0 ? Math.round((successCount / filtered.length) * 100) : 100,
    byUser,
    byDate,
    bySource: {
      webUiCalls: sourceBreakdown.webUiCalls,
      webUiCost: Number(sourceBreakdown.webUiCost.toFixed(4)),
      microserviceCalls: sourceBreakdown.microserviceCalls,
      microserviceCost: Number(sourceBreakdown.microserviceCost.toFixed(4))
    },
    recentLogs: filtered.slice(0, 100) // latest 100 logs
  };
}
