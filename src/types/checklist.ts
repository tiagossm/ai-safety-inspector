
export interface CollaboratorType {
  id: string;
  name: string;
  avatar: string;
  email: string;
  initials?: string;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  is_template: boolean;
  status_checklist: "ativo" | "inativo";
  category: string;
  responsible_id?: string | null;
  responsible_name?: string;
  company_id?: string | null;
  company_name?: string;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  due_date?: string | null;
  items?: number;
  items_completed?: number;
  collaborators?: CollaboratorType[];
  permissions?: string[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  pergunta: string;
  tipo_resposta: "sim/não" | "numérico" | "texto" | "foto" | "assinatura" | "seleção múltipla" | "localização" | "arquivo";
  obrigatorio: boolean;
  opcoes: string[] | null;
  ordem: number;
  resposta?: string | number | boolean | null;
  permite_audio: boolean;
  permite_video: boolean;
  permite_foto: boolean;
  condicao?: {
    pergunta_dependente_id: string;
    valor_para_exibir: string | boolean | number;
  } | null;
}

export interface NewChecklist {
  title: string;
  description?: string;
  is_template?: boolean;
  status_checklist?: string;
  category?: string;
  responsible_id?: string | null;
  company_id?: string | null;
  due_date?: string | null;
  user_id?: string | null;
}

export interface ChecklistExecution {
  id: string;
  checklist_id: string;
  executed_by: string;
  start_time: string;
  end_time?: string;
  status: "em_andamento" | "concluido" | "cancelado";
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  responses: ChecklistResponse[];
}

export interface ChecklistResponse {
  id: string;
  execution_id: string;
  item_id: string;
  resposta: string | number | boolean | null;
  observacao?: string;
  media_urls?: string[];
  created_at: string;
}
