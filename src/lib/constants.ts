
export const QUESTION_TYPES = [
  { value: "sim/não", label: "Sim/Não" },
  { value: "texto", label: "Texto" },
  { value: "seleção múltipla", label: "Múltipla Escolha" },
  { value: "numérico", label: "Numérico" },
  { value: "foto", label: "Foto" },
  { value: "assinatura", label: "Assinatura" },
  { value: "hora", label: "Hora" },
  { value: "data", label: "Data" }
] as const;

export type QuestionType = typeof QUESTION_TYPES[number]["value"];

export const RESPONSE_TYPE_MAP = {
  frontend: {
    "sim/não": "Sim/Não",
    "texto": "Texto",
    "seleção múltipla": "Múltipla Escolha",
    "numérico": "Numérico",
    "foto": "Foto", 
    "assinatura": "Assinatura",
    "hora": "Hora",
    "data": "Data"
  },
  database: {
    "sim/não": "sim/não",
    "texto": "texto",
    "seleção múltipla": "seleção múltipla",
    "numérico": "numérico",
    "foto": "foto",
    "assinatura": "assinatura", 
    "hora": "hora",
    "data": "data"
  }
} as const;

export const MEDIA_PERMISSIONS = [
  { key: "allowsPhoto", label: "Imagem", icon: "Image" },
  { key: "allowsVideo", label: "Vídeo", icon: "Video" },
  { key: "allowsAudio", label: "Áudio", icon: "Mic" },
  { key: "allowsFiles", label: "Anexo", icon: "FileText" }
] as const;
