import { db } from './index.ts';
import { users, authorizedUsers, authLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email: email.toLowerCase().trim(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email.toLowerCase().trim(),
        },
      })
      .returning();

    return result[0];
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
  const registeredEmailSet = new Set(registeredUsers.map(u => u.email.toLowerCase().trim()));

  return whitelist.map(entry => {
    const isDomain = !entry.emailOrDomain.includes('@');
    return {
      ...entry,
      isRegistered: isDomain ? true : registeredEmailSet.has(entry.emailOrDomain.toLowerCase().trim())
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
