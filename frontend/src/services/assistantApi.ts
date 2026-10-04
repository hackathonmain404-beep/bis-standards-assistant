import { ChatApiRequest, ChatApiResponse } from '../types/api';
import { StructuredAIResponse } from '../types/assistant';
import {
  MOCK_CASE_1_RECOMMENDATION,
  MOCK_CASE_2_MISSING_INFO,
  MOCK_CASE_3_MULTIPLE_STANDARDS,
  MOCK_CASE_4_INSUFFICIENT_EVIDENCE,
} from '../mocks/mockAssistantData';
import { apiConfig, isMockMode } from './apiConfig';

export const assistantApi = {
  /**
   * Send user message to assistant (either mock adapter or live /api/v1/chat)
   */
  async sendMessage(request: ChatApiRequest): Promise<ChatApiResponse> {
    if (isMockMode()) {
      // Simulate realistic network delay (500ms - 800ms)
      await new Promise((res) => setTimeout(res, 600));

      const queryLower = request.message.toLowerCase();

      // Case 5: Explicit test command or error simulation
      if (queryLower.includes('simulate error') || queryLower.includes('test error')) {
        throw new Error('AI_SERVICE_UNAVAILABLE: The BIS AI retrieval service is temporarily unavailable.');
      }

      // Case 2: Missing Information flow
      if (queryLower.includes('heater') || queryLower.includes('water heater') || queryLower.includes('geyser')) {
        return {
          session_id: request.session_id || 'mock-session-heater-002',
          message_id: 'msg-' + Date.now(),
          response: {
            text: MOCK_CASE_2_MISSING_INFO.answer,
            intent: MOCK_CASE_2_MISSING_INFO.intent,
            needs_clarification: true,
            clarification_questions: MOCK_CASE_2_MISSING_INFO.clarification_questions,
            follow_up_suggestions: MOCK_CASE_2_MISSING_INFO.follow_up_suggestions,
            structured_copilot: MOCK_CASE_2_MISSING_INFO,
          },
          metadata: {
            processing_time_ms: 640,
            created_at: new Date().toISOString(),
          },
        };
      }

      // Case 3: Multiple Possible Standards
      if (queryLower.includes('iron') || queryLower.includes('electric iron') || queryLower.includes('steam iron')) {
        return {
          session_id: request.session_id || 'mock-session-iron-003',
          message_id: 'msg-' + Date.now(),
          response: {
            text: MOCK_CASE_3_MULTIPLE_STANDARDS.answer,
            intent: MOCK_CASE_3_MULTIPLE_STANDARDS.intent,
            citations: MOCK_CASE_3_MULTIPLE_STANDARDS.citations,
            follow_up_suggestions: MOCK_CASE_3_MULTIPLE_STANDARDS.follow_up_suggestions,
            structured_copilot: MOCK_CASE_3_MULTIPLE_STANDARDS,
          },
          metadata: {
            processing_time_ms: 710,
            created_at: new Date().toISOString(),
          },
        };
      }

      // Case 4: Insufficient Evidence / Out of Scope
      if (
        queryLower.includes('quantum') ||
        queryLower.includes('cryogenic') ||
        queryLower.includes('unknown product')
      ) {
        return {
          session_id: request.session_id || 'mock-session-unknown-004',
          message_id: 'msg-' + Date.now(),
          response: {
            text: MOCK_CASE_4_INSUFFICIENT_EVIDENCE.answer,
            intent: MOCK_CASE_4_INSUFFICIENT_EVIDENCE.intent,
            follow_up_suggestions: MOCK_CASE_4_INSUFFICIENT_EVIDENCE.follow_up_suggestions,
            structured_copilot: MOCK_CASE_4_INSUFFICIENT_EVIDENCE,
          },
          metadata: {
            processing_time_ms: 450,
            created_at: new Date().toISOString(),
          },
        };
      }

      // Case 1: Default standard recommendation (e.g. water bottles or general query)
      const dynamicResp: StructuredAIResponse = {
        ...MOCK_CASE_1_RECOMMENDATION,
        query: request.message,
      };

      return {
        session_id: request.session_id || 'mock-session-default-001',
        message_id: 'msg-' + Date.now(),
        response: {
          text: dynamicResp.answer,
          intent: dynamicResp.intent,
          citations: dynamicResp.citations,
          follow_up_suggestions: dynamicResp.follow_up_suggestions,
          structured_copilot: dynamicResp,
        },
        metadata: {
          processing_time_ms: 820,
          created_at: new Date().toISOString(),
        },
      };
    }

    // LIVE API MODE: Call Backend API Gateway
    const isValidUuid = (id?: string | null): boolean => {
      if (!id || typeof id !== 'string') return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
    };

    const response = await fetch(`${apiConfig.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: isValidUuid(request.session_id) ? request.session_id?.trim() : undefined,
        message: request.message,
        language: request.language || 'en',
      }),
    });

    if (!response.ok) {
      let errMsg = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error?.message) {
          errMsg = errorData.error.message;
        }
      } catch {
        // fallback to status text
      }
      throw new Error(errMsg);
    }

    return await response.json();
  },
};
