import { LaboratoryFilter, LaboratoryInfo } from '../types/laboratory';
import { MOCK_LABORATORIES } from '../mocks/mockLabsData';
import { apiConfig, isMockMode } from './apiConfig';

export const laboratoryApi = {
  async getLaboratories(filter?: LaboratoryFilter): Promise<LaboratoryInfo[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 200));
      let results = [...MOCK_LABORATORIES];

      if (filter?.query) {
        const q = filter.query.toLowerCase();
        results = results.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.location.city.toLowerCase().includes(q) ||
            l.location.state.toLowerCase().includes(q) ||
            l.capabilities.some((c) => c.toLowerCase().includes(q))
        );
      }

      if (filter?.state && filter.state !== 'All') {
        results = results.filter((l) => l.location.state.toLowerCase() === filter.state!.toLowerCase());
      }

      if (filter?.standard_id) {
        const sid = filter.standard_id.toLowerCase();
        results = results.filter((l) => l.tested_standards.some((s) => s.toLowerCase().includes(sid)));
      }

      if (filter?.recognition_status && filter.recognition_status !== 'All') {
        results = results.filter((l) => l.recognition_status === filter.recognition_status);
      }

      return results;
    }

    const queryParams = new URLSearchParams();
    if (filter?.query) queryParams.append('q', filter.query);
    if (filter?.state) queryParams.append('state', filter.state);

    try {
      const response = await fetch(`${apiConfig.baseUrl}/labs?${queryParams.toString()}`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }

    let results = [...MOCK_LABORATORIES];
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.location.city.toLowerCase().includes(q) ||
          l.location.state.toLowerCase().includes(q) ||
          l.capabilities.some((c) => c.toLowerCase().includes(q))
      );
    }
    return results;
  },
};
