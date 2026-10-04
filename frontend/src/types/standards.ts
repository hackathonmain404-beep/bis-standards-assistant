import { SourceReference } from './evidence';

export type MatchStatus = 'matched' | 'partial' | 'pending';

export interface MatchReason {
  category: string;
  label: string;
  status: MatchStatus;
  detail?: string;
}

export interface StandardRecommendation {
  standard_number: string;
  title: string;
  status: 'Active' | 'Under Revision' | 'Withdrawn' | 'Draft';
  short_description?: string;
  match_reasons: MatchReason[];
  source_availability?: boolean;
  url?: string;
  is_mandatory?: boolean;
  qco_order?: string;
  scope?: string;
}

export interface StandardFilter {
  query?: string;
  category?: string;
  department?: string;
  status?: string;
  mandatoryOnly?: boolean;
  scheme?: string;
  sort?: 'relevance' | 'number-asc' | 'number-desc' | 'year-desc' | 'title-asc';
}

export interface StandardDetail {
  standard_number: string;
  title: string;
  status: 'Active' | 'Under Revision' | 'Withdrawn';
  publication_year: number | string;
  department: string;
  category: string;
  is_mandatory: boolean;
  qco_reference?: string;
  overview: string;
  scope: string;
  requirements: {
    section: string;
    title: string;
    description: string;
    clause: string;
  }[];
  testing_methods: {
    name: string;
    clause: string;
    mandatory: boolean;
    description: string;
  }[];
  certification_schemes: string[];
  related_standards: {
    standard_number: string;
    title: string;
    relation_type: 'Replaces' | 'Referenced In' | 'Complementary';
  }[];
  sources: SourceReference[];
}
