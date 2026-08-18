import { db } from '../src/db/index.ts';
import { users, leads, authorizedUsers, authLogs } from '../src/db/schema.ts';
import fs from 'fs';
import path from 'path';

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  // Replace double quotes with escaped double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

function convertRowsToCsv(rows: Record<string, any>[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
  
  const dataRows = rows.map(row => {
    return headers.map(h => escapeCsvField(row[h])).join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

async function exportAllToCsv() {
  const outputDir = path.join(process.cwd(), 'public', 'exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Fetching database tables...');

  // 1. Fetch LEADS
  const leadsData = await db.select().from(leads);
  const leadsCsv = convertRowsToCsv(leadsData);
  fs.writeFileSync(path.join(outputDir, 'leads.csv'), leadsCsv, 'utf8');
  console.log(`Exported ${leadsData.length} rows to public/exports/leads.csv`);

  // 2. Fetch USERS
  const usersData = await db.select().from(users);
  const usersCsv = convertRowsToCsv(usersData);
  fs.writeFileSync(path.join(outputDir, 'users.csv'), usersCsv, 'utf8');
  console.log(`Exported ${usersData.length} rows to public/exports/users.csv`);

  // 3. Fetch AUTHORIZED_USERS
  const authUsersData = await db.select().from(authorizedUsers);
  const authUsersCsv = convertRowsToCsv(authUsersData);
  fs.writeFileSync(path.join(outputDir, 'authorized_users.csv'), authUsersCsv, 'utf8');
  console.log(`Exported ${authUsersData.length} rows to public/exports/authorized_users.csv`);

  // 4. Fetch AUTH_LOGS
  const authLogsData = await db.select().from(authLogs);
  const authLogsCsv = convertRowsToCsv(authLogsData);
  fs.writeFileSync(path.join(outputDir, 'auth_logs.csv'), authLogsCsv, 'utf8');
  console.log(`Exported ${authLogsData.length} rows to public/exports/auth_logs.csv`);

  console.log('All exports completed successfully!');
  process.exit(0);
}

exportAllToCsv().catch((err) => {
  console.error('Failed exporting database to CSV:', err);
  process.exit(1);
});
