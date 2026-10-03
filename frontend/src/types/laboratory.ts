export interface LaboratoryInfo {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    pincode?: string;
    address?: string;
  };
  recognition_status: 'BIS Recognized' | 'BIS Central Lab' | 'BIS Regional Lab' | 'NABL Accredited';
  capabilities: string[];
  tested_standards: string[];
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface LaboratoryFilter {
  query?: string;
  state?: string;
  city?: string;
  standard_id?: string;
  recognition_status?: string;
}
