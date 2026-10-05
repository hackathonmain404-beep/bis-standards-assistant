import { describe, it, expect, beforeEach } from 'vitest';
import { DEMO_USERS, getDemoUser } from '../mocks/demoUsersData';
import { assistantApi } from '../services/assistantApi';
import { standardsApi } from '../services/standardsApi';
import { laboratoryApi } from '../services/laboratoryApi';
import { setMockMode } from '../services/apiConfig';

describe('100 Demo Users Full-Stack Workflow & AI Grounding Test Suite', () => {
  beforeEach(() => {
    setMockMode(true);
  });

  it('validates all 100 demo users have valid profiles, emails, and queries', () => {
    expect(DEMO_USERS).toHaveLength(100);

    const emailSet = new Set<string>();
    const idSet = new Set<string>();

    DEMO_USERS.forEach((u, idx) => {
      expect(u.id).toBeTruthy();
      expect(u.name).toBeTruthy();
      expect(u.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(['Officer', 'Industry Stakeholder', 'Auditor']).toContain(u.role);
      expect(u.organization).toBeTruthy();
      expect(u.sampleQuery).toBeTruthy();

      expect(idSet.has(u.id)).toBe(false);
      idSet.add(u.id);

      expect(emailSet.has(u.email)).toBe(false);
      emailSet.add(u.email);
    });

    expect(idSet.size).toBe(100);
    expect(emailSet.size).toBe(100);
  });

  it('verifies helper lookup getDemoUser works by ID and Email', () => {
    const user1 = getDemoUser('usr-001');
    expect(user1).toBeDefined();
    expect(user1?.name).toBe('Rajesh Sharma');

    const userEmail = getDemoUser('rajesh.sharma@bis.gov.in');
    expect(userEmail).toBeDefined();
    expect(userEmail?.id).toBe('usr-001');

    const user100 = getDemoUser('usr-100');
    expect(user100).toBeDefined();
    expect(user100?.name).toBe('Dr. Anand Ramanujan');
  });

  it('simulates 100 users executing chat queries through the assistant engine', async () => {
    // Execute all 100 user queries in parallel for ultra-fast execution
    const results = await Promise.all(
      DEMO_USERS.map(async (u) => {
        const resp = await assistantApi.sendMessage({
          message: u.sampleQuery,
          session_id: `session-e2e-${u.id}`,
          language: 'en',
        });

        // 1. Response validity
        expect(resp).toBeDefined();
        expect(resp.session_id).toBeTruthy();
        expect(resp.message_id).toBeTruthy();
        expect(resp.response).toBeDefined();
        expect(resp.response.text).toBeTruthy();
        expect(resp.response.text.length).toBeGreaterThan(20);

        // 2. Structured copilot artifacts
        expect(resp.response.structured_copilot).toBeDefined();

        // 3. Follow-up suggestions
        expect(Array.isArray(resp.response.follow_up_suggestions)).toBe(true);

        return { userId: u.id, textLength: resp.response.text.length };
      })
    );

    expect(results).toHaveLength(100);
  }, 30000);

  it('simulates officers querying compliance standards and laboratory networks', async () => {
    const officers = DEMO_USERS.filter((u) => u.role === 'Officer');
    expect(officers.length).toBe(25);

    // Officers check mandatory standards
    const standards = await standardsApi.getStandards({ mandatoryOnly: true });
    expect(standards.length).toBeGreaterThan(0);
    standards.forEach((s) => expect(s.is_mandatory).toBe(true));

    // Officers check laboratory recognition
    const labs = await laboratoryApi.getLaboratories();
    expect(labs.length).toBeGreaterThan(0);
    expect(labs.some((l) => l.recognition_status.includes('BIS'))).toBe(true);
  });

  it('simulates industry stakeholders discovering standards by category', async () => {
    const industryUsers = DEMO_USERS.filter((u) => u.role === 'Industry Stakeholder');
    expect(industryUsers.length).toBeGreaterThan(25);

    // Query electrical standards
    const electrical = await standardsApi.getStandards({ category: 'Electrical & Electronics' });
    expect(electrical.length).toBeGreaterThan(0);
    expect(electrical.some((s) => s.standard_number.includes('IS 302'))).toBe(true);

    // Query food & beverage standards
    const food = await standardsApi.getStandards({ category: 'Food & Beverages' });
    expect(food.length).toBeGreaterThan(0);
    expect(food.some((s) => s.standard_number.includes('IS 14543'))).toBe(true);
  });

  it('simulates laboratory auditors searching specific test capabilities', async () => {
    const auditors = DEMO_USERS.filter((u) => u.role === 'Auditor');
    expect(auditors.length).toBeGreaterThan(20);

    // Filter labs by standard IS 14543
    const waterLabs = await laboratoryApi.getLaboratories({ standard_id: 'IS 14543' });
    expect(waterLabs.length).toBeGreaterThan(0);
    expect(waterLabs.some((l) => l.tested_standards.includes('IS 14543:2016'))).toBe(true);

    // Filter labs by standard IS 302
    const electricalLabs = await laboratoryApi.getLaboratories({ standard_id: 'IS 302' });
    expect(electricalLabs.length).toBeGreaterThan(0);
  });
});
