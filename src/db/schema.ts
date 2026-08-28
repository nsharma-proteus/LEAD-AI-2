import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Define the 'users' table with persistent password credentials and profile data
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal unique identifier
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  salt: text('salt'),
  name: text('name'),
  role: text('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'authorized_users' table for user master (admin authorization whitelist)
export const authorizedUsers = pgTable('authorized_users', {
  id: serial('id').primaryKey(),
  emailOrDomain: text('email_or_domain').notNull().unique(), // e.g., 'nsharma@proteustech.in' or 'proteustech.in'
  role: text('role').notNull().default('user'), // 'admin' | 'user'
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'leads' table for persistent saved company intel
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  company: text('company').notNull(),
  erpFound: text('erp_found').notNull(),
  confidenceScore: integer('confidence_score').notNull(),
  status: text('status').notNull(),
  evidence: text('evidence').notNull(),
  website: text('website'),
  linkedinPage: text('linkedin_page'),
  actionableSalesPitch: text('actionable_sales_pitch').notNull(),
  
  // Executive contact info broken out to facilitate easy SQL queries
  contactName: text('contact_name'),
  contactTitle: text('contact_title'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  contactLinkedin: text('contact_linkedin'),

  // Structured list representations
  resumeTraces: jsonb('resume_traces'), // keeps array of traces
  vendorMentions: jsonb('vendor_mentions'), // keeps array of vendor info
  sources: jsonb('sources'), // list of citations
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'auth_logs' table for authentication audit trail
export const authLogs = pgTable('auth_logs', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  action: text('action').notNull(), // 'CHECK_WHITELIST' | 'LOGIN' | 'REGISTER' | 'VERIFY_SESSION'
  status: text('status').notNull(), // 'SUCCESS' | 'DENIED' | 'FAILED'
  reason: text('reason').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations for 'users'
export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
}));

// Define relations for 'leads'
export const leadsRelations = relations(leads, ({ one }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
}));
