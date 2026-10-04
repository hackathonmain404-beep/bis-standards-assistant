import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProductUnderstandingCard } from '../components/assistant/ProductUnderstandingCard';
import { StandardRecommendationCard } from '../components/assistant/StandardRecommendationCard';
import { ConfidenceIndicator } from '../components/assistant/ConfidenceIndicator';
import { RegulatoryStatusCard } from '../components/assistant/RegulatoryStatusCard';
import { CertificationPath } from '../components/assistant/CertificationPath';
import { TestingRequirementsCard } from '../components/assistant/TestingRequirementsCard';
import { EvidenceReferenceCard } from '../components/assistant/EvidenceReferenceCard';
import { ComplianceNextStep } from '../components/assistant/ComplianceNextStep';
import { ResponseFeedback } from '../components/assistant/ResponseFeedback';
import { AIProcessingState } from '../components/assistant/AIProcessingState';
import { AssistantErrorState } from '../components/assistant/AssistantErrorState';
import { InsufficientInformationState } from '../components/assistant/InsufficientInformationState';
import { NoMatchState } from '../components/assistant/NoMatchState';
import { MOCK_CASE_1_RECOMMENDATION } from '../mocks/mockAssistantData';

describe('Structured AI Response Components', () => {
  it('renders ProductUnderstandingCard with extracted product attributes', () => {
    const product = MOCK_CASE_1_RECOMMENDATION.product!;
    render(<ProductUnderstandingCard product={product} />);

    expect(screen.getByText('PRODUCT UNDERSTANDING')).toBeInTheDocument();
    expect(screen.getByText('Stainless Steel Water Bottle')).toBeInTheDocument();
    expect(screen.getAllByText('Domestic Utensils & Food Contact Ware')[0]).toBeInTheDocument();
  });

  it('renders StandardRecommendationCard with progressive disclosure for Why This Standard', () => {
    const std = MOCK_CASE_1_RECOMMENDATION.standards![0];
    const handleViewStandard = vi.fn();
    const handleOpenEvidence = vi.fn();
    const handleStartCompliance = vi.fn();

    render(
      <StandardRecommendationCard
        standard={std}
        onViewStandard={handleViewStandard}
        onOpenEvidence={handleOpenEvidence}
        onStartCompliance={handleStartCompliance}
      />
    );

    expect(screen.getByText('IS 17526:2021')).toBeInTheDocument();
    expect(screen.getByText('POTENTIALLY RELEVANT STANDARD')).toBeInTheDocument();

    // Accordion toggle button
    const disclosureBtn = screen.getByRole('button', { name: /expand relevance explanation/i });
    expect(disclosureBtn).toBeInTheDocument();
    fireEvent.click(disclosureBtn);

    // Now rationale should be visible
    expect(screen.getByText('Domestic storage containers')).toBeInTheDocument();

    // Test actions
    const complianceBtn = screen.getByRole('button', { name: /compliance path/i });
    fireEvent.click(complianceBtn);
    expect(handleStartCompliance).toHaveBeenCalledWith('IS 17526:2021');
  });

  it('renders ConfidenceIndicator with restrained semantic badges', () => {
    const { rerender } = render(<ConfidenceIndicator level="high" size="md" />);
    expect(screen.getByText(/High Relevance/i)).toBeInTheDocument();

    rerender(<ConfidenceIndicator level="needs_verification" size="sm" />);
    expect(screen.getByText(/Needs Verification/i)).toBeInTheDocument();
  });

  it('renders RegulatoryStatusCard with QCO and statutory verification info', () => {
    render(
      <RegulatoryStatusCard
        qcoStatus="Applicable (Mandatory Order)"
        qcoOrderName="Cookware Quality Control Order, 2020"
        verificationStatus="Required prior to manufacture"
        certificationScheme="Scheme I (ISI Mark Scheme)"
      />
    );

    expect(screen.getByText('REGULATORY STATUS')).toBeInTheDocument();
    expect(screen.getByText('Applicable (Mandatory Order)')).toBeInTheDocument();
    expect(screen.getByText('Scheme I (ISI Mark Scheme)')).toBeInTheDocument();
  });

  it('renders CertificationPath with stepper progression', () => {
    const handleNavigate = vi.fn();
    render(<CertificationPath onNavigateCompliance={handleNavigate} />);

    expect(screen.getByText('CERTIFICATION PROGRESSION')).toBeInTheDocument();
    expect(screen.getByText('Standard Identified')).toBeInTheDocument();
    expect(screen.getByText('Laboratory Testing')).toBeInTheDocument();

    const roadmapBtn = screen.getByRole('button', { name: /view full 9-stage statutory roadmap/i });
    fireEvent.click(roadmapBtn);
    expect(handleNavigate).toHaveBeenCalled();
  });

  it('renders TestingRequirementsCard with limits and expand toggle', () => {
    const testing = MOCK_CASE_1_RECOMMENDATION.testing!;
    const handleFindLab = vi.fn();
    render(<TestingRequirementsCard testing={testing} onFindLab={handleFindLab} initialLimit={2} />);

    expect(screen.getByText('TESTING REQUIREMENTS')).toBeInTheDocument();
    expect(screen.getByText('Thermal Insulation Retention Test')).toBeInTheDocument();

    const expandBtn = screen.getByRole('button', { name: /\+ \d+ more testing requirements/i });
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);

    const labBtn = screen.getByRole('button', { name: /find recognized laboratory/i });
    fireEvent.click(labBtn);
    expect(handleFindLab).toHaveBeenCalled();
  });

  it('renders EvidenceReferenceCard distinguishing AI interpretation from official source', () => {
    const handleOpenEvidence = vi.fn();
    render(
      <EvidenceReferenceCard
        citations={MOCK_CASE_1_RECOMMENDATION.citations}
        sources={MOCK_CASE_1_RECOMMENDATION.sources}
        onOpenEvidence={handleOpenEvidence}
      />
    );

    expect(screen.getByText('OFFICIAL EVIDENCE & STATUTORY SOURCES')).toBeInTheDocument();
    expect(screen.getByText(/AI Interpretation:/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Source:/i)).toBeInTheDocument();

    const viewEvidenceBtns = screen.getAllByRole('button', { name: /view evidence/i });
    expect(viewEvidenceBtns.length).toBeGreaterThan(0);
    fireEvent.click(viewEvidenceBtns[0]);
    expect(handleOpenEvidence).toHaveBeenCalled();
  });

  it('renders ComplianceNextStep action banner', () => {
    const handleJourney = vi.fn();
    const handleLab = vi.fn();
    render(
      <ComplianceNextStep
        standardNumber="IS 17526:2021"
        onContinueJourney={handleJourney}
        onFindLaboratory={handleLab}
      />
    );

    expect(screen.getByText(/Begin formal statutory roadmap for IS 17526:2021/i)).toBeInTheDocument();
    const journeyBtn = screen.getByRole('button', { name: /continue compliance journey/i });
    fireEvent.click(journeyBtn);
    expect(handleJourney).toHaveBeenCalled();
  });

  it('renders ResponseFeedback and handles helpful/unhelpful rating and discrepancy dialog', () => {
    render(<ResponseFeedback />);

    expect(screen.getByText(/Was this helpful\?/i)).toBeInTheDocument();
    const yesBtn = screen.getByRole('button', { name: /mark response as helpful/i });
    fireEvent.click(yesBtn);
    expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();

    const reportTrigger = screen.getByRole('button', { name: /report discrepancy/i });
    fireEvent.click(reportTrigger);
    expect(screen.getByText('Report Discrepancy')).toBeInTheDocument();
  });

  it('renders AIProcessingState with stage progression', () => {
    render(<AIProcessingState />);
    expect(screen.getByText(/BIS Copilot Compliance Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Understanding product description/i)).toBeInTheDocument();
  });

  it('renders AssistantErrorState with retry action', () => {
    const handleRetry = vi.fn();
    render(<AssistantErrorState onRetry={handleRetry} message="Timeout connecting to BIS gateway" />);
    expect(screen.getByText(/WE COULDN'T COMPLETE THIS REQUEST/i)).toBeInTheDocument();
    expect(screen.getByText(/Timeout connecting to BIS gateway/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalled();
  });

  it('renders InsufficientInformationState with helpful actions', () => {
    const handleRefine = vi.fn();
    render(<InsufficientInformationState onRefine={handleRefine} />);
    expect(screen.getByText(/MORE INFORMATION NEEDED/i)).toBeInTheDocument();
    const refineBtn = screen.getByRole('button', { name: /refine product description/i });
    fireEvent.click(refineBtn);
    expect(handleRefine).toHaveBeenCalled();
  });

  it('renders NoMatchState without guessing or hallucinating standards', () => {
    const handleSearch = vi.fn();
    render(<NoMatchState onSearchStandards={handleSearch} />);
    expect(screen.getByText(/NO RELIABLE MATCH FOUND/i)).toBeInTheDocument();
    const searchBtn = screen.getByRole('button', { name: /search standards/i });
    fireEvent.click(searchBtn);
    expect(handleSearch).toHaveBeenCalled();
  });
});
