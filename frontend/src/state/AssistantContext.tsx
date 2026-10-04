import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatMessage, StructuredAIResponse, UserMode } from '../types/assistant';
import { Citation, SourceReference } from '../types/evidence';
import { assistantApi } from '../services/assistantApi';
import { useLanguage } from './LanguageContext';
import { useCompliance } from './ComplianceContext';

interface AssistantContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingStage: string;
  error: string | null;
  currentSessionId: string | null;
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  activeEvidence: Citation | SourceReference | null;
  isEvidenceDrawerOpen: boolean;
  openEvidence: (evidence: Citation | SourceReference) => void;
  closeEvidence: () => void;
  sendMessage: (text: string) => Promise<void>;
  submitClarification: (fields: Record<string, string>) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  newSession: () => void;
  loadMockCase: (caseNumber: number) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const { updateRoadmapFromAssistant } = useCompliance();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('industry');
  const [activeEvidence, setActiveEvidence] = useState<Citation | SourceReference | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  const openEvidence = (evidence: Citation | SourceReference) => {
    setActiveEvidence(evidence);
    setIsEvidenceDrawerOpen(true);
  };

  const closeEvidence = () => {
    setIsEvidenceDrawerOpen(false);
  };

  const newSession = () => {
    setMessages([]);
    setError(null);
    setCurrentSessionId(null);
    setIsEvidenceDrawerOpen(false);
    setActiveEvidence(null);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    setLastUserMessage(text);

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingStage('Searching BIS knowledge base...');

    try {
      const apiResp = await assistantApi.sendMessage({
        session_id: currentSessionId,
        message: text.trim(),
        language,
        mode: userMode,
      });

      setCurrentSessionId(apiResp.session_id);

      // Structure copilot response
      const structuredData: StructuredAIResponse | undefined =
        apiResp.response.structured_copilot || {
          query: text,
          answer: apiResp.response.text,
          intent: apiResp.response.intent || 'GENERAL_QUERY',
          citations: apiResp.response.citations,
          needs_clarification: apiResp.response.needs_clarification,
          clarification_questions: apiResp.response.clarification_questions,
          follow_up_suggestions: apiResp.response.follow_up_suggestions,
          evidence_status: apiResp.response.citations && apiResp.response.citations.length > 0 ? 'strong' : 'needs_verification',
        };

      const assistantMsg: ChatMessage = {
        id: apiResp.message_id || 'ast-' + Date.now(),
        role: 'assistant',
        content: apiResp.response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredData,
        intent: apiResp.response.intent,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Update compliance journey if standards were recommended
      if (structuredData?.standards && structuredData.standards.length > 0) {
        updateRoadmapFromAssistant(structuredData.standards.map((s) => s.standard_number));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred while communicating with the assistant.';
      setError(msg);

      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'system',
        content: msg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        errorMessage: msg,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  const submitClarification = async (fields: Record<string, string>) => {
    const formattedAnswers = Object.entries(fields)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const combinedQuery = `Details provided: ${formattedAnswers}`;
    await sendMessage(combinedQuery);
  };

  const retryLastMessage = async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage);
    }
  };

  const loadMockCase = (caseNumber: number) => {
    switch (caseNumber) {
      case 1:
        sendMessage('I manufacture stainless steel water bottles for household use. Which BIS standards should I look at?');
        break;
      case 2:
        sendMessage('I want to get a BIS mark for my electric heater.');
        break;
      case 3:
        sendMessage('Which standard applies to domestic electric iron?');
        break;
      case 4:
        sendMessage('What is the BIS standard for quantum computing cryogenic dilution refrigerators?');
        break;
      case 5:
        sendMessage('simulate error');
        break;
      default:
        break;
    }
  };

  const value: AssistantContextType = {
    messages,
    isLoading,
    loadingStage,
    error,
    currentSessionId,
    userMode,
    setUserMode,
    activeEvidence,
    isEvidenceDrawerOpen,
    openEvidence,
    closeEvidence,
    sendMessage,
    submitClarification,
    retryLastMessage,
    newSession,
    loadMockCase,
  };

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
};

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
