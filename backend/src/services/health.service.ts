/**
 * Health & Readiness Service — BIS Intelligent Assistant Backend
 * Assesses availability of Application Database and AI Services.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { HealthResponse } from '../types.ts';
import type { AIServiceClient } from '../ai-client.ts';

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

    const overallStatus =
      dbStatus === 'healthy' && aiStatus === 'healthy'
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

  async readiness(): Promise<{
    ready: boolean;
    status: string;
    database: string;
    ai_service: string;
    version: string;
  }> {
    let dbStatus = 'connected';
    let aiStatus = 'ready (mock)';

    try {
      const { error } = await this.supabase.from('app_config').select('key').limit(1);
      if (error) dbStatus = 'disconnected';
    } catch {
      dbStatus = 'disconnected';
    }

    try {
      const aiHealthy = await this.aiClient.healthCheck();
      if (!aiHealthy) aiStatus = 'degraded';
    } catch {
      aiStatus = 'degraded';
    }

    const ready = dbStatus === 'connected';

    return {
      ready,
      status: ready ? 'ready' : 'not_ready',
      database: dbStatus,
      ai_service: aiStatus,
      version: '0.1.0',
    };
  }
}
