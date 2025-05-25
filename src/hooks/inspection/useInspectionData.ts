
import { useState, useEffect } from "react";

// Define Question interface locally since it's not exported from types/inspection
interface Question {
  id: string;
  text: string;
  responseType: string;
  isRequired: boolean;
  order: number;
  weight?: number;
  allowsPhoto?: boolean;
  allowsVideo?: boolean;
  allowsAudio?: boolean;
  allowsFiles?: boolean;
  groupId?: string;
  hint?: string;
  options?: string[];
  condition?: string;
  conditionValue?: string;
  parentQuestionId?: string;
  hasSubChecklist?: boolean;
  subChecklistId?: string;
}

export interface InspectionData {
  loading: boolean;
  error: string;
  detailedError: any;
  inspection: any;
  questions: Question[];
  groups: any[];
  responses: Record<string, any>;
  company: any;
  responsible: any;
  subChecklists: Record<string, any>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  refreshData: () => void;
}

export function useInspectionData(inspectionId: string): InspectionData {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailedError, setDetailedError] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [company, setCompany] = useState<any>(null);
  const [responsible, setResponsible] = useState<any>(null);
  const [subChecklists, setSubChecklists] = useState<Record<string, any>>({});

  const refreshData = () => {
    // Implement data refresh logic
    setLoading(true);
    // Mock implementation
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (!inspectionId) {
      setLoading(false);
      return;
    }

    // Mock data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [inspectionId]);

  return {
    loading,
    error,
    detailedError,
    inspection,
    questions,
    groups,
    responses,
    company,
    responsible,
    subChecklists,
    setResponses,
    refreshData
  };
}
