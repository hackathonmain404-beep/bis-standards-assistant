import { CertificationInfo } from '../types/compliance';
import { MOCK_CERTIFICATION_SCHEMES } from '../mocks/mockCertificationData';
import { apiConfig, isMockMode } from './apiConfig';

export const certificationApi = {
  async getSchemes(): Promise<CertificationInfo[]> {
    if (isMockMode()) {
      await new Promise((res) => setTimeout(res, 150));
      return MOCK_CERTIFICATION_SCHEMES;
    }

    const response = await fetch(`${apiConfig.baseUrl}/certification/schemes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch certification schemes: ${response.statusText}`);
    }
    return await response.json();
  },
};
