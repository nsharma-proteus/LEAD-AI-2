export interface ResumeTrace {
  personName: string;
  erpMentioned: string;
  applicableToThisTenure: string; // 'Confirmed' | 'Previous Role Only' | 'No Dates' | 'Unclear'
  explanation: string;
  sourceSearchQueryUrl: string;
}

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
  resumeTraces: ResumeTrace[];
  vendorMentions: string[];
  actionableSalesPitch: string;
  sources?: Array<{ title: string; url: string }>;
  isSaved?: boolean;
  auditedDate?: string;
  auditorComments?: string;
  savedByUserEmail?: string;
  searchedInPast?: boolean;
}

export interface TrainingExample {
  id: string;
  company: string;
  erpFound: string;
  evidence: string;
  source: string;
}

export interface CustomDirective {
  id: string;
  text: string;
  active: boolean;
}
