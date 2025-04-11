
export interface UiGroup {
  id: string;
  title: string;
  order: number;
  questions: UiQuestion[];
}

export interface UiQuestion {
  id: string;
  text: string;
  responseType: string;
  order: number;
  isRequired: boolean;
  groupId?: string | null;
  allowsPhoto: boolean;
  allowsVideo: boolean;
  allowsAudio: boolean;
  options?: string[];
  weight: number;
  parentId?: string | null;
  conditionValue?: string | null;
  hasSubChecklist?: boolean;
  subChecklistId?: string | null;
}
