/**
 * API Configuration & Adapter Mode
 * Controls whether requests hit live backend endpoints or use structured client mock adapters.
 */

export interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
  timeoutMs: number;
}

// In development, default to mock mode unless explicitly configured otherwise
export const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  useMock: import.meta.env.VITE_USE_MOCK_API !== 'false',
  timeoutMs: 15000,
};

// Automatically purge stale mock flags when configured for live backend
if (typeof window !== 'undefined' && import.meta.env.VITE_USE_MOCK_API === 'false') {
  localStorage.removeItem('bis_use_mock_api');
}

export function setMockMode(enabled: boolean): void {
  apiConfig.useMock = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('bis_use_mock_api', String(enabled));
  }
}

export function isMockMode(): boolean {
  // When live backend is explicitly configured, never allow stale localStorage to force mock mode
  if (import.meta.env.VITE_USE_MOCK_API === 'false') {
    return false;
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('bis_use_mock_api');
    if (stored !== null) {
      return stored === 'true';
    }
  }
  return apiConfig.useMock;
}
