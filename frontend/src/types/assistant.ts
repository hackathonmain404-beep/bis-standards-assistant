import { Citation, EvidenceStatus, SourceReference } from './evidence';
import { StandardRecommendation } from './standards';
import { CertificationInfo, TestingRequirement } from './compliance';
import { LaboratoryInfo } from './laboratory';

export type UserMode = 'industry' | 'consumer';
export type LanguageCode = 'en' | 'hi' | 'or';

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface ProductUnderstanding {
  name: string;
  category?: string;
  intended_use?: string;
  attributes: ProductAttribute[];
}

export interface MissingInformationField {
  field: string;
  label: string;
  input_type: 'text' | 'select' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[];
  help_text?: string;
}

export interface StructuredAIResponse {
  query: string;
  answer: string;
  intent: string;
  product?: ProductUnderstanding;
  standards?: StandardRecommendation[];
  certification?: CertificationInfo;
  testing?: TestingRequirement[];
  laboratories?: LaboratoryInfo[];
  sources?: SourceReference[];
  citations?: Citation[];
  missing_information?: MissingInformationField[];
  evidence_status: EvidenceStatus;
  needs_clarification?: boolean;
  clarification_questions?: string[];
  follow_up_suggestions?: string[];
  metadata?: {
    processing_time_ms?: number;
    created_at?: string;
    model_version?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  structuredData?: StructuredAIResponse;
  isError?: boolean;
  errorMessage?: string;
  intent?: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}
