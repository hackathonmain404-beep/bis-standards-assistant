import React from 'react';
import { TestingRequirement, TestingRequirementStatus } from '../../types/compliance';
import { Badge } from '../common/Badge';

export interface TestingRequirementsTableProps {
  tests: TestingRequirement[];
  onOpenEvidence?: (clause: string) => void;
}

export const TestingRequirementsTable: React.FC<TestingRequirementsTableProps> = ({
  tests,
  onOpenEvidence,
}) => {
  const getStatusBadge = (status: TestingRequirementStatus) => {
    switch (status) {
      case 'mandatory':
        return <Badge variant="error" size="sm">Mandatory</Badge>;
      case 'conditional':
        return <Badge variant="warning" size="sm">Conditional</Badge>;
      case 'optional':
        return <Badge variant="info" size="sm">Optional</Badge>;
      default:
        return <Badge variant="default" size="sm">Unspecified</Badge>;
    }
  };

  return (
    <div className="bis-table-responsive">
      <table className="bis-table bis-testing-table">
        <thead>
          <tr>
            <th scope="col">Test Protocol</th>
            <th scope="col">Technical Requirement</th>
            <th scope="col">Mandatory / Conditional</th>
            <th scope="col">Standard Clause</th>
            <th scope="col">Acceptance Criteria</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test.id}>
              <td>
                <strong>{test.test_name}</strong>
              </td>
              <td>{test.requirement_description}</td>
              <td>{getStatusBadge(test.status)}</td>
              <td>
                {test.standard_clause && (
                  <button
                    type="button"
                    className="bis-clause-link-btn"
                    onClick={() => onOpenEvidence && onOpenEvidence(test.standard_clause)}
                  >
                    <code>{test.standard_clause}</code>
                  </button>
                )}
              </td>
              <td>
                <span className="bis-criteria-text">
                  {test.acceptance_criteria || 'Conformity with table limits'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
