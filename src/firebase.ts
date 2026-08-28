import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User, 
  Auth 
} from 'firebase/auth';
// Firebase configuration for Proteus Lead Platform
const firebaseConfig = {
  apiKey: ((import.meta as any).env?.VITE_FIREBASE_API_KEY) || "AIzaSyAMs4XZAQqd7Twx_K-otvSvAzaI77NH_Js",
  projectId: ((import.meta as any).env?.VITE_FIREBASE_PROJECT_ID) || "proteuslead",
  authDomain: ((import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN) || "proteuslead.firebaseapp.com",
  storageBucket: ((import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET) || "proteuslead.appspot.com",
  appId: ((import.meta as any).env?.VITE_FIREBASE_APP_ID) || "1:451986737678:web:5949d4f76369eae8384a5f"
};

// Safely initialize Firebase App and Auth with error handling
let app: any;
let authInstance: any = null;

try {
  app = initializeApp(firebaseConfig);
  authInstance = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization notice:", e);
}

export const auth = authInstance;

const provider = new GoogleAuthProvider();
// Request explicit scopes for Google Sheets and Google Drive (creating new report files)
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Auth observer setup
export const initAuth = (
  onAuthSuccess: (user: User, token: string | null) => void,
  onAuthFailure: () => void
) => {
  if (!auth) {
    onAuthFailure();
    return () => {};
  }
  try {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        onAuthSuccess(user, cachedAccessToken);
      } else {
        cachedAccessToken = null;
        onAuthFailure();
      }
    });
  } catch (err) {
    console.warn("Firebase Auth listener error:", err);
    onAuthFailure();
    return () => {};
  }
};

// Sign in with Email and Password
export const emailPasswordSignIn = async (email: string, password: string): Promise<User> => {
  if (!auth) {
    throw new Error('Authentication service is operating in local/corporate mode.');
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Auth / Email Sign-In failed:', error);
    throw error;
  }
};

// Sign up with Email and Password
export const emailPasswordSignUp = async (email: string, password: string): Promise<User> => {
  if (!auth) {
    throw new Error('Authentication service is operating in local/corporate mode.');
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Auth / Email Registration failed:', error);
    throw error;
  }
};

// Sign in via Google popup to get the user credentials and OAuth access token
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    throw new Error('Google Sign-In is unavailable. Please sign in with email and password.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;

    if (!token) {
      throw new Error('Google Sign-In succeeded, but we could not obtain an access token. Please ensure your scopes are correctly authorized.');
    }

    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Firebase Auth / Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  if (auth) {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
  }
  cachedAccessToken = null;
};

// Define local interfaces for the leads mapping configuration
export interface LeadResult {
  company: string;
  erpFound: string;
  confidenceScore: number;
  status: string;
  evidence: string;
  website?: string;
  linkedinPage?: string;
  cLevelContact?: {
    name: string;
    title: string;
    phone: string;
    linkedin: string;
    email: string;
  };
  resumeTraces: Array<{
    personName: string;
    erpMentioned: string;
    applicableToThisTenure: string;
    explanation: string;
  }>;
  vendorMentions: string[];
  actionableSalesPitch: string;
  sources?: Array<{ title: string; url: string }>;
}

