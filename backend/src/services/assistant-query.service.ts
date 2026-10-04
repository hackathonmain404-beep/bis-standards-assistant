/**
 * Assistant Query Service — BIS Intelligent Assistant Backend
 * Handles conversation turn validation, race-safe idempotency, AI orchestration, and persistence.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../errors.ts';
import type {
  ChatRequest,
  ChatResponse,
  CitationItem,
  AIServiceConversationTurn,
} from '../types.ts';
import type { AuthenticatedUser } from '../auth.ts';
import type { AIServiceClient } from '../ai-client.ts';
import { Logger } from '../logger.ts';

const logger = new Logger(undefined, 'assistant-query-service');

export class AssistantQueryService {
  private db: SupabaseClient;
  private aiClient: AIServiceClient;

  // In-flight concurrency lock to prevent simultaneous duplicate AI calls
  private static inFlightRequests = new Map<string, Promise<ChatResponse>>();

  constructor(
    supabase: SupabaseClient,
    aiClient: AIServiceClient,
    serverSupabase?: SupabaseClient
  ) {
    this.db = serverSupabase || supabase;
    this.aiClient = aiClient;
  }

  async processChat(
    chatReq: ChatRequest,
    caller: AuthenticatedUser | null,
    requestId: string
  ): Promise<ChatResponse> {
    const idempotencyKey = chatReq.client_request_id
      ? `${chatReq.session_id || 'new'}:${chatReq.client_request_id}`
      : null;

    // Race-safe concurrent duplicate check
    if (idempotencyKey && AssistantQueryService.inFlightRequests.has(idempotencyKey)) {
      logger.info('Concurrent duplicate request detected; attaching to in-flight promise', {
        request_id: requestId,
        details: { client_request_id: chatReq.client_request_id },
      });
      return AssistantQueryService.inFlightRequests.get(idempotencyKey)!;
    }

    const executionPromise = this.executeChat(chatReq, caller, requestId);

    if (idempotencyKey) {
      AssistantQueryService.inFlightRequests.set(idempotencyKey, executionPromise);
      executionPromise.finally(() => {
        AssistantQueryService.inFlightRequests.delete(idempotencyKey);
      });
    }

    return executionPromise;
  }

  private async executeChat(
    chatReq: ChatRequest,
    caller: AuthenticatedUser | null,
    requestId: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    let activeSessionId: string;

    // 1. Session check or creation
    if (chatReq.session_id) {
      activeSessionId = chatReq.session_id;
      const { data: session, error: sessionErr } = await this.db
        .from('sessions')
        .select('id, user_id, is_active')
        .eq('id', activeSessionId)
        .single();

      if (sessionErr || !session) {
        throw AppError.sessionNotFound(activeSessionId);
      }

      if (session.user_id && (!caller || session.user_id !== caller.id)) {
        throw AppError.forbidden('You do not have access to this conversation session.');
      }
    } else {
      const title = chatReq.message.length > 50
        ? `${chatReq.message.slice(0, 47)}...`
        : chatReq.message;

      const { data: newSession, error: createErr } = await this.db
        .from('sessions')
        .insert({
          user_id: caller?.id || null,
          title,
          language: chatReq.language || 'en',
          is_active: true,
        })
        .select('id')
        .single();

      if (createErr || !newSession) {
        logger.error('Failed to create new session', {
          request_id: requestId,
          details: { error: createErr?.message },
        });
        throw AppError.internal('Failed to initialize conversation session.');
      }

      activeSessionId = newSession.id;

      try {
        await this.db.from('audit_logs').insert({
          event_type: 'CONVERSATION_CREATED',
          user_id: caller?.id || null,
          resource_type: 'sessions',
          resource_id: activeSessionId,
          payload: { title },
        });
      } catch {
        // Non-blocking audit log
      }
    }

    // 2. Request tracking state initialization
    let trackingId: string | null = null;
    try {
      const { data: tracker } = await this.db
        .from('assistant_requests')
        .insert({
          client_request_id: chatReq.client_request_id || null,
          user_id: caller?.id || null,
          session_id: activeSessionId,
          status: 'AUTHORIZED',
          started_at: new Date(startTime).toISOString(),
        })
        .select('id')
        .single();
      if (tracker) trackingId = tracker.id;
    } catch {
      // Non-blocking request tracking
    }

    // 3. Database-backed Idempotency check with client_request_id
    if (chatReq.client_request_id) {
      const { data: existingUserMsg } = await this.db
        .from('messages')
        .select('id, created_at')
        .eq('session_id', activeSessionId)
        .eq('client_request_id', chatReq.client_request_id)
        .single();

      if (existingUserMsg) {
        logger.info('Duplicate request detected; returning cached response', {
          request_id: requestId,
          details: { client_request_id: chatReq.client_request_id },
        });

        const { data: existingAssistantMsg } = await this.db
          .from('messages')
          .select('id, content, intent, metadata, created_at')
          .eq('session_id', activeSessionId)
          .eq('role', 'assistant')
          .gt('created_at', existingUserMsg.created_at)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (existingAssistantMsg) {
          const { data: citations } = await this.db
            .from('citations')
            .select('citation_index, standard_id, document_title, section, clause, snippet, source_document_id')
            .eq('message_id', existingAssistantMsg.id)
            .order('citation_index', { ascending: true });

          const citationItems: CitationItem[] = (citations || []).map(c => ({
            index: c.citation_index,
            standard_id: c.standard_id,
            document_title: c.document_title,
            section: c.section,
            clause: c.clause,
            snippet: c.snippet,
            source_document_id: c.source_document_id,
          }));

          const meta = (existingAssistantMsg.metadata as Record<string, unknown>) || {};

          return {
            session_id: activeSessionId,
            message_id: existingAssistantMsg.id,
            response: {
              text: existingAssistantMsg.content,
              intent: existingAssistantMsg.intent || 'GENERAL_BIS',
              citations: citationItems,
              needs_clarification: Boolean(meta.needs_clarification),
              clarification_questions: (meta.clarification_questions as string[]) || [],
              follow_up_suggestions: (meta.follow_up_suggestions as string[]) || [],
            },
            metadata: {
              processing_time_ms: Date.now() - startTime,
              created_at: existingAssistantMsg.created_at,
            },
          };
        }
      }
    }

    // 4. Persist incoming user message
    const { error: userMsgErr } = await this.db.from('messages').insert({
      session_id: activeSessionId,
      role: 'user',
      content: chatReq.message,
      language: chatReq.language || 'en',
      client_request_id: chatReq.client_request_id || null,
    });

    if (userMsgErr) {
      logger.error('Failed to persist user message', {
        request_id: requestId,
        details: { error: userMsgErr.message },
      });
      throw AppError.internal('Failed to persist user message.');
    }

    // 5. Load recent conversation history (bounded to 10 most recent turns)
    const { data: historyRows } = await this.db
      .from('messages')
      .select('role, content')
      .eq('session_id', activeSessionId)
      .order('created_at', { ascending: false })
      .limit(10);

    const history: AIServiceConversationTurn[] = (historyRows || [])
      .reverse()
      .map(r => ({
        role: r.role as 'user' | 'assistant' | 'system',
        content: r.content,
      }));

    // 6. Invoke AI/RAG Service (State: AI_PENDING)
    if (trackingId) {
      try {
        await this.db
          .from('assistant_requests')
          .update({ status: 'AI_PENDING' })
          .eq('id', trackingId);
      } catch {
        // Non-blocking
      }
    }

    const aiResponse = await this.aiClient.queryAssistant(
      {
        session_id: activeSessionId,
        query: chatReq.message,
        conversation_history: history,
        language: chatReq.language || 'en',
      },
      requestId
    );

    if (trackingId) {
      try {
        await this.db
          .from('assistant_requests')
          .update({
            status: 'AI_COMPLETED',
            evidence_status:
              aiResponse.citations && aiResponse.citations.length > 0
                ? 'HAS_CITATIONS'
                : 'NO_CITATIONS',
          })
          .eq('id', trackingId);
      } catch {
        // Non-blocking
      }
    }

    // 7. Persist assistant message
    const { data: assistantMsg, error: assistantErr } = await this.db
      .from('messages')
      .insert({
        session_id: activeSessionId,
        role: 'assistant',
        content: aiResponse.response_text,
        intent: aiResponse.intent,
        language: chatReq.language || 'en',
        metadata: {
          needs_clarification: aiResponse.needs_clarification,
          clarification_questions: aiResponse.clarification_questions || [],
          follow_up_suggestions: aiResponse.follow_up_suggestions || [],
          ai_metadata: aiResponse.metadata || {},
        },
      })
      .select('id, created_at')
      .single();

    if (assistantErr || !assistantMsg) {
      logger.error('Failed to persist assistant message', {
        request_id: requestId,
        details: { error: assistantErr?.message },
      });
      throw AppError.internal('Failed to persist assistant response.');
    }

    // 8. Persist citations if present
    if (aiResponse.citations && aiResponse.citations.length > 0) {
      const citationRows = aiResponse.citations.map((c, i) => ({
        message_id: assistantMsg.id,
        citation_index: c.index || i + 1,
        standard_id: c.standard_id || null,
        document_title: c.document_title || null,
        section: c.section || null,
        clause: c.clause || null,
        snippet: c.snippet || null,
        source_document_id: c.source_document_id || null,
      }));

      const { error: citeErr } = await this.db.from('citations').insert(citationRows);
      if (citeErr) {
        logger.warn('Failed to insert citations; continuing response', {
          request_id: requestId,
          details: { error: citeErr.message },
        });
      }
    }

    // 9. Update session timestamp
    await this.db
      .from('sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeSessionId);

    // 10. Update tracking and record audit log
    if (trackingId) {
      try {
        await this.db
          .from('assistant_requests')
          .update({
            status: 'COMPLETED',
            completed_at: new Date().toISOString(),
            latency_ms: Date.now() - startTime,
          })
          .eq('id', trackingId);
      } catch {
        // Non-blocking
      }
    }

    try {
      await this.db.from('audit_logs').insert({
        event_type: 'ASSISTANT_COMPLETED',
        user_id: caller?.id || null,
        resource_type: 'messages',
        resource_id: assistantMsg.id,
        payload: {
          session_id: activeSessionId,
          latency_ms: Date.now() - startTime,
          intent: aiResponse.intent,
        },
      });
    } catch {
      // Non-blocking
    }

    // 11. Format response per API_CONTRACT.md
    return {
      session_id: activeSessionId,
      message_id: assistantMsg.id,
      response: {
        text: aiResponse.response_text,
        intent: aiResponse.intent,
        citations: aiResponse.citations,
        needs_clarification: aiResponse.needs_clarification,
        clarification_questions: aiResponse.clarification_questions || [],
        follow_up_suggestions: aiResponse.follow_up_suggestions || [],
      },
      metadata: {
        processing_time_ms: Date.now() - startTime,
        created_at: assistantMsg.created_at,
      },
    };
  }
}
