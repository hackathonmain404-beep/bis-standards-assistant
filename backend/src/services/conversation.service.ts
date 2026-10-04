/**
 * Conversation Service — BIS Intelligent Assistant Backend
 * Handles session listing, conversation detail with citations, and safe deletion with RLS.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../errors.ts';
import type {
  SessionListResponse,
  SessionDetailResponse,
  DeleteSessionResponse,
  CitationItem,
  ChatMessageDetail,
} from '../types.ts';
import type { AuthenticatedUser } from '../auth.ts';
import { Logger } from '../logger.ts';

const logger = new Logger(undefined, 'conversation-service');

export class ConversationService {
  private db: SupabaseClient;

  constructor(supabase: SupabaseClient, serverSupabase?: SupabaseClient) {
    this.db = serverSupabase || supabase;
  }

  async listSessions(
    caller: AuthenticatedUser | null,
    limit: number,
    offset: number
  ): Promise<SessionListResponse> {
    let query = this.db
      .from('sessions')
      .select('id, title, language, created_at, updated_at', { count: 'exact' })
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (caller) {
      query = query.eq('user_id', caller.id);
    } else {
      query = query.is('user_id', null);
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
    const { data: session, error: sessionErr } = await this.db
      .from('sessions')
      .select('id, user_id, title, language, created_at, updated_at')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      throw AppError.sessionNotFound(sessionId);
    }

    // Ownership check: if session is owned by a user, caller must match
    if (session.user_id && (!caller || session.user_id !== caller.id)) {
      throw AppError.forbidden('You do not have permission to view this conversation session.');
    }

    // Fetch messages
    const { data: msgRows, error: msgErr } = await this.db
      .from('messages')
      .select('id, role, content, intent, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (msgErr) {
      logger.error('Failed to fetch session messages', { details: { error: msgErr.message } });
      throw AppError.internal('Failed to retrieve conversation messages.');
    }

    const messageIds = (msgRows || []).map(m => m.id);

    // Fetch citations for assistant messages
    const { data: citationRows } = await this.db
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
    const { data: session, error: sessionErr } = await this.db
      .from('sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      throw AppError.sessionNotFound(sessionId);
    }

    if (session.user_id && (!caller || session.user_id !== caller.id)) {
      throw AppError.forbidden('You do not have permission to delete this conversation session.');
    }

    const { error: deleteErr } = await this.db
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (deleteErr) {
      logger.error('Failed to delete session', { details: { error: deleteErr.message } });
      throw AppError.internal('Failed to delete conversation session.');
    }

    try {
      await this.db.from('audit_logs').insert({
        event_type: 'CONVERSATION_DELETED',
        user_id: caller?.id || null,
        resource_type: 'sessions',
        resource_id: sessionId,
      });
    } catch {
      // Non-blocking
    }

    return {
      deleted: true,
      session_id: sessionId,
    };
  }
}
