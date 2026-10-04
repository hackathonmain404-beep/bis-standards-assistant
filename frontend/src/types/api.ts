import { Citation } from './evidence';
import { StructuredAIResponse, UserMode } from './assistant';

export interface ChatApiRequest {
  session_id: string | null;
  message: string;
  language?: string;
  mode?: UserMode;
}

export interface ChatApiResponse {
  session_id: string;
  message_id: string;
  response: {
    text: string;
    intent: string;
    citations?: Citation[];
    needs_clarification?: boolean;
    clarification_questions?: string[];
    follow_up_suggestions?: string[];
    // Extended structured Copilot data
    structured_copilot?: StructuredAIResponse;
  };
  metadata?: {
    processing_time_ms: number;
    created_at: string;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  components: {
    database: string;
    ai_service: string;
    vector_store: string;
  };
}
