/**
 * Shared Type Definitions — BIS Intelligent Assistant Backend
 * Defines API Contracts, AI Service Contracts, and Database Model Interfaces
 * References: docs/api/API_CONTRACT.md, docs/ai/AI_PIPELINE.md, docs/architecture/DATABASE_SCHEMA.md
 */

// ==========================================
// 1. API Contract Types (Frontend <-> Backend)
// ==========================================

export interface ChatRequest {
  session_id?: string | null;
  message: string;
  language?: string;
  client_request_id?: string | null;
}

export interface CitationItem {
  index: number;
  standard_id?: string | null;
  document_title?: string | null;
  section?: string | null;
  clause?: string | null;
  snippet?: string | null;
  source_document_id?: string | null;
}

export interface AssistantResponsePayload {
  text: string;
  intent: string;
  citations: CitationItem[];
  needs_clarification: boolean;
  clarification_questions: string[];
  follow_up_suggestions: string[];
}

export interface ChatResponse {
  session_id: string;
  message_id: string;
  response: AssistantResponsePayload;
  metadata: {
    processing_time_ms: number;
    created_at: string;
  };
}

export interface SessionSummary {
  id: string;
  title: string | null;
  language: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SessionListResponse {
  sessions: SessionSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChatMessageDetail {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string | null;
  citations?: CitationItem[];
  created_at: string;
}

export interface SessionDetailResponse {
  session: {
    id: string;
    title: string | null;
    language: string;
    created_at: string;
    updated_at: string;
  };
  messages: ChatMessageDetail[];
}

export interface DeleteSessionResponse {
  deleted: boolean;
  session_id: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  components: {
    database: 'healthy' | 'unhealthy';
    ai_service: 'healthy' | 'unhealthy';
    vector_store: 'healthy' | 'unhealthy';
  };
}

export interface ErrorResponse {
  success?: boolean;
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: Record<string, unknown>;
  };
}

// ==========================================
// 2. AI Service Types (Backend <-> AI/RAG)
// ==========================================

export interface AIServiceConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIServiceRequest {
  session_id: string;
  query: string;
  conversation_history: AIServiceConversationTurn[];
  language?: string;
  mode?: string;
  product_context?: Record<string, unknown>;
}

export interface AIServiceResponse {
  response_text: string;
  intent: string;
  citations: CitationItem[];
  needs_clarification: boolean;
  clarification_questions?: string[];
  follow_up_suggestions?: string[];
  metadata?: {
    intent?: string;
    chunks_retrieved?: number;
    chunks_used?: number;
    processing_time_ms?: number;
    [key: string]: unknown;
  };
}

// ==========================================
// 3. Database Entity Interfaces
// ==========================================

export interface UserRecord {
  id: string;
  display_name: string | null;
  email: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface SessionRecord {
  id: string;
  user_id: string | null;
  title: string | null;
  language: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent: string | null;
  language: string;
  metadata: Record<string, unknown> | null;
  client_request_id: string | null;
  created_at: string;
}

export interface CitationRecord {
  id: string;
  message_id: string;
  citation_index: number;
  standard_id: string | null;
  document_title: string | null;
  section: string | null;
  clause: string | null;
  snippet: string | null;
  source_document_id: string | null;
  created_at: string;
}

export interface AppConfigRecord {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}
