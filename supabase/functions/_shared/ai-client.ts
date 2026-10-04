/**
 * AI/RAG Service Client Abstraction — BIS Intelligent Assistant Backend
 * Follows Section 16, 25, 26, 38, 39, 75 of Master Implementation Prompt
 * Provides clean decoupling between Backend Application Layer and AI/RAG Service.
 */

import { AppError } from './errors.ts';
import { AIServiceRequest, AIServiceResponse } from './types.ts';
import { validateAiServiceResponse } from './ai-validator.ts';
import { Logger } from './logger.ts';
import { BackendConfig } from './config.ts';

const logger = new Logger(undefined, 'ai-client');

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownPeriodMs?: number;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class AICircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly cooldownPeriodMs: number;

  constructor(options?: CircuitBreakerOptions) {
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.cooldownPeriodMs = options?.cooldownPeriodMs ?? 30000;
  }

  getState(): CircuitBreakerState {
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime >= this.cooldownPeriodMs) {
        this.state = 'HALF_OPEN';
      }
    }
    return this.state;
  }

  canExecute(): boolean {
    const currentState = this.getState();
    return currentState === 'CLOSED' || currentState === 'HALF_OPEN';
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

export interface AIServiceClient {
  queryAssistant(request: AIServiceRequest, requestId: string): Promise<AIServiceResponse>;
  healthCheck(): Promise<boolean>;
  getCircuitBreaker?(): AICircuitBreaker;
}

/**
 * Mock AI Service Client for local development, contract testing, and offline testing.
 * Returns deterministic, clearly marked test fixtures matching the AI Service Contract.
 * NEVER presents mock data as authoritative BIS real-world rulings.
 */
export class MockAIServiceClient implements AIServiceClient {
  async queryAssistant(request: AIServiceRequest, requestId: string): Promise<AIServiceResponse> {
    const query = request.query.toLowerCase();

    // Simulated latency for realistic testing
    await new Promise(resolve => setTimeout(resolve, 50));

    // Test scenario: Insufficient evidence
    if (query.includes('unregistered unknown item xyz') || query.includes('no-evidence-test')) {
      return {
        response_text:
          'I could not find relevant BIS information for your query in my current knowledge base. This may be because no specific standard exists for this topic, or the relevant information is not yet indexed. You may want to contact the Bureau of Indian Standards (BIS) directly for authoritative guidance.',
        intent: 'OUT_OF_SCOPE',
        citations: [],
        needs_clarification: false,
        clarification_questions: [],
        follow_up_suggestions: [
          'Would you like to search by a specific Indian Standard number?',
          'Would you like to browse major BIS product categories?',
        ],
        metadata: {
          intent: 'OUT_OF_SCOPE',
          chunks_retrieved: 0,
          chunks_used: 0,
          processing_time_ms: 50,
          mock: true,
        },
      };
    }

    // Test scenario: Clarification needed
    if (query.length < 10 || query === 'i make products' || query.includes('clarification-test')) {
      return {
        response_text:
          'To help you identify the applicable Indian Standards and certification requirements, could you provide more details about your product, such as its intended use, operating voltage, or material composition?',
        intent: 'CLARIFICATION_NEEDED',
        citations: [],
        needs_clarification: true,
        clarification_questions: [
          'What is the specific type or intended use of your product?',
          'Is the product intended for domestic, commercial, or industrial applications?',
        ],
        follow_up_suggestions: [
          'I manufacture household electrical appliances',
          'I produce packaged drinking water',
        ],
        metadata: {
          intent: 'CLARIFICATION_NEEDED',
          chunks_retrieved: 1,
          chunks_used: 0,
          processing_time_ms: 50,
          mock: true,
        },
      };
    }

    // Test scenario: Packaged Drinking Water
    if (query.includes('water') || query.includes('drinking') || query.includes('14543')) {
      return {
        response_text:
          '[DEMO TEST RESPONSE] Packaged Drinking Water (other than Packaged Natural Mineral Water) is governed by IS 14543:2016 [1]. Under the Food Safety and Standards (FSSAI) regulations and BIS Act, mandatory certification under the ISI mark Scheme I is required prior to commercial distribution. Key quality criteria include microbiological testing and chemical parameter limits [2].',
        intent: 'PRODUCT_DISCOVERY',
        citations: [
          {
            index: 1,
            standard_id: 'IS 14543:2016',
            document_title: 'Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification',
            section: '1. Scope',
            clause: '1.1',
            snippet: '[DEMO TEST SNIPPET] This standard prescribes the requirements and methods of sampling and test for packaged drinking water.',
            source_document_id: 'doc-is-14543',
          },
          {
            index: 2,
            standard_id: 'IS 14543:2016',
            document_title: 'Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification',
            section: '4. Requirements',
            clause: '4.2',
            snippet: '[DEMO TEST SNIPPET] The water shall conform to the chemical and microbiological limits prescribed in Table 1 and Table 2.',
            source_document_id: 'doc-is-14543',
          },
        ],
        needs_clarification: false,
        clarification_questions: [],
        follow_up_suggestions: [
          'What testing facilities are required for packaged drinking water?',
          'How do I apply for a BIS licence under Scheme I?',
          'Which recognized laboratories can test water samples?',
        ],
        metadata: {
          intent: 'PRODUCT_DISCOVERY',
          chunks_retrieved: 6,
          chunks_used: 2,
          processing_time_ms: 50,
          mock: true,
        },
      };
    }

    // Default mock response: Electrical Appliance / General
    return {
      response_text:
        '[DEMO TEST RESPONSE] For household electrical appliances such as electric irons, the applicable safety specification is IS 302 (Part 2/Sec 3):2007 read in conjunction with the general safety standard IS 302-1 [1]. Compliance with electrical insulation, heating, and mechanical strength requirements is mandatory under the relevant Quality Control Orders (QCOs) [2].',
      intent: 'PRODUCT_DISCOVERY',
      citations: [
        {
          index: 1,
          standard_id: 'IS 302 (Part 2/Sec 3):2007',
          document_title: 'Safety of Household and Similar Electrical Appliances — Particular Requirements: Electric Irons',
          section: '1. Scope',
          clause: '1.1',
          snippet: '[DEMO TEST SNIPPET] This standard deals with the safety of electric dry irons and steam irons for household and similar purposes.',
          source_document_id: 'doc-is-302-2-3',
        },
        {
          index: 2,
          standard_id: 'IS 302-1:2008',
          document_title: 'Safety of Household and Similar Electrical Appliances — General Requirements',
          section: '8. Protection Against Access to Live Parts',
          clause: '8.1',
          snippet: '[DEMO TEST SNIPPET] Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts.',
          source_document_id: 'doc-is-302-1',
        },
      ],
      needs_clarification: false,
      clarification_questions: [],
      follow_up_suggestions: [
        'What testing procedures are mandated under IS 302?',
        'What is the difference between Scheme I (ISI mark) and Scheme II (CRS)?',
        'How can I find a BIS-recognized laboratory for testing electric irons?',
      ],
      metadata: {
        intent: 'PRODUCT_DISCOVERY',
        chunks_retrieved: 8,
        chunks_used: 2,
        processing_time_ms: 50,
        mock: true,
      },
    };
  }

  private circuitBreaker = new AICircuitBreaker();

  getCircuitBreaker(): AICircuitBreaker {
    return this.circuitBreaker;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}

/**
 * Real AI Service Client communicating via HTTP with the AI/RAG Orchestration Service.
 * Implements strict timeouts, bounded retries with exponential backoff, and response validation.
 */
export class RealAIServiceClient implements AIServiceClient {
  private serviceUrl: string;
  private serviceKey: string;
  private timeoutMs: number;
  private maxRetries: number;
  private circuitBreaker: AICircuitBreaker;

  constructor(
    serviceUrl: string,
    serviceKey: string,
    timeoutMs = 30000,
    maxRetries = 2,
    circuitBreakerOptions?: CircuitBreakerOptions
  ) {
    this.serviceUrl = serviceUrl.replace(/\/+$/, '');
    this.serviceKey = serviceKey;
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
    this.circuitBreaker = new AICircuitBreaker(circuitBreakerOptions);
  }

  getCircuitBreaker(): AICircuitBreaker {
    return this.circuitBreaker;
  }

  async queryAssistant(request: AIServiceRequest, requestId: string): Promise<AIServiceResponse> {
    if (!this.circuitBreaker.canExecute()) {
      logger.warn('AI circuit breaker OPEN — short-circuiting request', { request_id: requestId });
      throw AppError.aiUnavailable('AI service circuit breaker open due to repeated outages.');
    }

    let lastError: unknown = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 2000);
        logger.warn(`Retrying AI service query (attempt ${attempt}/${this.maxRetries}) after ${backoffMs}ms`, {
          request_id: requestId,
        });
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        };
        if (this.serviceKey) {
          headers['Authorization'] = `Bearer ${this.serviceKey}`;
        }

        const response = await fetch(`${this.serviceUrl}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          // Only retry transient 5xx server errors
          if (status === 502 || status === 503 || status === 504) {
            lastError = AppError.aiUnavailable(`AI Service returned HTTP ${status}`);
            continue;
          }
          // Do not retry 4xx errors
          const errorBody = await response.text().catch(() => '');
          logger.error(`AI service returned non-retryable error HTTP ${status}`, {
            request_id: requestId,
            details: { status, body: errorBody },
          });
          this.circuitBreaker.recordFailure();
          throw AppError.aiUnavailable('Assistant engine error.');
        }

        const rawJson = await response.json();
        this.circuitBreaker.recordSuccess();
        return validateAiServiceResponse(rawJson);
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        lastError = err;

        if (err instanceof Error && err.name === 'AbortError') {
          logger.error(`AI service request timed out after ${this.timeoutMs}ms`, { request_id: requestId });
          this.circuitBreaker.recordFailure();
          throw AppError.timeout();
        }

        // Network failure can be retried if attempts remain
        logger.warn('AI service network attempt failed', {
          request_id: requestId,
          details: { error: err instanceof Error ? err.message : String(err) },
        });
      }
    }

    this.circuitBreaker.recordFailure();
    logger.error('Exhausted all retries connecting to AI service', {
      request_id: requestId,
      details: { error: lastError instanceof Error ? lastError.message : String(lastError) },
    });
    throw AppError.aiUnavailable();
  }

  async healthCheck(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(`${this.serviceUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }
}

/**
 * Factory to instantiate the appropriate AIServiceClient based on configuration
 */
export function getAiServiceClient(config: BackendConfig): AIServiceClient {
  if (config.aiMockMode || !config.aiServiceUrl) {
    return new MockAIServiceClient();
  }
  return new RealAIServiceClient(config.aiServiceUrl, config.aiServiceKey, config.aiTimeoutMs);
}
