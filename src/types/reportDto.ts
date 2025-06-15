
export interface MediaByType {
  photos: MediaItem[];
  videos: MediaItem[];
  audios: MediaItem[];
  files: MediaItem[];
}

export interface MediaItem {
  url: string;
  questionNumber: number;
  questionText: string;
  fileName: string;
  mimeType: string;
  qrCode?: string;
}

export interface InspectionSummary {
  conformityPercent: number;
  totalNc: number;
  totalMedia: number;
  totalQuestions: number;
  completedQuestions: number;
}

export interface ActionPlanItem {
  questionNumber: number;
  questionText: string;
  nonConformity: string;
  action: string;
  responsible: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReportDTO {
  inspection: {
    id: string;
    companyName: string;
    checklistTitle: string;
    location?: string;
    scheduledDate?: string;
    createdAt: string;
    status: string;
    description?: string;
  };
  inspector: {
    name: string;
    email?: string;
  };
  summary: InspectionSummary;
  responses: {
    questionNumber: number;
    questionText: string;
    answer: string;
    comments?: string;
    isCompliant: boolean;
  }[];
  actionPlan: ActionPlanItem[];
  mediaByType: MediaByType;
  signatures: {
    inspectorSignature?: string;
    companySignature?: string;
    signedAt?: string;
  };
}
