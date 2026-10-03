/**
 * In-Memory Mock Supabase Client — BIS Intelligent Assistant Backend
 * Enables full offline local development, API contract testing, and CI without requiring local Docker.
 */

export function createInMemorySupabaseClient(): any {
  const sessions: any[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: null,
      title: '[DEMO] Electric steam iron compliance',
      language: 'en',
      created_at: '2026-10-03T14:00:00Z',
      updated_at: '2026-10-03T14:05:00Z',
      is_active: true,
    },
  ];

  const messages: any[] = [
    {
      id: '00000000-0000-0000-0000-000000000011',
      session_id: '00000000-0000-0000-0000-000000000001',
      role: 'user',
      content: 'I manufacture a domestic electric steam iron. Which BIS standards apply?',
      intent: null,
      language: 'en',
      created_at: '2026-10-03T14:00:00Z',
    },
    {
      id: '00000000-0000-0000-0000-000000000012',
      session_id: '00000000-0000-0000-0000-000000000001',
      role: 'assistant',
      content: '[DEMO TEST RESPONSE] For domestic electric steam irons, the primary Indian Standard is IS 302 (Part 2/Sec 3):2007 covering particular requirements for electric irons [1].',
      intent: 'PRODUCT_DISCOVERY',
      language: 'en',
      metadata: {
        needs_clarification: false,
        clarification_questions: [],
        follow_up_suggestions: ['What testing is required?'],
      },
      created_at: '2026-10-03T14:00:05Z',
    },
  ];

  const citations: any[] = [
    {
      id: '00000000-0000-0000-0000-000000000021',
      message_id: '00000000-0000-0000-0000-000000000012',
      citation_index: 1,
      standard_id: 'IS 302 (Part 2/Sec 3):2007',
      document_title: 'Safety of Household and Similar Electrical Appliances',
      section: 'Section 1 Scope',
      clause: 'Clause 1.1',
      snippet: '[DEMO SNIPPET] This standard applies to electric irons.',
      source_document_id: 'doc-is-302-2-3',
      created_at: '2026-10-03T14:00:05Z',
    },
  ];

  const appConfig: any[] = [
    { key: 'app_name', value: 'BIS Intelligent Assistant' },
    { key: 'app_version', value: '0.1.0' },
  ];

  function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    _db: { sessions, messages, citations, appConfig },
    auth: {
      async getUser(_token: string) {
        return { data: { user: null }, error: null };
      },
    },
    from(tableName: string) {
      let currentTable: any[];
      if (tableName === 'sessions') currentTable = sessions;
      else if (tableName === 'messages') currentTable = messages;
      else if (tableName === 'citations') currentTable = citations;
      else if (tableName === 'app_config') currentTable = appConfig;
      else currentTable = [];

      let filters: ((item: any) => boolean)[] = [];
      let sortFn: ((a: any, b: any) => number) | null = null;
      let limitCount: number | null = null;
      let rangeOffset = 0;
      let rangeLimit: number | null = null;
      let isSingle = false;

      let pendingUpdate: any = null;
      let pendingDelete = false;
      let lastInserted: any[] | null = null;

      const queryBuilder: any = {
        select(_cols?: string, _opts?: any) {
          return queryBuilder;
        },
        eq(col: string, val: any) {
          filters.push(item => item[col] === val);
          return queryBuilder;
        },
        gt(col: string, val: any) {
          filters.push(item => item[col] > val);
          return queryBuilder;
        },
        in(col: string, vals: any[]) {
          filters.push(item => vals.includes(item[col]));
          return queryBuilder;
        },
        order(col: string, opts?: { ascending?: boolean }) {
          const asc = opts?.ascending !== false;
          sortFn = (a, b) => {
            if (a[col] < b[col]) return asc ? -1 : 1;
            if (a[col] > b[col]) return asc ? 1 : -1;
            return 0;
          };
          return queryBuilder;
        },
        limit(count: number) {
          limitCount = count;
          return queryBuilder;
        },
        range(fromIdx: number, toIdx: number) {
          rangeOffset = fromIdx;
          rangeLimit = toIdx - fromIdx + 1;
          return queryBuilder;
        },
        single() {
          isSingle = true;
          return queryBuilder;
        },
        insert(payload: any) {
          const rows = Array.isArray(payload) ? payload : [payload];
          const inserted: any[] = [];
          for (const row of rows) {
            const item = {
              id: row.id || `uuid-${Math.random().toString(36).slice(2, 10)}`,
              created_at: row.created_at || new Date().toISOString(),
              updated_at: row.updated_at || new Date().toISOString(),
              ...row,
            };
            currentTable.push(item);
            inserted.push(item);
          }
          lastInserted = inserted;
          return queryBuilder;
        },
        update(payload: any) {
          pendingUpdate = payload;
          return queryBuilder;
        },
        delete() {
          pendingDelete = true;
          return queryBuilder;
        },
        then(resolve: any, _reject: any) {
          if (pendingDelete) {
            let deletedCount = 0;
            for (let i = currentTable.length - 1; i >= 0; i--) {
              if (filters.every(f => f(currentTable[i]))) {
                currentTable.splice(i, 1);
                deletedCount++;
              }
            }
            return resolve({ data: null, error: null, count: deletedCount });
          }

          if (pendingUpdate) {
            let updatedCount = 0;
            for (const item of currentTable) {
              if (filters.every(f => f(item))) {
                Object.assign(item, pendingUpdate);
                updatedCount++;
              }
            }
            return resolve({ data: null, error: null, count: updatedCount });
          }

          if (lastInserted) {
            return resolve({
              data: isSingle ? clone(lastInserted[0]) : clone(lastInserted),
              error: null,
            });
          }

          let result = currentTable.filter(item => filters.every(f => f(item)));
          if (sortFn) result.sort(sortFn);
          if (rangeLimit !== null) {
            result = result.slice(rangeOffset, rangeOffset + rangeLimit);
          } else if (limitCount !== null) {
            result = result.slice(0, limitCount);
          }

          if (isSingle) {
            const item = result[0] ? clone(result[0]) : null;
            return resolve({
              data: item,
              error: item ? null : { message: 'Not found' },
            });
          }

          return resolve({
            data: clone(result),
            count: currentTable.filter(item => filters.every(f => f(item))).length,
            error: null,
          });
        },
      };

      return queryBuilder;
    },
  };
}
