import { db } from './index.ts';
import { users, authorizedUsers, authLogs } from './schema.ts';
import { eq, desc, sql } from 'drizzle-orm';

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

// Find a user record in Cloud SQL by email (case-insensitive)
export async function getUserByEmail(email: string): Promise<DbUser | null> {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) return null;
    const records = await db.select().from(users);
    const matched = records.find(u => u.email.toLowerCase().trim() === cleanEmail);
    return matched || null;
  } catch (err) {
    console.error("Failed to query user by email from Cloud SQL:", err);
    return null;
  }
}

// Save or update user credentials (password hash, salt, role, name) persistently in Cloud SQL
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

  if (existing) {
    const updated = await db.update(users)
      .set({
        passwordHash,
        salt,
        name: name || existing.name || cleanEmail.split('@')[0],
        role: role || existing.role || 'user',
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated[0] as DbUser;
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
    return inserted[0] as DbUser;
  }
}

// Create or update a user upon successful authentication
export async function getOrCreateUser(uid: string, email: string, name?: string, role?: string): Promise<DbUser> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      const updated = await db.update(users)
        .set({
          uid: uid || existing.uid,
          name: name || existing.name || cleanEmail.split('@')[0],
          role: role || existing.role || 'user',
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated[0] as DbUser;
    }

    const result = await db.insert(users)
      .values({
        uid,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: role || 'user',
      })
      .returning();

    return result[0] as DbUser;
  } catch (err) {
    console.error("Failed to get or create user in Cloud SQL:", err);
    throw err;
  }
}

// Check if email or domain is authorized under User Master Whitelist
export async function isEmailOrDomainAuthorized(email: string): Promise<{ authorized: boolean; role: 'admin' | 'user' }> {
  const lowerEmail = (email || '').toLowerCase().trim();
  const domain = lowerEmail.split('@')[1]?.toLowerCase().trim();

  // Admin emails
  if (lowerEmail === 'nsharma@proteustech.in' || lowerEmail.includes('admin')) {
    return { authorized: true, role: 'admin' };
  }

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
    console.error("Error checking auth whitelist in CRM:", err);
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
  try {
    const cleanEmail = email ? email.toLowerCase().trim() : 'unknown';
    const result = await db.insert(authLogs)
      .values({
        email: cleanEmail,
        action,
        status,
        reason,
        ipAddress: ipAddress || null,
      })
      .returning();
    return result[0];
  } catch (err) {
    console.error("Failed to write to auth_logs table:", err);
  }
}

// Get recent authentication audit logs for admin review
export async function getAuthLogsList(limitCount = 100) {
  try {
    return await db.select()
      .from(authLogs)
      .orderBy(desc(authLogs.createdAt))
      .limit(limitCount);
  } catch (err) {
    console.error("Failed to fetch auth logs:", err);
    return [];
  }
}

// Retrieve master whitelist table for the Admin Users console
export async function getAuthorizedUsersList() {
  const whitelist = await db.select().from(authorizedUsers).orderBy(authorizedUsers.emailOrDomain);
  const registeredUsers = await db.select().from(users);
  
  // Map of email -> user record with password_hash status
  const userMap = new Map<string, typeof registeredUsers[0]>();
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
  return result[0];
}

// Remove an entry by primary key ID matches
export async function removeAuthorizedUser(id: number) {
  return await db.delete(authorizedUsers)
    .where(eq(authorizedUsers.id, id))
    .returning();
}

