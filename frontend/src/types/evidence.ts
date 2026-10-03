export type EvidenceStatus = 'strong' | 'needs_verification' | 'insufficient_evidence';

export type SourceType = 'IS' | 'QCO' | 'SCHEME' | 'LAB' | 'NOTIFICATION' | 'GENERAL';

export interface Citation {
  index: number;
  standard_id: string;
  document_title: string;
  section: string;
  clause: string;
  snippet: string;
  url?: string;
  source_type?: SourceType;
}

export interface SourceReference {
  document_title: string;
  standard_number: string;
  section?: string;
  clause?: string;
  snippet: string;
  url?: string;
  source_type?: SourceType;
  relevance_score?: number;
}
