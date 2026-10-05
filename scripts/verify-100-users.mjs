/**
 * 100 Demo Users Full-Stack & AI Verification Harness
 * Tests the Vercel Serverless Gateway, Backend APIs, and AI Engine directly.
 */

import { handleApiRequest, BIS_STANDARDS, BIS_LABS, BIS_CERTIFICATION_SCHEMES } from '../frontend/api/v1/handler.ts';

// Mock request / response wrapper to invoke Vercel handler in Node environment
function createMockHttp(method, path, body = null, queryParams = {}) {
  let statusCode = 200;
  const headers = {};
  let responseData = null;

  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = queryString ? `${path}?${queryString}` : path;

  const req = {
    method,
    url: fullUrl,
    body,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  };

  const res = {
    statusCode: 200,
    setHeader(name, val) {
      headers[name.toLowerCase()] = val;
      return res;
    },
    status(code) {
      statusCode = code;
      res.statusCode = code;
      return res;
    },
    json(data) {
      responseData = data;
      return res;
    },
    end(data) {
      if (data && !responseData) responseData = data;
      return res;
    },
    _getResult() {
      return { statusCode, headers, data: responseData };
    },
  };

  return { req, res };
}

// 100 Users Definition
const USERS_ROLES = ['Officer', 'Industry Stakeholder', 'Auditor'];
const PRODUCTS = [
  { term: 'water', standard: 'IS 14543:2016', query: 'What standard applies to packaged drinking water?' },
  { term: 'iron', standard: 'IS 302-2-3:2007', query: 'Which standard covers domestic electric steam irons?' },
  { term: 'heater', standard: 'IS 2082:2018', query: 'What are the safety requirements for electric storage water heaters?' },
  { term: 'steel', standard: 'IS 17526:2021', query: 'What are the specifications for stainless steel vacuum insulated bottles?' },
  { term: 'plug', standard: 'IS 1293:2019', query: 'What are the dimensional and safety requirements for 16A plugs and sockets?' },
];

async function run100UsersSimulation() {
  console.log('\n================================================================');
  console.log(' BIS Intelligent Assistant — 100 Demo Users Full-Stack E2E Test ');
  console.log('================================================================\n');

  const startTime = Date.now();
  let passCount = 0;
  let failCount = 0;

  // 1. Verify Health Endpoint
  console.log('[Phase 1] Verifying Backend & AI Readiness (/api/v1/health)...');
  const { req: hReq, res: hRes } = createMockHttp('GET', '/api/v1/health');
  await handleApiRequest(hReq, hRes);
  const hResult = hRes._getResult();

  if (hResult.statusCode === 200 && hResult.data?.status === 'healthy') {
    console.log(`  ✅ Health Probe: PASS (Service: ${hResult.data.service}, AI Engine: ${hResult.data.ai_service})\n`);
  } else {
    console.error('  ❌ Health Probe: FAIL', hResult);
    process.exit(1);
  }

  // 2. Simulate 100 Users
  console.log('[Phase 2] Simulating 100 Diverse Users Across Roles & Industries...');
  const userStats = [];

  for (let i = 1; i <= 100; i++) {
    const padded = String(i).padStart(3, '0');
    const role = USERS_ROLES[(i - 1) % USERS_ROLES.length];
    const product = PRODUCTS[(i - 1) % PRODUCTS.length];
    const isGov = role === 'Officer';
    const email = isGov ? `officer.${padded}@bis.gov.in` : `user.${padded}@enterprise-${padded}.in`;
    const name = isGov ? `BIS Officer ${padded}` : `Stakeholder ${padded}`;

    // Step A: Authentication
    const { req: aReq, res: aRes } = createMockHttp('POST', '/api/v1/auth/login', {
      email,
      password: 'password123',
    });
    await handleApiRequest(aReq, aRes);
    const aResult = aRes._getResult();

    const authOk = aResult.statusCode === 200 && aResult.data?.success === true;

    // Step B: AI Chat Query Execution
    const { req: cReq, res: cRes } = createMockHttp('POST', '/api/v1/chat', {
      session_id: `session-user-${padded}`,
      message: product.query,
      language: 'en',
    });
    await handleApiRequest(cReq, cRes);
    const cResult = cRes._getResult();

    const chatOk =
      cResult.statusCode === 200 &&
      Boolean(cResult.data?.response?.text) &&
      Array.isArray(cResult.data?.response?.citations) &&
      cResult.data.response.citations.length > 0;

    const citationFound = cResult.data?.response?.citations?.[0]?.standard_id || 'N/A';

    // Step C: Standards Catalog Search
    const { req: sReq, res: sRes } = createMockHttp('GET', '/api/v1/standards', null, { q: product.term });
    await handleApiRequest(sReq, sRes);
    const sResult = sRes._getResult();
    const standardsOk = sResult.statusCode === 200 && Array.isArray(sResult.data) && sResult.data.length > 0;

    // Step D: Lab Registry Lookup
    const { req: lReq, res: lRes } = createMockHttp('GET', '/api/v1/labs', null, { q: product.term });
    await handleApiRequest(lReq, lRes);
    const lResult = lRes._getResult();
    const labsOk = lResult.statusCode === 200 && Array.isArray(lResult.data);

    const userSuccess = authOk && chatOk && standardsOk && labsOk;

    if (userSuccess) {
      passCount++;
    } else {
      failCount++;
    }

    userStats.push({
      userId: `USR-${padded}`,
      role,
      email,
      query: product.query.slice(0, 35) + '...',
      matchedStandard: citationFound,
      status: userSuccess ? 'PASS' : 'FAIL',
    });

    if (i % 20 === 0 || i === 100) {
      console.log(`  Processed ${i}/100 users... (${passCount} passed, ${failCount} failed)`);
    }
  }

  const durationMs = Date.now() - startTime;

  // Print Sample Table of Processed Users
  console.log('\n--- Sample Verification (Users 1-10 & 91-100) ---');
  console.table(
    [...userStats.slice(0, 10), ...userStats.slice(90, 100)].map((u) => ({
      ID: u.userId,
      Role: u.role,
      Query: u.query,
      'Grounded Standard': u.matchedStandard,
      Result: u.status,
    }))
  );

  console.log('\n================================================================');
  console.log(` SUMMARY REPORT: 100 USERS SIMULATION`);
  console.log(` Total Users Tested : 100`);
  console.log(` Passed             : ${passCount}`);
  console.log(` Failed             : ${failCount}`);
  console.log(` Pass Rate          : ${((passCount / 100) * 100).toFixed(1)}%`);
  console.log(` Duration           : ${(durationMs / 1000).toFixed(2)}s`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

run100UsersSimulation().catch((err) => {
  console.error('Fatal error during 100 users simulation:', err);
  process.exit(1);
});
