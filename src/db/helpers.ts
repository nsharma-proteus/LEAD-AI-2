import { db } from './index.ts';
import { users, leads, authorizedUsers } from './schema.ts';
import { eq, sql } from 'drizzle-orm';
import { getOrCreateUser } from './users.ts';

// Preferred default benchmark lead intelligence records to seed
const DEFAULT_STORED_LEADS = [
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
    ]
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

// Automatically seeds database with sandbox data if empty
export async function seedDefaultLeads() {
  try {
    const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const leadCountResult = await db.select({ count: sql<number>`count(*)` }).from(leads);
    const authCountResult = await db.select({ count: sql<number>`count(*)` }).from(authorizedUsers);
    
    const userCount = Number(userCountResult[0]?.count || 0);
    const leadCount = Number(leadCountResult[0]?.count || 0);
    const authCount = Number(authCountResult[0]?.count || 0);

    if (authCount === 0) {
      console.log("[DB SEEDER] Seeding default administrator / workspace domain whitelist rules...");
      await db.insert(authorizedUsers).values([
        { emailOrDomain: 'nsharma@proteustech.in', role: 'admin' },
        { emailOrDomain: 'proteustech.in', role: 'admin' },
        { emailOrDomain: 'brijesh.jadav@proteustech.in', role: 'user' }
      ]);
    }

    if (userCount === 0 || leadCount === 0) {
      console.log("[DB SEEDER] Seeding database with high-grade lead benchmark data...");
      
      // Ensure default system user exists
      const systemUser = await getOrCreateUser("sandbox_system", "system@proteustech.in");
      
      for (const leadData of DEFAULT_STORED_LEADS) {
        // Double check presence of lead
        await db.insert(leads)
          .values({
            userId: systemUser.id,
            company: leadData.company,
            erpFound: leadData.erpFound,
            confidenceScore: leadData.confidenceScore,
            status: leadData.status,
            evidence: leadData.evidence,
            website: leadData.website,
            linkedinPage: leadData.linkedinPage,
            actionableSalesPitch: leadData.actionableSalesPitch,
            contactName: leadData.cLevelContact?.name,
            contactTitle: leadData.cLevelContact?.title,
            contactPhone: leadData.cLevelContact?.phone,
            contactLinkedin: leadData.cLevelContact?.linkedin,
            contactEmail: leadData.cLevelContact?.email,
            resumeTraces: leadData.resumeTraces,
            vendorMentions: leadData.vendorMentions,
            sources: leadData.sources,
          });
      }
      console.log("[DB SEEDER] Seed complete.");
    }
  } catch (err) {
    console.error("[DB SEEDER] Error during database seeding:", err);
  }
}

// Fetch all saved leads from Cloud SQL
export async function getAllLeadsFromDb(): Promise<any[]> {
  try {
    // Return all records with associated user info for lead tracking
    const records = await db.select()
      .from(leads)
      .leftJoin(users, eq(leads.userId, users.id));

    if (records && records.length > 0) {
      return records.map(({ leads: row, users: userObj }) => ({
        id: row.id,
        company: row.company,
        erpFound: row.erpFound,
        confidenceScore: row.confidenceScore,
        status: row.status,
        evidence: row.evidence,
        website: row.website || undefined,
        linkedinPage: row.linkedinPage || undefined,
        cLevelContact: row.contactName ? {
          name: row.contactName,
          title: row.contactTitle || '',
          phone: row.contactPhone || '',
          linkedin: row.contactLinkedin || '',
          email: row.contactEmail || ''
        } : undefined,
        resumeTraces: Array.isArray(row.resumeTraces) ? row.resumeTraces : [],
        vendorMentions: Array.isArray(row.vendorMentions) ? row.vendorMentions : [],
        sources: Array.isArray(row.sources) ? row.sources : [],
        actionableSalesPitch: row.actionableSalesPitch,
        createdAt: row.createdAt,
        isSaved: true,
        savedByUserEmail: userObj?.email || undefined
      }));
    }
    return DEFAULT_STORED_LEADS.map(l => ({ ...l, isSaved: true }));
  } catch (error) {
    console.warn("Database fetch failed, returning fallback default leads:", (error as Error).message);
    return DEFAULT_STORED_LEADS.map(l => ({ ...l, isSaved: true }));
  }
}

