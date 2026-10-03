/**
 * Application Services — BIS Intelligent Assistant Backend
 * Follows Section 24, 62, 63, 64, 65 of Master Implementation Prompt
 * Orchestrates business logic, database persistence, and AI service calls.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from './errors.ts';
import type {
  ChatRequest,
  ChatResponse,
  SessionListResponse,
  SessionDetailResponse,
  DeleteSessionResponse,
  HealthResponse,
  CitationItem,
  ChatMessageDetail,
  AIServiceConversationTurn,
} from './types.ts';
import type { AuthenticatedUser } from './auth.ts';
import type { AIServiceClient } from './ai-client.ts';
import { Logger } from './logger.ts';

const logger = new Logger(undefined, 'services');

export class AssistantQueryService {
  private supabase: SupabaseClient;
  private aiClient: AIServiceClient;

  constructor(supabase: SupabaseClient, aiClient: AIServiceClient) {
    this.supabase = supabase;
    this.aiClient = aiClient;
  }

  async processChat(
    chatReq: ChatRequest,
    caller: AuthenticatedUser | null,
    requestId: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    let activeSessionId: string;

    // 1. Session check or creation
    if (chatReq.session_id) {
      activeSessionId = chatReq.session_id;
      const { data: session, error: sessionErr } = await this.supabase
        .from('sessions')
        .select('id, user_id, is_active')
        .eq('id', activeSessionId)
        .single();

      if (sessionErr || !session) {
        throw AppError.sessionNotFound(activeSessionId);
      }

      if (caller && session.user_id && session.user_id !== caller.id) {
        throw AppError.forbidden('You do not have access to this conversation session.');
      }
    } else {
      const title = chatReq.message.length > 50
        ? `${chatReq.message.slice(0, 47)}...`
        : chatReq.message;

      const { data: newSession, error: createErr } = await this.supabase
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
    }

    // 2. Idempotency check with client_request_id
    if (chatReq.client_request_id) {
      const { data: existingUserMsg } = await this.supabase
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

        const { data: existingAssistantMsg } = await this.supabase
          .from('messages')
          .select('id, content, intent, metadata, created_at')
          .eq('session_id', activeSessionId)
          .eq('role', 'assistant')
          .gt('created_at', existingUserMsg.created_at)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        if (existingAssistantMsg) {
          const { data: citations } = await this.supabase
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

          const meta = existingAssistantMsg.metadata as Record<string, unknown> || {};

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

    // 3. Persist incoming user message
    const { error: userMsgErr } = await this.supabase.from('messages').insert({
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

    // 4. Load recent conversation history (bounded to 10 most recent turns)
    const { data: historyRows } = await this.supabase
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

    // 5. Invoke AI/RAG Service
    const aiResponse = await this.aiClient.queryAssistant(
      {
        session_id: activeSessionId,
        query: chatReq.message,
        conversation_history: history,
        language: chatReq.language || 'en',
      },
      requestId
    );

    // 6. Persist assistant message
    const { data: assistantMsg, error: assistantErr } = await this.supabase
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

    // 7. Persist citations if present
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

      const { error: citeErr } = await this.supabase.from('citations').insert(citationRows);
      if (citeErr) {
        logger.warn('Failed to insert citations; continuing response', {
          request_id: requestId,
          details: { error: citeErr.message },
        });
      }
    }

    // 8. Update session timestamp
    await this.supabase
      .from('sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeSessionId);

    // 9. Format response per API_CONTRACT.md
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

export class ConversationService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async listSessions(
    caller: AuthenticatedUser | null,
    limit: number,
    offset: number
  ): Promise<SessionListResponse> {
    let query = this.supabase
      .from('sessions')
      .select('id, title, language, created_at, updated_at', { count: 'exact' })
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (caller) {
      query = query.eq('user_id', caller.id);
    }

    const { data: rows, count, error } = await query;
    if (error) {
      logger.error('Failed to list sessions', { details: { error: error.message } });
      throw AppError.internal('Failed to retrieve conversation sessions.');
    }

    const sessions = (rows || []).map(r => ({
      id: r.id,
      title: r.title,
      language: r.language,
      created_at: r.created_at,
      updated_at: r.updated_at,
      message_count: 0,
    }));

    return {
      sessions,
      total: count || sessions.length,
      limit,
      offset,
    };
  }

  async getSessionHistory(
    sessionId: string,
    caller: AuthenticatedUser | null
  ): Promise<SessionDetailResponse> {
    const { data: session, error: sessionErr } = await this.supabase
      .from('sessions')
      .select('id, user_id, title, language, created_at, updated_at')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      throw AppError.sessionNotFound(sessionId);
    }

    if (caller && session.user_id && session.user_id !== caller.id) {
      throw AppError.forbidden('You do not have permission to view this conversation session.');
    }

    const { data: msgRows, error: msgErr } = await this.supabase
      .from('messages')
      .select('id, role, content, intent, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (msgErr) {
      logger.error('Failed to fetch session messages', { details: { error: msgErr.message } });
      throw AppError.internal('Failed to retrieve conversation messages.');
    }

    const messageIds = (msgRows || []).map(m => m.id);

    const { data: citationRows } = await this.supabase
      .from('citations')
      .select('message_id, citation_index, standard_id, document_title, section, clause, snippet, source_document_id')
      .in('message_id', messageIds.length > 0 ? messageIds : ['00000000-0000-0000-0000-000000000000'])
      .order('citation_index', { ascending: true });

    const citationsByMsgId = new Map<string, CitationItem[]>();
    for (const c of citationRows || []) {
      const list = citationsByMsgId.get(c.message_id) || [];
      list.push({
        index: c.citation_index,
        standard_id: c.standard_id,
        document_title: c.document_title,
        section: c.section,
        clause: c.clause,
        snippet: c.snippet,
        source_document_id: c.source_document_id,
      });
      citationsByMsgId.set(c.message_id, list);
    }

    const messages: ChatMessageDetail[] = (msgRows || []).map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
      intent: m.intent,
      citations: citationsByMsgId.get(m.id),
      created_at: m.created_at,
    }));

    return {
      session: {
        id: session.id,
        title: session.title,
        language: session.language,
        created_at: session.created_at,
        updated_at: session.updated_at,
      },
      messages,
    };
  }

  async deleteSession(
    sessionId: string,
    caller: AuthenticatedUser | null
  ): Promise<DeleteSessionResponse> {
    const { data: session, error: sessionErr } = await this.supabase
      .from('sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      throw AppError.sessionNotFound(sessionId);
    }

    if (caller && session.user_id && session.user_id !== caller.id) {
      throw AppError.forbidden('You do not have permission to delete this conversation session.');
    }

    const { error: deleteErr } = await this.supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (deleteErr) {
      logger.error('Failed to delete session', { details: { error: deleteErr.message } });
      throw AppError.internal('Failed to delete conversation session.');
    }

    return {
      deleted: true,
      session_id: sessionId,
    };
  }
}

export class HealthService {
  private supabase: SupabaseClient;
  private aiClient: AIServiceClient;

  constructor(supabase: SupabaseClient, aiClient: AIServiceClient) {
    this.supabase = supabase;
    this.aiClient = aiClient;
  }

  async check(): Promise<HealthResponse> {
    let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
    let aiStatus: 'healthy' | 'unhealthy' = 'healthy';

    try {
      const { error } = await this.supabase.from('app_config').select('key').limit(1);
      if (error) dbStatus = 'unhealthy';
    } catch {
      dbStatus = 'unhealthy';
    }

    try {
      const aiHealthy = await this.aiClient.healthCheck();
      if (!aiHealthy) aiStatus = 'unhealthy';
    } catch {
      aiStatus = 'unhealthy';
    }

    const overallStatus = dbStatus === 'healthy' && aiStatus === 'healthy'
      ? 'healthy'
      : dbStatus === 'healthy' || aiStatus === 'healthy'
      ? 'degraded'
      : 'unhealthy';

    return {
      status: overallStatus,
      version: '0.1.0',
      components: {
        database: dbStatus,
        ai_service: aiStatus,
        vector_store: 'healthy',
      },
    };
  }
}