// Function to export leads directly to a newly created Google Sheet using OAuth Access Token
export const exportLeadsToSheet = async (
  leads: LeadResult[],
  accessToken: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  if (!leads || leads.length === 0) {
    throw new Error('No leads to export.');
  }

  const timestamp = new Date().toLocaleString('en-US', { hour12: false });
  const sheetTitle = `Proteus B2B ERP Leads Intel Report (${timestamp})`;

  // Step 1: Create a brand-new Spreadsheet in user's Drive folder
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      properties: {
        title: sheetTitle,
      },
    }),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Failed to create a new spreadsheet: ${errText}`);
  }

  const createdSheet = await createResponse.json();
  const spreadsheetId = createdSheet.spreadsheetId;
  const spreadsheetUrl = createdSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  const firstSheetName = createdSheet.sheets?.[0]?.properties?.title || 'Sheet1';

  // Step 2: Formulate data payload representation
  // Headers that user explicitly requested, emphasizing individuals, core parameters, and the generated pitch copy
  const headers = [
    'Company Name',
    'ERP Stack Found',
    'Confidence Score (%)',
    'Status',
    'Exec Contact Name',
    'Exec Contact Title',
    'Exec Contact Email',
    'Exec Contact Phone',
    'Exec Contact LinkedIn',
    'Actionable Sales Pitch Hook',
    'Research Evidence Summary',
    'Corporate Website',
    'LinkedIn Company Page',
    'Resume Traces & Tenure Checks',
    'Vendor Case-studies / Customer Lists',
    'Grounding Sources'
  ];

  const rows = [headers];

  leads.forEach((l) => {
    // Format C-level contact info
    const contactName = l.cLevelContact?.name || '';
    const contactTitle = l.cLevelContact?.title || '';
    const contactEmail = l.cLevelContact?.email || '';
    const contactPhone = l.cLevelContact?.phone || '';
    const contactLinkedIn = l.cLevelContact?.linkedin || '';

    // Format resumes traces list
    const tracesText = l.resumeTraces && l.resumeTraces.length > 0 
      ? l.resumeTraces.map((t, idx) => `[Trace #${idx + 1}] ${t.personName} claims ${t.erpMentioned} (${t.applicableToThisTenure}). Details: ${t.explanation}`).join('\n')
      : 'None Detected';

    // Format vendor mentions lists
    const vendorText = l.vendorMentions && l.vendorMentions.length > 0
      ? l.vendorMentions.map((m, idx) => `(${idx + 1}) ${m}`).join('\n')
      : 'None Found';

    // Format source urls citations lists
    const sourcesText = l.sources && l.sources.length > 0
      ? l.sources.map((s) => `${s.title}: ${s.url}`).join('\n')
      : 'No reference links';

    rows.push([
      l.company,
      l.erpFound,
      l.confidenceScore.toString(),
      l.status,
      contactName,
      contactTitle,
      contactEmail,
      contactPhone,
      contactLinkedIn,
      l.actionableSalesPitch || '',
      l.evidence || '',
      l.website || '',
      l.linkedinPage || '',
      tracesText,
      vendorText,
      sourcesText
    ]);
  });

  // Step 3: Append rows to the spreadsheet
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(firstSheetName)}!A1:append?valueInputOption=USER_ENTERED`;
  const appendResponse = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      range: `${firstSheetName}!A1`,
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  if (!appendResponse.ok) {
    const errText = await appendResponse.text();
    throw new Error(`Failed to append data records to sheet: ${errText}`);
  }

  // Step 4: Perform a BatchUpdate to adjust column look and feel, and make it look premium
  // - Make header row bold, with elegant soft deep background color and white text
  // - Freeze header row
  // - Auto-wrap text configuration to keep pitches and resumes high-contrast and tidy
  try {
    const firstSheetId = createdSheet.sheets?.[0]?.properties?.sheetId || 0;
    const formatResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requests: [
          // 1. Repeat cell formatting for Header row (bold, colored background, white text)
          {
            repeatCell: {
              range: {
                sheetId: firstSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.16, // Indigo/Classic deep charcoal theme #2d3748
                    green: 0.22,
                    blue: 0.33
                  },
                  textFormat: {
                    bold: true,
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0
                    },
                    fontSize: 10,
                    fontFamily: 'Inter'
                  },
                  alignment: {
                    horizontal: 'LEFT',
                    vertical: 'MIDDLE'
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,alignment)'
            }
          },
          // 2. Freeze the header row
          {
            updateSheetProperties: {
              properties: {
                sheetId: firstSheetId,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: 'gridProperties/frozenRowCount'
            }
          },
          // 3. Set text wrapping model on rows
          {
            repeatCell: {
              range: {
                sheetId: firstSheetId,
                startRowIndex: 1,
                endRowIndex: rows.length,
                startColumnIndex: 0,
                endColumnIndex: headers.length
              },
              cell: {
                userEnteredFormat: {
                  wrapStrategy: 'WRAP',
                  textFormat: {
                    fontSize: 9,
                    fontFamily: 'Inter'
                  },
                  alignment: {
                    vertical: 'TOP'
                  }
                }
              },
              fields: 'userEnteredFormat(wrapStrategy,textFormat,alignment)'
            }
          },
          // 4. Optimize columns sizes dynamically
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: firstSheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: headers.length
              }
            }
          }
        ]
      })
    });

    if (!formatResponse.ok) {
      console.warn('BatchUpdate styling call completed with alert, continuing:', await formatResponse.text());
    }
  } catch (styleErr) {
    console.error('Non-blocking styling error:', styleErr);
  }

  return { spreadsheetId, spreadsheetUrl };
};
