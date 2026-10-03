import { SourceReference } from './evidence';

export type RoadmapStepId =
  | 'product'
  | 'classification'
  | 'standard'
  | 'scheme'
  | 'testing'
  | 'laboratory'
  | 'application'
  | 'assessment'
  | 'certification';

export type StepStatus =
  | 'completed'
  | 'current'
  | 'pending'
  | 'unavailable'
  | 'requires_information';

export interface RoadmapStep {
  id: RoadmapStepId;
  title: string;
  description: string;
  status: StepStatus;
  details?: string;
  action_label?: string;
  action_type?: string;
  action_payload?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: 'Standards Review' | 'Pre-requisites' | 'Testing' | 'Documentation' | 'Audit & License';
  completed: boolean;
  required: boolean;
  evidence_ref?: string;
}

export interface CertificationStep {
  step_number: number;
  name: string;
  description: string;
  timeline?: string;
  deliverables?: string[];
}

export interface CertificationInfo {
  scheme_name: string;
  scheme_code: string;
  applicable_standard?: string;
  eligibility: string;
  process_steps: CertificationStep[];
  required_documents: string[];
  official_portal_url: string;
  fee_structure_notice?: string;
}

export type TestingRequirementStatus = 'mandatory' | 'optional' | 'conditional' | 'unknown';

export interface TestingRequirement {
  id: string;
  test_name: string;
  requirement_description: string;
  status: TestingRequirementStatus;
  standard_clause: string;
  acceptance_criteria?: string;
  test_method?: string;
  source_reference?: SourceReference;
}
