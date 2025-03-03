
export type ChecklistItemType = 
  | "sim/não" 
  | "numérico" 
  | "texto" 
  | "foto" 
  | "assinatura" 
  | "seleção múltipla";

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: ChecklistItemType;
  obrigatorio: boolean;
  ordem: number;
  opcoes?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface NewChecklistItem {
  checklist_id: string;
  pergunta: string;
  tipo_resposta: ChecklistItemType;
  obrigatorio: boolean;
  ordem: number;
  opcoes?: string[] | null;
}