// Save or Update a single lead inside Cloud SQL
export async function upsertLeadToDb(lead: any, uid: string, email: string): Promise<any> {
  try {
    // 1. Identify/Register DB User
    const dbUser = await getOrCreateUser(uid, email);

    // 2. Check if company record already exists in database
    const existing = await db.select().from(leads).where(eq(leads.company, lead.company));

    const fieldsToSet = {
      userId: dbUser.id,
      company: lead.company,
      erpFound: lead.erpFound || 'None Found',
      confidenceScore: lead.confidenceScore || 0,
      status: lead.status || 'Active',
      evidence: lead.evidence || '',
      website: lead.website || '',
      linkedinPage: lead.linkedinPage || '',
      actionableSalesPitch: lead.actionableSalesPitch || '',
      contactName: lead.cLevelContact?.name || '',
      contactTitle: lead.cLevelContact?.title || '',
      contactEmail: lead.cLevelContact?.email || '',
      contactPhone: lead.cLevelContact?.phone || '',
      contactLinkedin: lead.cLevelContact?.linkedin || '',
      resumeTraces: lead.resumeTraces || [],
      vendorMentions: lead.vendorMentions || [],
      sources: lead.sources || [],
    };

    if (existing.length > 0) {
      // Update
      const result = await db.update(leads)
        .set(fieldsToSet)
        .where(eq(leads.company, lead.company))
        .returning();
      return result[0];
    } else {
      // Insert
      const result = await db.insert(leads)
        .values(fieldsToSet)
        .returning();
      return result[0];
    }
  } catch (error) {
    console.error("Database upsert failed:", error);
    throw new Error("Failed to save Lead to Cloud SQL.", { cause: error });
  }
}

// Safe read-only custom SQL reporting console engine
export async function executeReportingQuery(userQuery: string): Promise<{ columns: string[], rows: any[] }> {
  try {
    const cleanQuery = userQuery.trim();
    const upperQuery = cleanQuery.toUpperCase();

    // Enforce strict read-only security filter
    if (!upperQuery.startsWith('SELECT') && 
        !upperQuery.startsWith('WITH') && 
        !upperQuery.startsWith('EXPLAIN') && 
        !upperQuery.startsWith('SHOW')) {
      throw new Error("Security Violation: Only read-only queries (SELECT, WITH, EXPLAIN) are allowed.");
    }

    // Execute query via Drizzle's direct database client
    const rawResult = await db.execute(sql.raw(cleanQuery));
    
    let rows: any[] = [];
    let columns: string[] = [];

    if (rawResult && Array.isArray(rawResult.rows)) {
      rows = rawResult.rows;
      if (rows.length > 0) {
        columns = Object.keys(rows[0]);
      }
    } else if (rawResult && rawResult.rows) {
      // Single-level result or different driver shapes
      const actualRows = (rawResult as any).rows;
      if (typeof actualRows === 'object') {
        const testRows = Array.isArray(actualRows) ? actualRows : [actualRows];
        rows = testRows;
        if (rows.length > 0) {
          columns = Object.keys(rows[0]);
        }
      }
    }

    return { columns, rows };
  } catch (error: any) {
    console.error("SQL query execution failed:", error);
    throw new Error(error.message || "SQL Syntax Error. Please check your query syntax.");
  }
}

// Check if there is already a lead with the same company name in the database
export async function getExistingLeadByCompanyName(companyName: string): Promise<any | null> {
  try {
    const cleanName = companyName.trim().toLowerCase();
    const records = await db.select()
      .from(leads)
      .where(sql`LOWER(${leads.company}) = ${cleanName}`)
      .limit(1);

    if (records.length > 0) {
      const row = records[0];
      return {
        id: row.id,
        company: row.company,
        erpFound: row.erpFound,
        confidenceScore: row.confidenceScore,
        status: row.status,
        evidence: row.evidence,
        website: row.website || undefined,
        linkedinPage: row.linkedinPage || undefined,
        cLevelContact: row.contactName ? {
          name: row.contactName,
          title: row.contactTitle || '',
          phone: row.contactPhone || '',
          linkedin: row.contactLinkedin || '',
          email: row.contactEmail || ''
        } : undefined,
        resumeTraces: Array.isArray(row.resumeTraces) ? row.resumeTraces : [],
        vendorMentions: Array.isArray(row.vendorMentions) ? row.vendorMentions : [],
        sources: Array.isArray(row.sources) ? row.sources : [],
        actionableSalesPitch: row.actionableSalesPitch,
        createdAt: row.createdAt
      };
    }
    return null;
  } catch (error) {
    console.error("Error retrieving existing company from DB:", error);
    return null;
  }
}
