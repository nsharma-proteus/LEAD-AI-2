import { db } from './index.ts';
import { users, authorizedUsers, authLogs } from './schema.ts';
import { eq, desc, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  passwordHash?: string | null;
  salt?: string | null;
  name?: string | null;
  role?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface WhitelistEntry {
  id: number;
  emailOrDomain: string;
  role: string;
  createdAt?: Date | null;
}

export interface AuthLogEntry {
  id: number;
  email: string;
  action: string;
  status: string;
  reason?: string | null;
  ipAddress?: string | null;
  createdAt?: Date | null;
}

// Fallback JSON file paths
const USERS_STORE_PATH = path.join(process.cwd(), 'users_store.json');
const WHITELIST_STORE_PATH = path.join(process.cwd(), 'whitelist_store.json');
const AUTH_LOGS_STORE_PATH = path.join(process.cwd(), 'auth_logs_store.json');

// Default initial whitelist entries
const DEFAULT_WHITELIST: WhitelistEntry[] = [
  { id: 1, emailOrDomain: 'nsharma@proteustech.in', role: 'admin', createdAt: new Date('2026-06-13T04:55:09.679Z') },
  { id: 2, emailOrDomain: 'proteustech.in', role: 'admin', createdAt: new Date('2026-06-13T04:55:12.274Z') },
  { id: 5, emailOrDomain: 'brijesh.jadav@proteustech.in', role: 'user', createdAt: new Date('2026-07-30T07:14:32.513Z') }
];

function readJsonFile<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultVal;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initialize local stores with defaults if files do not exist
function ensureLocalStoresInitialized() {
  if (!fs.existsSync(WHITELIST_STORE_PATH)) {
    writeJsonFile(WHITELIST_STORE_PATH, DEFAULT_WHITELIST);
  }
  if (!fs.existsSync(USERS_STORE_PATH)) {
    writeJsonFile(USERS_STORE_PATH, []);
  }
  if (!fs.existsSync(AUTH_LOGS_STORE_PATH)) {
    writeJsonFile(AUTH_LOGS_STORE_PATH, []);
  }
}
ensureLocalStoresInitialized();

// Find a user record in Cloud SQL or fallback JSON by email (case-insensitive)
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!cleanEmail) return null;

  // 1. Try Cloud SQL first
  try {
    const records = await db.select().from(users);
    const matched = records.find(u => u.email.toLowerCase().trim() === cleanEmail);
    if (matched) {
      // Sync to local fallback
      const localUsers = readJsonFile<DbUser[]>(USERS_STORE_PATH, []);
      const idx = localUsers.findIndex(u => u.email.toLowerCase().trim() === cleanEmail);
      if (idx >= 0) {
        localUsers[idx] = matched;
      } else {
        localUsers.push(matched);
      }
      writeJsonFile(USERS_STORE_PATH, localUsers);
      return matched;
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL query failed, falling back to local users store:", (err as Error).message);
  }

  // 2. Fallback to local store
  const localUsers = readJsonFile<DbUser[]>(USERS_STORE_PATH, []);
  const matchedLocal = localUsers.find(u => u.email.toLowerCase().trim() === cleanEmail);
  return matchedLocal || null;
}

