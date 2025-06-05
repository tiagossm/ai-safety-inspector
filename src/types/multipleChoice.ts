
export interface ChecklistItemOption {
  id: string;
  item_id: string;
  option_text: string;
  option_value?: string;
  sort_order: number;
  score?: number;
  is_correct?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  text: string;
  responseType: 'multiple_choice' | 'dropdown' | 'rating' | 'checkboxes';
  isRequired: boolean;
  options: ChecklistItemOption[];
  allowsMultiple?: boolean;
  hasScoring?: boolean;
  showCorrectAnswer?: boolean;
}

export interface MultipleChoiceResponse {
  selectedOptions: string[];
  score?: number;
  isCorrect?: boolean;
}
