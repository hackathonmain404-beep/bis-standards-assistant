/**
 * Backend Setup Diagnostic Tool — BIS Intelligent Assistant Backend
 * Follows Master Spec Section 118
 * Validates dependencies, environment, database connectivity, and mock AI readiness.
 */

import process from 'node:process';
import { getBackendConfig } from './config.ts';
import { createServerClient } from './supabase-client.ts';
import { getAiServiceClient } from './ai-client.ts';
import { HealthService } from './services.ts';

interface DiagnosticResult {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
}

async function runDiagnostics(): Promise<void> {
  console.log('\n============================================================');
  console.log('BIS Intelligent Assistant — Backend Diagnostic Tool');
  console.log('============================================================\n');

  const results: DiagnosticResult[] = [];
  const config = getBackendConfig();

  // 1. Runtime verification
  const nodeVersion = process.version;
  const majorNode = parseInt(nodeVersion.replace(/^v/, '').split('.')[0], 10);
  if (majorNode >= 20) {
    results.push({
      name: 'Node.js Runtime',
      status: 'PASS',
      message: `${nodeVersion} (compatible >= v20.0.0)`,
    });
  } else {
    results.push({
      name: 'Node.js Runtime',
      status: 'FAIL',
      message: `${nodeVersion} is below required v20.0.0`,
    });
  }

  // 2. Supabase Configuration Check
  if (!config.supabaseUrl || config.supabaseUrl.includes('placeholder')) {
    results.push({
      name: 'SUPABASE_URL',
      status: 'FAIL',
      message: 'SUPABASE_URL is missing or set to a placeholder.',
    });
  } else if (config.supabaseUrl.endsWith('/rest/v1') || config.supabaseUrl.endsWith('/rest/v1/')) {
    results.push({
      name: 'SUPABASE_URL',
      status: 'WARN',
      message: `${config.supabaseUrl} has /rest/v1 suffix. (Auto-stripped at runtime)`,
    });
  } else {
    results.push({
      name: 'SUPABASE_URL',
      status: 'PASS',
      message: `${config.supabaseUrl}`,
    });
  }

  if (config.supabaseAnonKey && config.supabaseAnonKey !== 'your-supabase-anon-key') {
    results.push({
      name: 'SUPABASE_ANON_KEY',
      status: 'PASS',
      message: 'Client key present',
    });
  } else {
    results.push({
      name: 'SUPABASE_ANON_KEY',
      status: 'WARN',
      message: 'Using mock anon key fallback (offline mode)',
    });
  }

  if (config.supabaseServiceRoleKey && config.supabaseServiceRoleKey !== 'your-supabase-service-role-key') {
    results.push({
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      status: 'PASS',
      message: 'Server secret present',
    });
  } else {
    results.push({
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      status: 'WARN',
      message: 'Using mock service-role fallback (offline mode)',
    });
  }

  // 3. AI Isolation Rule Check (MUST be in mock mode in this phase)
  if (config.aiMockMode) {
    results.push({
      name: 'AI/RAG Disconnection Rule',
      status: 'PASS',
      message: 'AI_MOCK_MODE=true (Standalone mode strictly enforced; real AI disconnected)',
    });
  } else {
    results.push({
      name: 'AI/RAG Disconnection Rule',
      status: 'WARN',
      message: 'AI_MOCK_MODE is false. Rule violation: real AI must remain disconnected in this phase.',
    });
  }

  // 4. Supabase Database Connectivity
  const supabase = createServerClient();
  try {
    const { error: cfgErr } = await supabase.from('app_config').select('key').limit(1);
    if (cfgErr) {
      results.push({
        name: 'Database Connectivity',
        status: 'FAIL',
        message: `Database query failed: ${cfgErr.message}`,
      });
    } else {
      results.push({
        name: 'Database Connectivity',
        status: 'PASS',
        message: 'Successfully queried public.app_config table',
      });
    }
  } catch (err: unknown) {
    results.push({
      name: 'Database Connectivity',
      status: 'FAIL',
      message: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // 5. Mock AI Service Responsiveness
  const aiClient = getAiServiceClient(config);
  try {
    const aiResp = await aiClient.queryAssistant(
      {
        session_id: 'diag-session',
        query: 'electric iron',
        conversation_history: [],
        language: 'en',
      },
      'diag-req-1'
    );
    if (aiResp && aiResp.response_text) {
      results.push({
        name: 'Mock AI Engine',
        status: 'PASS',
        message: `Responsive: ${aiResp.response_text.slice(0, 45)}...`,
      });
    } else {
      results.push({
        name: 'Mock AI Engine',
        status: 'FAIL',
        message: 'Mock AI returned empty response.',
      });
    }
  } catch (err: unknown) {
    results.push({
      name: 'Mock AI Engine',
      status: 'FAIL',
      message: `Exception: ${err instanceof Error ? err.message : String(err)}`,
    });
  }

  // 6. Readiness Probe Check
  const healthService = new HealthService(supabase, aiClient);
  const readiness = await healthService.readiness();
  results.push({
    name: 'Readiness Probe (/api/v1/ready)',
    status: readiness.ready ? 'PASS' : 'WARN',
    message: `Ready: ${readiness.ready}, Database: ${readiness.database}, AI: ${readiness.ai_service}`,
  });

  // Print Summary
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️ ' : '❌';
    console.log(`${icon} [${r.status.padEnd(4)}] ${r.name.padEnd(30)} : ${r.message}`);
  }

  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log('\n------------------------------------------------------------');
  if (failCount === 0) {
    console.log('STATUS: BACKEND READY FOR LOCAL RUNNING AND FUTURE INTEGRATION');
  } else {
    console.log(`STATUS: ${failCount} DIAGNOSTIC FAILURE(S) DETECTED`);
  }
  console.log('============================================================\n');
}

runDiagnostics().catch(console.error);
