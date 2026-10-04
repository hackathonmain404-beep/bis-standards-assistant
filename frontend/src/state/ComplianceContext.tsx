import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChecklistItem, RoadmapStep, RoadmapStepId } from '../types/compliance';
import { INITIAL_CHECKLIST_ITEMS, INITIAL_ROADMAP_STEPS } from '../mocks/mockCertificationData';
import { storage } from '../utils/storage';

interface ComplianceContextType {
  roadmapSteps: RoadmapStep[];
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  activeStep: RoadmapStepId | null;
  setActiveStep: (step: RoadmapStepId | null) => void;
  updateRoadmapFromAssistant: (standards: string[]) => void;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export const ComplianceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>(INITIAL_ROADMAP_STEPS);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    return storage.getChecklist(INITIAL_CHECKLIST_ITEMS);
  });
  const [activeStep, setActiveStep] = useState<RoadmapStepId | null>(null);

  useEffect(() => {
    storage.saveChecklist(checklist);
  }, [checklist]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const updateRoadmapFromAssistant = (standards: string[]) => {
    if (standards.length > 0) {
      setRoadmapSteps((prev) =>
        prev.map((step) => {
          if (step.id === 'standard') {
            return {
              ...step,
              status: 'completed',
              details: `Identified standard: ${standards.join(', ')}`,
            };
          }
          return step;
        })
      );
    }
  };

  const value: ComplianceContextType = {
    roadmapSteps,
    checklist,
    toggleChecklistItem,
    activeStep,
    setActiveStep,
    updateRoadmapFromAssistant,
  };

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
};

export const useCompliance = (): ComplianceContextType => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};
