import { StandardDetail, StandardFilter } from '../types/standards';
import { MOCK_STANDARDS } from '../mocks/mockStandardsData';
import { apiConfig, isMockMode } from './apiConfig';

export const standardsApi = {
  async getStandards(filter?: StandardFilter): Promise<StandardDetail[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200));
      let results = [...MOCK_STANDARDS];

      if (filter?.query) {
        const q = (filter.query || '').toLowerCase();
        results = results.filter(
          (s) =>
            (s.standard_number || '').toLowerCase().includes(q) ||
            (s.title || '').toLowerCase().includes(q) ||
            (s.overview || '').toLowerCase().includes(q)
        );
      }

      if (filter?.category && filter.category !== 'All') {
        const cat = (filter.category || '').toLowerCase();
        results = results.filter((s) => (s.category || '').toLowerCase().includes(cat));
      }

      if (filter?.department && filter.department !== 'All') {
        const dept = (filter.department || '').toLowerCase();
        results = results.filter((s) => (s.department || '').toLowerCase().includes(dept));
      }

      if (filter?.status && filter.status !== 'All') {
        const st = (filter.status || '').toLowerCase();
        results = results.filter((s) => (s.status || '').toLowerCase() === st);
      }

      if (filter?.mandatoryOnly) {
        results = results.filter((s) => s.is_mandatory);
      }

      if (filter?.scheme && filter.scheme !== 'All') {
        const sch = (filter.scheme || '').toLowerCase();
        results = results.filter((s) =>
          s.certification_schemes?.some((sc) => (sc || '').toLowerCase().includes(sch))
        );
      }

      if (filter?.sort) {
        if (filter.sort === 'number-asc') {
          results.sort((a, b) => a.standard_number.localeCompare(b.standard_number));
        } else if (filter.sort === 'number-desc') {
          results.sort((a, b) => b.standard_number.localeCompare(a.standard_number));
        } else if (filter.sort === 'year-desc') {
          results.sort((a, b) => Number(b.publication_year) - Number(a.publication_year));
        } else if (filter.sort === 'title-asc') {
          results.sort((a, b) => a.title.localeCompare(b.title));
        }
      }

      return results;
    }

    const queryParams = new URLSearchParams();
    if (filter?.query) queryParams.append('q', filter.query);
    if (filter?.category) queryParams.append('category', filter.category);
    if (filter?.department) queryParams.append('department', filter.department);
    if (filter?.status) queryParams.append('status', filter.status);
    if (filter?.mandatoryOnly) queryParams.append('mandatoryOnly', 'true');
    if (filter?.scheme) queryParams.append('scheme', filter.scheme);
    if (filter?.sort) queryParams.append('sort', filter.sort);

    try {
      const response = await fetch(`${apiConfig.baseUrl}/standards?${queryParams.toString()}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Live standards API unreachable, using local catalog:', err);
    }
    return MOCK_STANDARDS;
  },

  async getStandardById(id: string): Promise<StandardDetail | null> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150));
      const cleanId = decodeURIComponent(id || '').toLowerCase().replace(/\s+/g, '');
      const found = MOCK_STANDARDS.find(
        (s) => (s.standard_number || '').toLowerCase().replace(/\s+/g, '') === cleanId
      );
      return found || MOCK_STANDARDS[0];
    }

    try {
      const response = await fetch(`${apiConfig.baseUrl}/standards/${encodeURIComponent(id)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Live standard detail API unreachable, using local catalog:', err);
    }
    const cleanId = decodeURIComponent(id || '').toLowerCase().replace(/\s+/g, '');
    const found = MOCK_STANDARDS.find(
      (s) => (s.standard_number || '').toLowerCase().replace(/\s+/g, '') === cleanId
    );
    return found || MOCK_STANDARDS[0];
  },
};