// Save or update user credentials (password hash, salt, role, name) persistently in Cloud SQL and local fallback
export async function saveUserCredentials({
  email,
  passwordHash,
  salt,
  name,
  role = 'user',
  uid,
}: {
  email: string;
  passwordHash: string;
  salt: string;
  name?: string;
  role?: string;
  uid?: string;
}): Promise<DbUser> {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await getUserByEmail(cleanEmail);
  const now = new Date();

  let savedUser: DbUser | null = null;

  // 1. Try to save to Cloud SQL
  try {
    if (existing && existing.id) {
      const updated = await db.update(users)
        .set({
          passwordHash,
          salt,
          name: name || existing.name || cleanEmail.split('@')[0],
          role: role || existing.role || 'user',
          updatedAt: now,
        })
        .where(eq(users.id, existing.id))
        .returning();
      if (updated && updated.length > 0) {
        savedUser = updated[0] as DbUser;
      }
    } else {
      const finalUid = uid || ('user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7));
      const inserted = await db.insert(users)
        .values({
          uid: finalUid,
          email: cleanEmail,
          passwordHash,
          salt,
          name: name || cleanEmail.split('@')[0],
          role: role || 'user',
        })
        .returning();
      if (inserted && inserted.length > 0) {
        savedUser = inserted[0] as DbUser;
      }
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL save credentials failed, saving to local users store:", (err as Error).message);
  }

  // 2. Always persist/update in local store as well
  const localUsers = readJsonFile<DbUser[]>(USERS_STORE_PATH, []);
  const localIdx = localUsers.findIndex(u => u.email.toLowerCase().trim() === cleanEmail);
  const localRecord: DbUser = {
    id: savedUser?.id || (existing?.id || (localUsers.length > 0 ? Math.max(...localUsers.map(u => u.id || 0)) + 1 : 100)),
    uid: savedUser?.uid || uid || existing?.uid || ('user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)),
    email: cleanEmail,
    passwordHash,
    salt,
    name: name || existing?.name || cleanEmail.split('@')[0],
    role: role || existing?.role || 'user',
    updatedAt: now,
  };

  if (localIdx >= 0) {
    localUsers[localIdx] = { ...localUsers[localIdx], ...localRecord };
  } else {
    localUsers.push(localRecord);
  }
  writeJsonFile(USERS_STORE_PATH, localUsers);

  return savedUser || localRecord;
}

// Create or update a user upon successful authentication
export async function getOrCreateUser(uid: string, email: string, name?: string, role?: string): Promise<DbUser> {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await getUserByEmail(cleanEmail);
  const now = new Date();

  let savedUser: DbUser | null = null;
  try {
    if (existing && existing.id) {
      const updated = await db.update(users)
        .set({
          uid: uid || existing.uid,
          name: name || existing.name || cleanEmail.split('@')[0],
          role: role || existing.role || 'user',
          updatedAt: now,
        })
        .where(eq(users.id, existing.id))
        .returning();
      if (updated && updated.length > 0) {
        savedUser = updated[0] as DbUser;
      }
    } else {
      const result = await db.insert(users)
        .values({
          uid,
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          role: role || 'user',
        })
        .returning();
      if (result && result.length > 0) {
        savedUser = result[0] as DbUser;
      }
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL getOrCreateUser failed, using local store:", (err as Error).message);
  }

  const localUsers = readJsonFile<DbUser[]>(USERS_STORE_PATH, []);
  const localIdx = localUsers.findIndex(u => u.email.toLowerCase().trim() === cleanEmail);
  const localRecord: DbUser = {
    id: savedUser?.id || (existing?.id || (localUsers.length > 0 ? Math.max(...localUsers.map(u => u.id || 0)) + 1 : 100)),
    uid: uid || existing?.uid || ('user-' + Date.now()),
    email: cleanEmail,
    name: name || existing?.name || cleanEmail.split('@')[0],
    role: role || existing?.role || 'user',
    passwordHash: existing?.passwordHash || null,
    salt: existing?.salt || null,
    updatedAt: now,
  };

  if (localIdx >= 0) {
    localUsers[localIdx] = { ...localUsers[localIdx], ...localRecord };
  } else {
    localUsers.push(localRecord);
  }
  writeJsonFile(USERS_STORE_PATH, localUsers);

  return savedUser || localRecord;
}

// Check if email or domain is authorized under User Master Whitelist
export async function isEmailOrDomainAuthorized(email: string): Promise<{ authorized: boolean; role: 'admin' | 'user' }> {
  const lowerEmail = (email || '').toLowerCase().trim();
  const domain = lowerEmail.split('@')[1]?.toLowerCase().trim();

  // Admin emails
  if (lowerEmail === 'nsharma@proteustech.in' || lowerEmail.includes('admin')) {
    return { authorized: true, role: 'admin' };
  }

  // 1. Try Cloud SQL
  try {
    if (domain) {
      const allRecords = await db.select().from(authorizedUsers);
      const exactRecord = allRecords.find(r => r.emailOrDomain.toLowerCase().trim() === lowerEmail);
      if (exactRecord) {
        return { authorized: true, role: exactRecord.role as 'admin' | 'user' };
      }

      const domainRecord = allRecords.find(r => r.emailOrDomain.toLowerCase().trim() === domain);
      if (domainRecord) {
        return { authorized: true, role: domainRecord.role as 'admin' | 'user' };
      }
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL whitelist check failed, checking local whitelist:", (err as Error).message);
  }

  // 2. Try Local Whitelist Store
  const localWhitelist = readJsonFile<WhitelistEntry[]>(WHITELIST_STORE_PATH, DEFAULT_WHITELIST);
  const exactLocal = localWhitelist.find(r => r.emailOrDomain.toLowerCase().trim() === lowerEmail);
  if (exactLocal) {
    return { authorized: true, role: exactLocal.role as 'admin' | 'user' };
  }
  if (domain) {
    const domainLocal = localWhitelist.find(r => r.emailOrDomain.toLowerCase().trim() === domain);
    if (domainLocal) {
      return { authorized: true, role: domainLocal.role as 'admin' | 'user' };
    }
  }

  // Default fallback: Always authorize authenticated users as 'user' (or 'admin' for proteustech.in)
  const defaultRole = (domain === 'proteustech.in' || lowerEmail.includes('nsharma')) ? 'admin' : 'user';
  return { authorized: true, role: defaultRole };
}

// Log authentication attempts, checks, logins, and registrations
export async function logAuthActivity(
  email: string,
  action: string,
  status: 'SUCCESS' | 'DENIED' | 'FAILED',
  reason: string,
  ipAddress?: string
) {
  const cleanEmail = email ? email.toLowerCase().trim() : 'unknown';
  const now = new Date();

  // 1. Try Cloud SQL
  try {
    await db.insert(authLogs)
      .values({
        email: cleanEmail,
        action,
        status,
        reason,
        ipAddress: ipAddress || null,
      });
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL logAuthActivity failed:", (err as Error).message);
  }

  // 2. Always log to local store
  try {
    const logs = readJsonFile<AuthLogEntry[]>(AUTH_LOGS_STORE_PATH, []);
    logs.unshift({
      id: logs.length + 1,
      email: cleanEmail,
      action,
      status,
      reason,
      ipAddress: ipAddress || null,
      createdAt: now,
    });
    // Keep last 200 logs
    if (logs.length > 200) logs.length = 200;
    writeJsonFile(AUTH_LOGS_STORE_PATH, logs);
  } catch (err) {
    console.error("Failed to write to local auth_logs_store.json:", err);
  }
}

// Get recent authentication audit logs for admin review
export async function getAuthLogsList(limitCount = 100) {
  try {
    const records = await db.select()
      .from(authLogs)
      .orderBy(desc(authLogs.createdAt))
      .limit(limitCount);
    if (records && records.length > 0) {
      return records;
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL getAuthLogsList failed, using local store:", (err as Error).message);
  }

  const localLogs = readJsonFile<AuthLogEntry[]>(AUTH_LOGS_STORE_PATH, []);
  return localLogs.slice(0, limitCount);
}

// Retrieve master whitelist table for the Admin Users console
export async function getAuthorizedUsersList() {
  let whitelist: WhitelistEntry[] = [];
  let registeredUsers: DbUser[] = [];

  // 1. Try Cloud SQL
  try {
    const dbWhitelist = await db.select().from(authorizedUsers).orderBy(authorizedUsers.emailOrDomain);
    const dbUsers = await db.select().from(users);
    if (dbWhitelist && dbWhitelist.length > 0) {
      whitelist = dbWhitelist;
      registeredUsers = dbUsers;
      // Sync to local
      writeJsonFile(WHITELIST_STORE_PATH, dbWhitelist);
      writeJsonFile(USERS_STORE_PATH, dbUsers);
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL getAuthorizedUsersList failed, using local whitelist:", (err as Error).message);
  }

  // 2. If Cloud SQL had no results or threw, use local store
  if (whitelist.length === 0) {
    whitelist = readJsonFile<WhitelistEntry[]>(WHITELIST_STORE_PATH, DEFAULT_WHITELIST);
    registeredUsers = readJsonFile<DbUser[]>(USERS_STORE_PATH, []);
  }

  // Ensure default authorized emails (e.g. brijesh.jadav@proteustech.in, nsharma@proteustech.in) are present
  for (const def of DEFAULT_WHITELIST) {
    if (!whitelist.some(w => w.emailOrDomain.toLowerCase().trim() === def.emailOrDomain.toLowerCase().trim())) {
      whitelist.push(def);
    }
  }

  // Map of email -> user record with password_hash status
  const userMap = new Map<string, DbUser>();
  for (const u of registeredUsers) {
    userMap.set(u.email.toLowerCase().trim(), u);
  }

  return whitelist.map(entry => {
    const cleanTerm = entry.emailOrDomain.toLowerCase().trim();
    const isDomain = !cleanTerm.includes('@');
    const matchedUser = userMap.get(cleanTerm);
    const hasPasswordSet = Boolean(matchedUser && matchedUser.passwordHash);

    return {
      ...entry,
      isRegistered: isDomain ? true : hasPasswordSet,
      hasPasswordSet,
      userId: matchedUser?.id,
      userUid: matchedUser?.uid,
    };
  });
}

// Add an email or domain to the User Master Whitelist
export async function addAuthorizedUser(emailOrDomain: string, role: string = 'user') {
  const cleanTerm = emailOrDomain.toLowerCase().trim();
  let resultRecord: WhitelistEntry | null = null;

  // 1. Try Cloud SQL
  try {
    const result = await db.insert(authorizedUsers)
      .values({
        emailOrDomain: cleanTerm,
        role: role,
      })
      .onConflictDoUpdate({
        target: authorizedUsers.emailOrDomain,
        set: { role: role }
      })
      .returning();
    if (result && result.length > 0) {
      resultRecord = result[0];
    }
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL addAuthorizedUser failed, adding to local store:", (err as Error).message);
  }

  // 2. Update local store
  const localWhitelist = readJsonFile<WhitelistEntry[]>(WHITELIST_STORE_PATH, DEFAULT_WHITELIST);
  const existingIdx = localWhitelist.findIndex(w => w.emailOrDomain.toLowerCase().trim() === cleanTerm);
  const newEntry: WhitelistEntry = {
    id: resultRecord?.id || (existingIdx >= 0 ? localWhitelist[existingIdx].id : (localWhitelist.length > 0 ? Math.max(...localWhitelist.map(w => w.id)) + 1 : 10)),
    emailOrDomain: cleanTerm,
    role: role,
    createdAt: resultRecord?.createdAt || new Date(),
  };

  if (existingIdx >= 0) {
    localWhitelist[existingIdx] = newEntry;
  } else {
    localWhitelist.push(newEntry);
  }
  writeJsonFile(WHITELIST_STORE_PATH, localWhitelist);

  return resultRecord || newEntry;
}

// Remove an entry by primary key ID matches
export async function removeAuthorizedUser(id: number) {
  // 1. Try Cloud SQL
  try {
    await db.delete(authorizedUsers)
      .where(eq(authorizedUsers.id, id));
  } catch (err) {
    console.warn("[DB FALLBACK] Cloud SQL removeAuthorizedUser failed:", (err as Error).message);
  }

  // 2. Remove from local store
  const localWhitelist = readJsonFile<WhitelistEntry[]>(WHITELIST_STORE_PATH, DEFAULT_WHITELIST);
  const filtered = localWhitelist.filter(w => w.id !== id);
  writeJsonFile(WHITELIST_STORE_PATH, filtered);
  return [{ id }];
}


